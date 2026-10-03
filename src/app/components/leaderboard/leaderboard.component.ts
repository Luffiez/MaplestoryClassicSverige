import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Character, User } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

interface LeaderboardEntry {
    player: User;
    character: Character;
}

@Component({
    selector: 'app-leaderboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgOptimizedImage],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
    private readonly playerService = inject(PlayerService);
    private readonly pageSize = 100;

    protected readonly podiumPlaces = [0, 1, 2];
    protected readonly leaders = signal<LeaderboardEntry[]>([]);
    protected readonly isLoading = signal(true);
    protected readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadPlayers();
    }

    protected loadPlayers(): void {
        this.leaders.set([]);
        this.error.set(null);
        this.isLoading.set(true);
        this.loadPage(0, []);
    }

    private loadPage(offset: number, accumulatedUsers: User[]): void {
        this.playerService.getUsers(offset, this.pageSize).subscribe({
            next: (response) => {
                const users = [...accumulatedUsers, ...response.items];
                const nextOffset = offset + response.items.length;

                if (nextOffset < response.totalCount && response.items.length > 0) {
                    this.loadPage(nextOffset, users);
                    return;
                }

                if (nextOffset < response.totalCount) {
                    this.error.set('Kunde inte läsa in alla spelare. Försök igen senare.');
                    this.isLoading.set(false);
                    return;
                }

                const entries = users.flatMap((player) => {
                    const character = player.characters.reduce<Character | null>(
                        (highest, current) => highest === null || current.level > highest.level ? current : highest,
                        null
                    );
                    return character ? [{ player, character }] : [];
                });

                this.leaders.set(entries.sort((a, b) => b.character.level - a.character.level).slice(0, 3));
                this.isLoading.set(false);
            },
            error: (err: unknown) => {
                const message = err instanceof Error ? err.message : 'Försök igen senare.';
                this.error.set(`Kunde inte ladda topplistan. ${message}`);
                this.isLoading.set(false);
            }
        });
    }
}
