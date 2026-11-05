import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, filter, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';
import { PlayerService } from '../../services/player.service';
import { CharacterLevelUp, User } from '../../models/player.model';

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
  protected readonly newestUser = signal<User | null>(null);
  protected readonly recentLevelUps = signal<CharacterLevelUp[]>([]);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly playerService = inject(PlayerService);

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

    this.authService.waitForAuthInitialization().pipe(
      filter(isAuthenticated => isAuthenticated),
      switchMap(() => this.playerService.getNewestUser()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: user => this.newestUser.set(user),
      error: error => console.error('Could not load newest announcement user.', error)
    });

    this.authService.waitForAuthInitialization().pipe(
      filter(isAuthenticated => isAuthenticated),
      switchMap(() => this.playerService.getRecentLevelUps()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: levelUps => this.recentLevelUps.set(levelUps),
      error: error => console.error('Could not load announcement level-ups.', error)
    });
  }

  protected newestUserName(user: User): string {
    return user.discordUsername || user.characters[0]?.characterName || user.discordUserId;
  }
}
