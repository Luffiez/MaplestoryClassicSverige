import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { PartyListResponse } from '../../models/player.model';

@Component({
    selector: 'app-parties',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './parties.component.html',
    styleUrl: './parties.component.css'
})
export class PartiesComponent implements OnInit {
    parties = signal<PartyListResponse | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);

    constructor(private playerService: PlayerService) { }

    ngOnInit(): void {
        this.playerService.getParties().subscribe({
            next: (response) => {
                this.parties.set(response);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set('Kunde inte ladda party. ' + (err.message || 'Försök igen senare.'));
                this.isLoading.set(false);
            }
        });
    }
}
