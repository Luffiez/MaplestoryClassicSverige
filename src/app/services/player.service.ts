import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, PaginatedResponse } from '../models/player.model';
import { AuthService } from './auth/auth.service';

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
        return this.http.get<User>(`${this.apiUrl}/${discordUserId}`, {
            headers: this.getHeaders()
        });
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`, {
            headers: this.getHeaders()
        });
    }
}
