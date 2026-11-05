import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';

@Component({
  selector: 'app-announcement-banner',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './announcement-banner.component.html',
  styleUrl: './announcement-banner.component.css'
})
export class AnnouncementBannerComponent implements OnInit {
  protected readonly discordCommunicationsEnabled = !environment.devMode;
  protected readonly topCharacters = signal<LeaderboardEntry[]>([]);
  protected readonly topCharactersError = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly leaderboardService = inject(LeaderboardService);

  ngOnInit(): void {
    this.authService.waitForAuthInitialization().pipe(
      switchMap(isAuthenticated => isAuthenticated
        ? this.leaderboardService.getTopCharacters()
        : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: entries => this.topCharacters.set(entries),
      error: error => {
        console.error('Could not load announcement leaderboard.', error);
        this.topCharactersError.set(true);
      }
    });
  }
}
