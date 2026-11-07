import { Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, forkJoin, of, switchMap, timer } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { FavoritesService } from '../../services/favorites.service';
import { Character, CharacterLevelHistoryEntry, User, UserSummary } from '../../models/player.model';
import { getJobIconUrl } from '../../job-icon';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { MemberView, PlayerSort, PlayersFilterBarComponent } from '../players-filter-bar/players-filter-bar.component';
import { LEVEL_GAIN_WINDOW_DAYS, LEVEL_HISTORY_RANGES, LevelHistoryRange, buildLevelChart, getLevelGainSince, selectLevelHistoryRange } from '../../character-level-history';

interface PlayerUrlState {
    search: string;
    job: string;
    sort: PlayerSort;
    view: MemberView;
}

const PAGE_SIZE = 10;

interface CompareCandidate {
    id: number;
    label: string;
    character: Character;
    owner: User;
}

interface CompareRow {
    label: string;
    left: string;
    right: string;
    better: 'left' | 'right' | null;
}

const CLASS_BACKGROUND_URLS: Readonly<Record<string, string>> = {
    magician: 'url("/bg_elinia.png")',
    thief: 'url("/bg_kerning.png")',
    theif: 'url("/bg_kerning.png")',
    warrior: 'url("/bg_perion.png")',
    bowman: 'url("/bg_henesys.png")'
};

function getHighestCharacterLevel(player: User): number {
    return player.characters.reduce((highest, character) => Math.max(highest, character.level), 0);
}

function pickBetter(left: number | null, right: number | null, higherIsBetter: boolean): 'left' | 'right' | null {
    if (left === null || right === null || left === right) {
        return null;
    }
    return (left > right) === higherIsBetter ? 'left' : 'right';
}

