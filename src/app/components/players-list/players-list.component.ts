import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { Character, User } from '../../models/player.model';

type PlayerSort = 'default' | 'created-asc' | 'created-desc' | 'level-asc' | 'level-desc';

function getHighestCharacterLevel(player: User): number {
    return player.characters.reduce((highest, character) => Math.max(highest, character.level), 0);
}

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, RouterLink],
    templateUrl: './players-list.component.html',
    styleUrl: './players-list.component.css'
})
export class PlayersListComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private allPlayers = signal<User[]>([]);
    onlineUserIds = signal<ReadonlySet<string> | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    presenceError = signal(false);
    searchQuery = signal('');
    selectedJob = signal('');
    selectedSort = signal<PlayerSort>('default');
    currentOffset = signal(0);
    pageSize = 25;
    private readonly fetchSize = 100;

    availableJobs = computed(() => {
        const jobs = new Map<string, string>();
        for (const player of this.allPlayers()) {
            for (const character of player.characters) {
                const job = character.job.trim();
                if (job) {
                    jobs.set(job.toLowerCase(), job);
                }
            }
        }

        return Array.from(jobs.values()).sort((a, b) => a.localeCompare(b, 'sv'));
    });
    filteredPlayers = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        const selectedJob = this.selectedJob().trim().toLowerCase();

        return this.allPlayers().filter(player => {
            const matchesSearch = !query
                || (player.discordUsername ?? '').toLowerCase().includes(query)
                || player.discordUserId.toLowerCase().includes(query)
                || player.characters.some(character => character.characterName.toLowerCase().includes(query));
            const matchesJob = !selectedJob
                || player.characters.some(character => character.job.trim().toLowerCase() === selectedJob);

            return matchesSearch && matchesJob;
        });
    });
    sortedPlayers = computed(() => {
        const sort = this.selectedSort();
        const players = this.filteredPlayers();

        switch (sort) {
            case 'created-asc':
                return [...players].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
            case 'created-desc':
                return [...players].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
            case 'level-asc':
                return [...players].sort((a, b) => getHighestCharacterLevel(a) - getHighestCharacterLevel(b));
            case 'level-desc':
                return [...players].sort((a, b) => getHighestCharacterLevel(b) - getHighestCharacterLevel(a));
            default:
                return players;
        }
    });
    playerTrophies = computed(() => {
        const entries = this.allPlayers().flatMap(player => {
            const character = player.characters.reduce<Character | null>(
                (highest, current) => highest === null || current.level > highest.level ? current : highest,
                null
            );
            return character ? [{ player, character }] : [];
        });

        return new Map(entries
            .sort((a, b) => b.character.level - a.character.level)
            .slice(0, 3)
            .map(({ player }, index) => [
                player.id,
                {
                    src: index === 0
                        ? 'event-trophy-gold.png'
                        : index === 1
                            ? 'event-trophy-silver.png'
                            : 'event-trophy-bronze.png',
                    alt: index === 0
                        ? 'Guldpokal, 1:a plats på topplistan'
                        : index === 1
                            ? 'Silverpokal, 2:a plats på topplistan'
                            : 'Bronspokal, 3:e plats på topplistan'
                }
            ])
        );
    });
    players = computed(() => this.sortedPlayers().slice(this.currentOffset(), this.currentOffset() + this.pageSize));
    totalCount = computed(() => this.sortedPlayers().length);
    hasMorePlayers = computed(() => this.currentOffset() + this.pageSize < this.totalCount());

    constructor(
        private playerService: PlayerService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            this.searchQuery.set(params.get('search') ?? '');
            this.selectedJob.set(params.get('job') ?? '');
            const sort = params.get('sort');
            this.selectedSort.set(
                sort === 'created-asc' || sort === 'created-desc' || sort === 'level-asc' || sort === 'level-desc'
                    ? sort
                    : 'default'
            );
            this.currentOffset.set(0);
        });
        this.loadPlayers();
        this.watchOnlineUsers();
    }

    private watchOnlineUsers(): void {
        timer(0, 30_000).pipe(
            switchMap(() => this.playerService.getOnlineUserIds().pipe(
                catchError(error => {
                    console.error('Could not load online member status.', error);
                    this.onlineUserIds.set(null);
                    this.presenceError.set(true);
                    return EMPTY;
                })
            )),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(userIds => {
            this.onlineUserIds.set(new Set(userIds));
            this.presenceError.set(false);
        });
    }

    getPresenceLabel(discordUserId: string): string {
        const onlineUserIds = this.onlineUserIds();
        if (onlineUserIds === null) {
            return 'Närvarostatus okänd';
        }

        return onlineUserIds.has(discordUserId) ? 'Inloggad' : 'Inte inloggad';
    }

    loadPlayers(): void {
        this.isLoading.set(true);
        this.error.set(null);
        this.loadPage(0, []);
    }

    private loadPage(offset: number, accumulated: User[]): void {
        this.playerService.getUsers(offset, this.fetchSize).subscribe({
            next: (response) => {
                const items = response.items ?? [];
                const users = [...accumulated, ...items];

                if (items.length > 0 && users.length < (response.totalCount ?? users.length)) {
                    this.loadPage(users.length, users);
                    return;
                }

                this.allPlayers.set(users);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set('Kunde inte ladda medlemmar. ' + (err.message || 'Försök igen senare.'));
                this.isLoading.set(false);
            }
        });
    }

    onSearch(value: string): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                search: value.trim() || null,
                job: this.selectedJob() || null,
                sort: this.selectedSort() === 'default' ? null : this.selectedSort()
            },
            replaceUrl: true
        });
    }

    onJobFilter(value: string): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                search: this.searchQuery().trim() || null,
                job: value || null,
                sort: this.selectedSort() === 'default' ? null : this.selectedSort()
            },
            replaceUrl: true
        });
    }

    onSortChange(value: PlayerSort): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                search: this.searchQuery().trim() || null,
                job: this.selectedJob() || null,
                sort: value === 'default' ? null : value
            },
            replaceUrl: true
        });
    }

    nextPage(): void {
        if (this.hasMorePlayers()) {
            this.currentOffset.set(this.currentOffset() + this.pageSize);
        }
    }

    previousPage(): void {
        this.currentOffset.set(Math.max(0, this.currentOffset() - this.pageSize));
    }
}