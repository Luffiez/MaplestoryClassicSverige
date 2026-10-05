import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { AuthUser } from '../../models/auth.model';
import { environment } from '../../../environments/environment';
import { MOCK_AUTH_USER } from '../../mocks/mock-users';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly DISCORD_CLIENT_ID = '1545334393059409952';
    private readonly REDIRECT_URI = environment.discordRedirectUri;
    private readonly DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
    private readonly BACKEND_URL = environment.backendUrl;
    private readonly TOKEN_KEY = 'discord_auth_token';
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    isAuthenticated = signal(false);
    user = signal<AuthUser | null>(null);
    authToken = signal<string | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        if (environment.devMode) {
            this.useMockAuth();
        } else {
            this.loadStoredAuth();
        }
    }

    private useMockAuth(): void {
        this.authToken.set('local-development-token');
        this.user.set(MOCK_AUTH_USER);
        this.isAuthenticated.set(true);
    }

    private loadStoredAuth(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
            this.authToken.set(token);
            this.isAuthenticated.set(true);
            this.loadCurrentUser();
        }
    }

    private loadCurrentUser(): void {
        this.http.get<AuthUser>(`${this.BACKEND_URL}/api/auth/me`, {
            headers: this.getAuthHeader()
        }).subscribe({
            next: user => {
                this.user.set(user);
                this.startPresenceHeartbeat();
            },
            error: () => this.clearAuth()
        });
    }

    private startPresenceHeartbeat(): void {
        if (environment.devMode || this.heartbeatTimer !== null) {
            return;
        }

        this.sendPresenceHeartbeat();
        this.heartbeatTimer = setInterval(() => this.sendPresenceHeartbeat(), 30_000);
    }

    private sendPresenceHeartbeat(): void {
        this.http.post<void>(`${this.BACKEND_URL}/api/users/me/heartbeat`, null, {
            headers: this.getAuthHeader()
        }).subscribe({
            error: error => console.error('Could not update online presence.', error)
        });
    }

    loginWithDiscord(): void {
        if (environment.devMode) {
            this.useMockAuth();
            this.router.navigate(['/home']);
            return;
        }

        const params = new URLSearchParams({
            client_id: this.DISCORD_CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email',
        });

        window.location.href = `${this.DISCORD_AUTH_URL}?${params.toString()}`;
    }

    exchangeCodeForToken(code: string): Observable<{ token: string }> {
        if (environment.devMode) {
            this.useMockAuth();
            return of({ token: this.authToken()! });
        }

        return this.http.post<{ token: string }>(
            `${this.BACKEND_URL}/api/auth/discord`,
            { code, redirectUri: this.REDIRECT_URI }
        ).pipe(
            switchMap(response =>
                this.http.get<AuthUser>(`${this.BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${response.token}` }
                }).pipe(
                    tap(user => {
                        this.authToken.set(response.token);
                        this.user.set(user);
                        this.isAuthenticated.set(true);
                        localStorage.setItem(this.TOKEN_KEY, response.token);
                        this.startPresenceHeartbeat();
                    }),
                    map(() => response)
                )
            ),
            tap({ error: () => this.clearAuth() })
        );
    }

    logout(): void {
        this.clearAuth();
        this.router.navigate(['/']);
    }

    private clearAuth(): void {
        if (this.heartbeatTimer !== null) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        this.authToken.set(null);
        this.user.set(null);
        this.isAuthenticated.set(false);
        localStorage.removeItem(this.TOKEN_KEY);
    }

    getAuthToken(): string | null {
        return this.authToken();
    }

    getAuthHeader(): { Authorization: string } | {} {
        const token = this.authToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}
