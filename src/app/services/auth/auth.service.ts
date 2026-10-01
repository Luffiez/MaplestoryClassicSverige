import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthToken, AuthUser } from '../../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly DISCORD_CLIENT_ID = '1545334393059409952';
    private readonly REDIRECT_URI = 'http://localhost:4200/auth/callback';
    private readonly DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize';
    private readonly BACKEND_URL = 'http://localhost:5184';
    private readonly TOKEN_KEY = 'discord_auth_token';

    isAuthenticated = signal(false);
    user = signal<AuthUser | null>(null);
    authToken = signal<string | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredAuth();
    }

    private loadStoredAuth(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
            this.authToken.set(token);
            this.isAuthenticated.set(true);
        }
    }

    loginWithDiscord(): void {
        const params = new URLSearchParams({
            client_id: this.DISCORD_CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email',
        });

        window.location.href = `${this.DISCORD_AUTH_URL}?${params.toString()}`;
    }

    exchangeCodeForToken(code: string): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(
            `${this.BACKEND_URL}/api/auth/discord`,
            { code, redirectUri: this.REDIRECT_URI }
        ).pipe(
            tap(response => {
                this.authToken.set(response.token);
                this.isAuthenticated.set(true);
                localStorage.setItem(this.TOKEN_KEY, response.token);
            })
        );
    }

    logout(): void {
        this.authToken.set(null);
        this.user.set(null);
        this.isAuthenticated.set(false);
        localStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/']);
    }

    getAuthToken(): string | null {
        return this.authToken();
    }

    getAuthHeader(): { Authorization: string } | {} {
        const token = this.authToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}