function formatOptional(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [CommonModule, CharacterCardComponent, PlayersFilterBarComponent],
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
    nicknameError = signal(false);
    userNicknames = signal<ReadonlyMap<string, string>>(new Map());
    searchQuery = signal('');
    selectedJob = signal('');
    selectedSort = signal<PlayerSort>('default');
    memberView = signal<MemberView>('all');
    copyStatus = signal<{ discordUserId: string; success: boolean } | null>(null);
    visibleCount = signal(PAGE_SIZE);
    isLoadingMore = signal(false);
    private loadedServerCount = 0;
    private readonly loadSentinel = viewChild<ElementRef<HTMLElement>>('loadSentinel');
    private readonly fetchSize = 100;
    private userSummary = signal<UserSummary | null>(null);
    private serverTotalCount = signal(0);
    private fullyLoaded = false;
    private loadRequestId = 0;
    private characterHistories = signal<ReadonlyMap<number, CharacterLevelHistoryEntry[]>>(new Map());
    private requestedHistoryIds = new Set<number>();
    private readonly historyDialog = viewChild<ElementRef<HTMLDialogElement>>('historyDialog');
    selectedHistoryCharacter = signal<Character | null>(null);
    levelHistoryRanges = LEVEL_HISTORY_RANGES;
    selectedHistoryRange = signal<LevelHistoryRange>(LEVEL_HISTORY_RANGES[0]);
    selectedHistoryChart = computed(() => {
        const character = this.selectedHistoryCharacter();
        if (!character) {
            return null;
        }
        const history = this.characterHistories().get(character.id) ?? [];
        return buildLevelChart(selectLevelHistoryRange(history, this.selectedHistoryRange().days));
    });
    private readonly compareDialog = viewChild<ElementRef<HTMLDialogElement>>('compareDialog');
    compareLeftId = signal<number | null>(null);
    compareRightId = signal<number | null>(null);
    compareCandidates = computed<CompareCandidate[]>(() => {
        return this.allPlayers()
            .flatMap(owner => owner.characters.map(character => ({
                id: character.id,
                label: `${character.characterName} (${this.getPlayerDisplayName(owner)})`,
                character,
                owner
            })))
            .sort((a, b) => a.label.localeCompare(b.label, 'sv'));
    });
    comparePair = computed(() => {
        const candidates = this.compareCandidates();
        return {
            left: candidates.find(candidate => candidate.id === this.compareLeftId()) ?? null,
            right: candidates.find(candidate => candidate.id === this.compareRightId()) ?? null
        };
    });
    compareMessage = computed<string | null>(() => {
        const { left, right } = this.comparePair();
        if (!left || !right) {
            return 'Välj två karaktärer för att jämföra dem.';
        }
        if (left.id === right.id) {
            return 'Välj två olika karaktärer.';
        }
        return null;
    });
    compareRows = computed<CompareRow[]>(() => {
        const { left, right } = this.comparePair();
        if (!left || !right || left.id === right.id) {
            return [];
        }
        const leftGain = this.getLevelGain(left.character);
        const rightGain = this.getLevelGain(right.character);
        return [
            {
                label: 'Medlem',
                left: this.getPlayerDisplayName(left.owner),
                right: this.getPlayerDisplayName(right.owner),
                better: null
            },
            {
                label: 'Värld',
                left: formatOptional(left.character.world),
                right: formatOptional(right.character.world),
                better: null
            },
            {
                label: 'Klass',
                left: formatOptional(left.character.class),
                right: formatOptional(right.character.class),
                better: null
            },
            {
                label: 'Jobb',
                left: formatOptional(left.character.job),
                right: formatOptional(right.character.job),
                better: null
            },
            {
                label: 'Level',
                left: String(left.character.level),
                right: String(right.character.level),
                better: pickBetter(left.character.level, right.character.level, true)
            },
            {
                label: `Levlar senaste ${LEVEL_GAIN_WINDOW_DAYS} dagarna`,
                left: String(leftGain),
                right: String(rightGain),
                better: pickBetter(leftGain, rightGain, true)
            },
            {
                label: 'Official Rank',
                left: formatOptional(left.character.rank),
                right: formatOptional(right.character.rank),
                better: pickBetter(left.character.rank, right.character.rank, false)
            },
            {
                label: 'Sverige rank',
                left: formatOptional(left.owner.sverigeRank),
                right: formatOptional(right.owner.sverigeRank),
                better: pickBetter(left.owner.sverigeRank, right.owner.sverigeRank, false)
            }
        ];
    });

    availableJobs = computed(() => {
        return [...(this.userSummary()?.jobs ?? [])].sort((a, b) => a.localeCompare(b, 'sv'));
    });
    filteredPlayers = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        const selectedJob = this.selectedJob().trim().toLowerCase();
        const favoriteIds = this.favorites.getFavoriteIds();

        return this.allPlayers().filter(player => {
            const matchesSearch = !query
                || (player.discordUsername ?? '').toLowerCase().includes(query)
                || player.discordUserId.toLowerCase().includes(query)
                || (this.userNicknames().get(player.discordUserId)?.toLowerCase().includes(query) ?? false)
                || player.characters.some(character => character.characterName.toLowerCase().includes(query));
            const matchesJob = !selectedJob
                || player.characters.some(character => character.job.trim().toLowerCase() === selectedJob);
            const view = this.memberView();
            const matchesView = view === 'all'
                || (view === 'favorites' && favoriteIds.has(player.discordUserId))
                || (view === 'online' && (this.onlineUserIds()?.has(player.discordUserId) ?? false));

            return matchesSearch && matchesJob && matchesView;
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
        const topUserIds = this.userSummary()?.topUserIds ?? [];

        return new Map(topUserIds.map((userId, index) => [
            userId,
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
                        : 'Bronspokal, 3:e plats på topplistan',
                title: `Sverige rank ${index + 1}`
            }
        ]));
    });
    isFiltering = computed(() => Boolean(
        this.searchQuery().trim() || this.selectedJob() || this.selectedSort() !== 'default' || this.memberView() !== 'all'
    ));
    players = computed(() => this.sortedPlayers().slice(0, this.visibleCount()));
    totalCount = computed(() => this.isFiltering() ? this.sortedPlayers().length : this.serverTotalCount());
    hasMorePlayers = computed(() => this.visibleCount() < this.totalCount());

    constructor(
        private playerService: PlayerService,
        private route: ActivatedRoute,
        private router: Router,
        readonly favorites: FavoritesService
    ) {
        effect(() => {
            const visiblePlayers = this.players();
            untracked(() => this.loadCharacterHistories(visiblePlayers));
        });

        effect(onCleanup => {
            const sentinel = this.loadSentinel()?.nativeElement;
            if (!sentinel) {
                return;
            }
            const observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    this.loadMore();
                }
            }, { rootMargin: '200px' });
            observer.observe(sentinel);
            onCleanup(() => observer.disconnect());
        });
    }

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
            const view = params.get('view');
            this.memberView.set(
                view === 'favorites' || view === 'online'
                    ? view
                    : params.get('favorites') === '1' ? 'favorites' : 'all'
            );
            this.loadPlayers();
        });
        this.loadSummary();
        this.watchOnlineUsers();
    }

    private loadNicknames(users: User[]): void {
        const discordUserIds = Array.from(new Set(users.map(user => user.discordUserId)));
        this.nicknameError.set(false);

        if (discordUserIds.length === 0) {
            return;
        }

        forkJoin(discordUserIds.map(discordUserId =>
            this.playerService.getUserNickname(discordUserId).pipe(
                catchError(error => {
                    console.error(`Could not load nickname for Discord user ${discordUserId}.`, error);
                    this.nicknameError.set(true);
                    return of({ nickname: null });
                })
            )
        )).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(responses => {
            const nicknames = new Map<string, string>();
            responses.forEach((response, index) => {
                const nickname = response.nickname?.trim();
                if (nickname) {
                    nicknames.set(discordUserIds[index], nickname);
                }
            });
            this.userNicknames.update(current => new Map([...current, ...nicknames]));
        });
    }

    private loadCharacterHistories(players: User[]): void {
        const missing = players
            .flatMap(player => player.characters)
            .filter(character => !this.requestedHistoryIds.has(character.id));

        missing.forEach(character => {
            this.requestedHistoryIds.add(character.id);
            this.playerService.getCharacterLevelHistory(character.id).pipe(
                catchError(error => {
                    console.error(`Could not load level history for character ${character.characterName}.`, error);
                    return of(null);
                }),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe(history => {
                if (history === null) {
                    return;
                }
                this.characterHistories.update(current => new Map(current).set(character.id, history));
            });
        });
    }

    getLevelGain(character: Character): number {
        return getLevelGainSince(this.characterHistories().get(character.id) ?? []);
    }

    getSelectedRangeGain(character: Character): number {
        return getLevelGainSince(this.characterHistories().get(character.id) ?? [], this.selectedHistoryRange().days);
    }

    selectHistoryRange(range: LevelHistoryRange): void {
        this.selectedHistoryRange.set(range);
    }

    openHistory(character: Character): void {
        this.selectedHistoryRange.set(LEVEL_HISTORY_RANGES[0]);
        this.selectedHistoryCharacter.set(character);
        this.historyDialog()?.nativeElement.showModal();
    }

    onHistoryDialogClosed(): void {
        this.selectedHistoryCharacter.set(null);
    }

    openCompare(): void {
        this.compareDialog()?.nativeElement.showModal();
    }

    onCompareSelect(side: 'left' | 'right', value: string): void {
        const id = value ? Number(value) : null;
        if (side === 'left') {
            this.compareLeftId.set(id);
        } else {
            this.compareRightId.set(id);
        }

        const selected = this.comparePair();
        const owners = [selected.left?.owner, selected.right?.owner].filter((owner): owner is User => !!owner);
        this.loadCharacterHistories(owners);
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

        return onlineUserIds.has(discordUserId) ? 'Inloggad på hemsidan' : 'Inte inloggad';
    }

    getClassBackground(className: string): string | null {
        return CLASS_BACKGROUND_URLS[className.trim().toLowerCase()] ?? null;
    }

    getJobIcon(job: string): string | null {
        return getJobIconUrl(job);
    }

    getPlayerDisplayName(player: User): string {
        return this.userNicknames().get(player.discordUserId)
            || player.discordUsername
            || player.discordUserId;
    }

    isTopCharacter(player: User, character: Character): boolean {
        const highest = player.characters.reduce<Character | null>(
            (best, current) => best === null || current.level > best.level ? current : best,
            null
        );
        return highest === character;
    }

    loadPlayers(): void {
        const requestId = ++this.loadRequestId;
        this.error.set(null);
        this.visibleCount.set(PAGE_SIZE);

        if (!this.isFiltering()) {
            this.fullyLoaded = false;
            this.loadedServerCount = 0;
            this.allPlayers.set([]);
            this.isLoading.set(true);
            this.loadServerPage(requestId);
        } else if (this.fullyLoaded) {
            this.isLoading.set(false);
        } else {
            this.isLoading.set(true);
            this.loadPage(0, [], requestId);
        }
    }

    loadMore(): void {
        if (!this.hasMorePlayers()) {
            return;
        }

        this.visibleCount.update(count => count + PAGE_SIZE);
        const needsServerPage = !this.isFiltering()
            && !this.isLoadingMore()
            && this.loadedServerCount < this.serverTotalCount()
            && this.allPlayers().length < this.visibleCount();
        if (needsServerPage) {
            this.isLoadingMore.set(true);
            this.loadServerPage(this.loadRequestId);
        }
    }

    private loadSummary(): void {
        this.playerService.getUserSummary().subscribe({
            next: summary => this.userSummary.set(summary),
            error: err => console.error('Could not load member summary.', err)
        });
    }

    private loadServerPage(requestId: number): void {
        this.playerService.getUsers(this.loadedServerCount, PAGE_SIZE).subscribe({
            next: (response) => {
                if (requestId !== this.loadRequestId) {
                    return;
                }

                const items = response.items ?? [];
                this.allPlayers.update(current => [...current, ...items]);
                this.loadedServerCount += items.length;
                this.serverTotalCount.set(response.totalCount ?? this.loadedServerCount);
                this.loadNicknames(items);
                this.isLoading.set(false);
                this.isLoadingMore.set(false);
            },
            error: (err) => {
                this.isLoadingMore.set(false);
                this.handleLoadError(err, requestId);
            }
        });
    }

    private loadPage(offset: number, accumulated: User[], requestId: number): void {
        this.playerService.getUsers(offset, this.fetchSize).subscribe({
            next: (response) => {
                if (requestId !== this.loadRequestId) {
                    return;
                }

                const items = response.items ?? [];
                const users = [...accumulated, ...items];

                if (items.length > 0 && users.length < (response.totalCount ?? users.length)) {
                    this.loadPage(users.length, users, requestId);
                    return;
                }

                this.allPlayers.set(users);
                this.fullyLoaded = true;
                this.loadNicknames(users);
                this.isLoading.set(false);
            },
            error: (err) => this.handleLoadError(err, requestId)
        });
    }

    private handleLoadError(err: { message?: string }, requestId: number): void {
        if (requestId !== this.loadRequestId) {
            return;
        }

        this.error.set('Kunde inte ladda medlemmar. ' + (err.message || 'Försök igen senare.'));
        this.isLoading.set(false);
    }

    onSearch(value: string): void {
        this.updateUrl({ search: value.trim() });
    }

    onJobFilter(value: string): void {
        this.updateUrl({ job: value });
    }

    onSortChange(value: PlayerSort): void {
        this.updateUrl({ sort: value });
    }

    onMemberViewChange(value: MemberView): void {
        this.updateUrl({ view: value });
    }

    onFavoriteClick(event: Event, player: User): void {
        // The button sits inside <summary>, so keep the click from also toggling the card.
        event.preventDefault();
        event.stopPropagation();
        this.favorites.toggle(player.discordUserId);
    }

    isFavorite(player: User): boolean {
        return this.favorites.isFavorite(player.discordUserId);
    }

    getFavoriteLabel(player: User): string {
        return this.isFavorite(player)
            ? `Ta bort ${this.getPlayerDisplayName(player)} från favoriter`
            : `Lägg till ${this.getPlayerDisplayName(player)} i favoriter`;
    }

    getShareLabel(player: User): string {
        const status = this.copyStatus();
        if (status?.discordUserId !== player.discordUserId) {
            return 'Dela profil';
        }
        return status.success ? 'Länk kopierad!' : 'Kunde inte kopiera';
    }

    readonly showShopLinks = false;

    getShopUrl(characterName: string): string {
        return 'https://meso.watch/s/' + encodeURIComponent(characterName);
    }

    async copyProfileLink(player: User): Promise<void> {
        const search = player.discordUsername || player.discordUserId;
        const path = this.router.serializeUrl(this.router.createUrlTree(['/players'], { queryParams: { search } }));
        const url = new URL(path, window.location.origin).toString();

        let success = false;
        try {
            await navigator.clipboard.writeText(url);
            success = true;
        } catch (error) {
            console.error('Could not copy member link to clipboard.', error);
        }

        this.copyStatus.set({ discordUserId: player.discordUserId, success });
        setTimeout(() => {
            if (this.copyStatus()?.discordUserId === player.discordUserId) {
                this.copyStatus.set(null);
            }
        }, 2500);
    }

    private updateUrl(changes: Partial<PlayerUrlState>): void {
        const state: PlayerUrlState = {
            search: this.searchQuery().trim(),
            job: this.selectedJob(),
            sort: this.selectedSort(),
            view: this.memberView(),
            ...changes
        };

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                search: state.search || null,
                job: state.job || null,
                sort: state.sort === 'default' ? null : state.sort,
                view: state.view === 'all' ? null : state.view
            },
            replaceUrl: true
        });
    }
}