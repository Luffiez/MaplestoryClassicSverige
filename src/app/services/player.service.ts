import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, retry, switchMap, throwError, timer } from 'rxjs';
import { CharacterLevelHistoryEntry, DailyLevelUp, User, UserSummary, UserStats, PaginatedResponse, PartyListResponse, CharacterLevelUp } from '../models/player.model';
import { AuthService } from './auth/auth.service';
import { environment } from '../../environments/environment';
import { MOCK_AUTH_USER, MOCK_CHARACTER_LEVEL_HISTORY, MOCK_USERS } from '../mocks/mock-users';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private apiUrl = `${environment.backendUrl}/api/users`;

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

    private retryTransientErrors<T>(request: Observable<T>): Observable<T> {
        return request.pipe(
            retry({
                count: 2,
                delay: (error, retryCount) => {
                    if (!(error instanceof HttpErrorResponse) || (error.status !== 0 && error.status < 500)) {
                        return throwError(() => error);
                    }

                    return timer(retryCount * 1_000);
                }
            })
        );
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

        return this.retryTransientErrors(this.http.get<PaginatedResponse<User>>(url, {
            headers: this.getHeaders()
        }));
    }

    getUserSummary(): Observable<UserSummary> {
        if (environment.devMode) {
            const jobs = Array.from(new Set(MOCK_USERS.flatMap(user => user.characters.map(character => character.job.trim())).filter(job => job.length > 0)));
            const topUserIds = MOCK_USERS
                .map(user => ({ id: user.id, level: Math.max(0, ...user.characters.map(character => character.level)) }))
                .sort((a, b) => b.level - a.level)
                .slice(0, 3)
                .map(entry => entry.id);
            return of({ jobs, topUserIds });
        }

        return this.retryTransientErrors(this.http.get<UserSummary>(`${this.apiUrl}/summary`, {
            headers: this.getHeaders()
        }));
    }

    getUserStats(): Observable<UserStats> {
        if (environment.devMode) {
            const characters = MOCK_USERS.flatMap(user => user.characters);
            const levels = characters.map(character => character.level).sort((a, b) => a - b);
            const middle = Math.floor(levels.length / 2);
            const classCounts = new Map<string, number>();
            characters.forEach(character => classCounts.set(character.class, (classCounts.get(character.class) ?? 0) + 1));

            return of({
                totalUsers: MOCK_USERS.length,
                totalCharacters: characters.length,
                classCounts: [...classCounts].map(([characterClass, count]) => ({ class: characterClass, count })),
                maxLevel: levels.length ? levels[levels.length - 1] : null,
                minLevel: levels.length ? levels[0] : null,
                medianLevel: levels.length
                    ? levels.length % 2 ? levels[middle] : (levels[middle - 1] + levels[middle]) / 2
                    : null
            });
        }

        return this.retryTransientErrors(this.http.get<UserStats>(`${this.apiUrl}/stats`, {
            headers: this.getHeaders()
        }));
    }

    getDailyLevelUps(days: number): Observable<DailyLevelUp[]> {
        if (environment.devMode) {
            const today = new Date();
            return of(Array.from({ length: days }, (_, offset) => {
                const date = new Date(today);
                date.setDate(today.getDate() - (days - 1 - offset));
                const levelUps = (offset * 7) % 9;
                return {
                    date: date.toISOString().slice(0, 10),
                    levelUps,
                    activeCharacters: Math.max(0, levelUps - 1)
                };
            }));
        }

        return this.retryTransientErrors(this.http.get<DailyLevelUp[]>(`${this.apiUrl}/stats/history`, {
            headers: this.getHeaders(),
            params: { days }
        }));
    }

    getOnlineUserIds(): Observable<string[]> {
        if (environment.devMode) {
            return of([MOCK_AUTH_USER.id]);
        }

        return this.http.get<string[]>(`${this.apiUrl}/online`, {
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

    getParties(): Observable<PartyListResponse> {
        if (environment.devMode) {
            const maps = [
                { mapName: 'Sleepywood', monsters: [{ name: 'Zombie Mushroom', level: 24, iconUrl: 'https://meowdb.com/msclassic/monsters/sprites/mob_21.png' }, { name: 'Horny Mushroom', level: 25, iconUrl: null }], members: MOCK_USERS.slice(0, 2).map(user => ({ discordUserId: user.discordUserId, discordUsername: user.discordUsername ?? null, characterName: user.characters[0]?.characterName ?? user.discordUserId, isPrimaryCharacter: true, level: user.characters[0]?.level ?? 0, class: user.characters[0]?.class ?? '', job: user.characters[0]?.job ?? '' })) },
                { mapName: 'Henesys Hunting Ground', monsters: [{ name: 'Orange Mushroom', level: 8, iconUrl: null }], members: MOCK_USERS.slice(2, 3).map(user => ({ discordUserId: user.discordUserId, discordUsername: user.discordUsername ?? null, characterName: user.characters[0]?.characterName ?? user.discordUserId, isPrimaryCharacter: true, level: user.characters[0]?.level ?? 0, class: user.characters[0]?.class ?? '', job: user.characters[0]?.job ?? '' })) }
            ];
            return of({ maps, totalMaps: maps.length, totalMembers: maps.reduce((sum, map) => sum + map.members.length, 0) });
        }

        return this.retryTransientErrors(this.http.get<PartyListResponse>(`${environment.backendUrl}/api/parties`, {
            headers: this.getHeaders()
        }));
    }

    getNewestUser(): Observable<User | null> {
        return this.getUsers(0, 1).pipe(
            switchMap(first => first.totalCount === 0
                ? of(null)
                : this.getUsers(first.totalCount - 1, 1).pipe(
                    switchMap(last => of(last.items[0] ?? null))
                ))
        );
    }

    getRecentLevelUps(limit = 3): Observable<CharacterLevelUp[]> {
        if (environment.devMode) {
            const levelUps = MOCK_CHARACTER_LEVEL_HISTORY
                .filter(entry => MOCK_CHARACTER_LEVEL_HISTORY.some(previous =>
                    previous.characterId === entry.characterId
                    && previous.recordedAt < entry.recordedAt
                    && previous.level < entry.level))
                .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
                .slice(0, limit)
                .map(entry => {
                    const previous = MOCK_CHARACTER_LEVEL_HISTORY
                        .filter(candidate => candidate.characterId === entry.characterId
                            && candidate.recordedAt < entry.recordedAt
                            && candidate.level < entry.level)
                        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
                    return {
                        characterId: entry.characterId,
                        characterName: entry.characterName,
                        previousLevel: previous.level,
                        level: entry.level,
                        recordedAt: entry.recordedAt
                    };
                });
            return of(levelUps);
        }

        return this.retryTransientErrors(this.http.get<CharacterLevelUp[]>(
            `${environment.backendUrl}/api/characters/level-history/recent?limit=${limit}`,
            { headers: this.getHeaders() }
        ));
    }

    getCharacterLevelHistory(characterId: number): Observable<CharacterLevelHistoryEntry[]> {
        if (environment.devMode) {
            return of(MOCK_CHARACTER_LEVEL_HISTORY
                .filter(entry => entry.characterId === characterId)
                .map(({ id, characterId: entryCharacterId, level, recordedAt }) => ({ id, characterId: entryCharacterId, level, recordedAt })));
        }

        return this.retryTransientErrors(this.http.get<CharacterLevelHistoryEntry[]>(
            `${environment.backendUrl}/api/characters/${characterId}/level-history`,
            { headers: this.getHeaders() }
        ));
    }

    getCurrentUser(): Observable<User> {
        if (environment.devMode) {
            return of(MOCK_USERS.find(user => user.discordUserId === MOCK_AUTH_USER.id)!);
        }

        return this.http.get<User>(`${this.apiUrl}/me`, {
            headers: this.getHeaders()
        });
    }

    getUserNickname(discordUserId: string): Observable<{ nickname: string | null }> {
        if (environment.devMode) {
            return of({ nickname: null });
        }

        return this.http.get<{ nickname: string | null }>(
            `${this.apiUrl}/${encodeURIComponent(discordUserId)}/nickname`,
            {
                headers: this.getHeaders()
            }
        );
    }
}
