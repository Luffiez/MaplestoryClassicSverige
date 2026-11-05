import { Injectable, inject } from '@angular/core';
import { Observable, defer, of, shareReplay, switchMap, throwError, map } from 'rxjs';
import { Character, User } from '../models/player.model';
import { PlayerService } from './player.service';

export interface LeaderboardEntry {
    player: User;
    character: Character;
}

@Injectable({
    providedIn: 'root'
})
export class LeaderboardService {
    private readonly playerService = inject(PlayerService);
    private readonly pageSize = 100;
    private readonly topCharactersRequest = defer(() => this.loadUsers(0, [])).pipe(
        map(users => users.flatMap(player => {
            const character = player.characters.reduce<Character | null>(
                (highest, current) => highest === null || current.level > highest.level ? current : highest,
                null
            );
            return character ? [{ player, character }] : [];
        }).sort((a, b) => b.character.level - a.character.level).slice(0, 3)),
        shareReplay({ bufferSize: 1, refCount: false })
    );

    getTopCharacters(): Observable<LeaderboardEntry[]> {
        return this.topCharactersRequest;
    }

    private loadUsers(offset: number, accumulatedUsers: User[]): Observable<User[]> {
        return this.playerService.getUsers(offset, this.pageSize).pipe(
            switchMap(response => {
                const users = [...accumulatedUsers, ...response.items];
                const nextOffset = offset + response.items.length;

                if (nextOffset < response.totalCount && response.items.length > 0) {
                    return this.loadUsers(nextOffset, users);
                }

                if (nextOffset < response.totalCount) {
                    return throwError(() => new Error('Kunde inte läsa in alla spelare. Försök igen senare.'));
                }

                return of(users);
            })
        );
    }
}
