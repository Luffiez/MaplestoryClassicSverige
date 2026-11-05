import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';

@Component({
    selector: 'app-leaderboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgOptimizedImage],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
    private readonly leaderboardService = inject(LeaderboardService);

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
        this.leaderboardService.getTopCharacters().subscribe({
            next: (entries) => {
                this.leaders.set(entries);
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
