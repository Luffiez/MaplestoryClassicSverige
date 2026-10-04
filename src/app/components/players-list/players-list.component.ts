import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { User } from '../../models/player.model';

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './players-list.component.html',
    styleUrl: './players-list.component.css'
})
export class PlayersListComponent implements OnInit {
    players = signal<User[]>([]);
    totalCount = signal(0);
    isLoading = signal(true);
    error = signal<string | null>(null);
    selectedUserId = signal<string | null>(null);
    currentOffset = signal(0);
    pageSize = 25;
    hasMorePlayers = computed(() => this.currentOffset() + this.players().length < this.totalCount());

    constructor(private playerService: PlayerService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            this.selectedUserId.set(params.get('user'));
            this.loadPlayers();
        });
    }

    loadPlayers(): void {
        const selectedId = this.selectedUserId();
        if (selectedId) {
            this.isLoading.set(true);
            this.error.set(null);
            this.playerService.getUser(selectedId).subscribe({
                next: (user) => {
                    this.players.set([user]);
                    this.totalCount.set(1);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.players.set([]);
                    this.error.set('Kunde inte ladda spelaren. ' + (err.message || ''));
                    this.isLoading.set(false);
                }
            });
            return;
        }

        this.isLoading.set(true);
        this.error.set(null);

        this.playerService.getUsers(this.currentOffset(), this.pageSize).subscribe({
            next: (response) => {
                this.players.set(response.items ?? []);
                this.totalCount.set(response.totalCount ?? (response.items?.length ?? 0));
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load players. ' + (err.message || 'Please try again later.'));
                this.isLoading.set(false);
            }
        });
    }

    nextPage(): void {
        if (!this.hasMorePlayers()) {
            return;
        }

        this.currentOffset.set(this.currentOffset() + this.pageSize);
        this.loadPlayers();
    }

    previousPage(): void {
        this.currentOffset.set(Math.max(0, this.currentOffset() - this.pageSize));
        this.loadPlayers();
    }
}
