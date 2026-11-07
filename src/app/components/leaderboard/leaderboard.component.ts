import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';
import { getJobIconUrl } from '../../job-icon';

@Component({
    selector: 'app-leaderboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgOptimizedImage, RouterLink],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
    private readonly leaderboardService = inject(LeaderboardService);

    protected readonly podiumPlaces = [0, 1, 2];
    protected readonly getJobIcon = getJobIconUrl;
    private readonly rankedEntries = signal<LeaderboardEntry[]>([]);
    private readonly allEntries = signal<LeaderboardEntry[]>([]);
    protected readonly selectedClass = signal('');
    protected readonly classOptions = computed(() => [
        ...new Set(this.allEntries().map(entry => entry.character.class.trim()).filter(Boolean))
    ].sort((a, b) => a.localeCompare(b, 'sv')));
    protected readonly leaders = computed(() => {
        const characterClass = this.selectedClass();
        if (!characterClass) {
            return this.rankedEntries();
        }
        return this.allEntries().filter(entry => entry.character.class.trim() === characterClass);
    });
    protected readonly isLoading = signal(true);
    protected readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadPlayers();
    }

    protected selectClass(characterClass: string): void {
        this.selectedClass.set(characterClass);
    }

    protected loadPlayers(): void {
        this.rankedEntries.set([]);
        this.allEntries.set([]);
        this.error.set(null);
        this.isLoading.set(true);
        forkJoin({
            ranked: this.leaderboardService.getRankedCharacters(),
            all: this.leaderboardService.getAllCharacters()
        }).subscribe({
            next: ({ ranked, all }) => {
                this.rankedEntries.set(ranked);
                this.allEntries.set(all);
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
