import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { Character, User } from '../../models/player.model';

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
    currentOffset = signal(0);
    pageSize = 25;
    private readonly fetchSize = 100;

    filteredPlayers = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        if (!query) {
            return this.allPlayers();
        }

        return this.allPlayers().filter(player =>
            (player.discordUsername ?? '').toLowerCase().includes(query)
            || player.discordUserId.toLowerCase().includes(query)
            || player.characters.some(character => character.characterName.toLowerCase().includes(query)));
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
    players = computed(() => this.filteredPlayers().slice(this.currentOffset(), this.currentOffset() + this.pageSize));
    totalCount = computed(() => this.filteredPlayers().length);
    hasMorePlayers = computed(() => this.currentOffset() + this.pageSize < this.totalCount());

    constructor(
        private playerService: PlayerService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            this.searchQuery.set(params.get('search') ?? '');
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
            queryParams: { search: value.trim() || null },
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