import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { User, PaginatedResponse } from '../models/player.model';
import { AuthService } from './auth/auth.service';
import { environment } from '../../environments/environment';
import { MOCK_AUTH_USER, MOCK_USERS } from '../mocks/mock-users';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private apiUrl = 'http://localhost:5184/api/users';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        const token = this.authService.getAuthToken();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    getUsers(offset?: number, limit?: number): Observable<PaginatedResponse<User>> {
        if (environment.devMode) {
            const start = offset ?? 0;
            const pageSize = limit ?? MOCK_USERS.length;
            return of({
                items: MOCK_USERS.slice(start, start + pageSize),
                offset: start,
                limit: pageSize,
                totalCount: MOCK_USERS.length
            });
        }

        let url = this.apiUrl;
        const params = new URLSearchParams();

        if (offset !== undefined) {
            params.append('offset', offset.toString());
        }
        if (limit !== undefined) {
            params.append('limit', limit.toString());
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http.get<PaginatedResponse<User>>(url, {
            headers: this.getHeaders()
        });
    }

    getUser(discordUserId: string | number): Observable<User> {
        if (environment.devMode) {
            const user = MOCK_USERS.find(candidate => candidate.discordUserId === discordUserId.toString());
            return user
                ? of(user)
                : throwError(() => new Error(`Mock user ${discordUserId} was not found.`));
        }

        return this.http.get<User>(`${this.apiUrl}/${discordUserId}`, {
            headers: this.getHeaders()
        });
    }

    getCurrentUser(): Observable<User> {
        if (environment.devMode) {
            return of(MOCK_USERS.find(user => user.discordUserId === MOCK_AUTH_USER.id)!);
        }

        return this.http.get<User>(`${this.apiUrl}/me`, {
            headers: this.getHeaders()
        });
    }
}
