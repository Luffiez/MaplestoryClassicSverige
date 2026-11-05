import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, filter, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';
import { PlayerService } from '../../services/player.service';
import { CharacterLevelUp, User } from '../../models/player.model';

const SCROLL_SPEED_PX_PER_SECOND = 60;
const MIN_SCROLL_DURATION_SECONDS = 20;

@Component({
  selector: 'app-announcement-banner',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './announcement-banner.component.html',
  styleUrl: './announcement-banner.component.css'
})
export class AnnouncementBannerComponent implements OnInit, AfterViewInit {
  protected readonly discordCommunicationsEnabled = !environment.devMode;
  protected readonly topCharacters = signal<LeaderboardEntry[]>([]);
  protected readonly topCharactersError = signal(false);
  protected readonly newestUser = signal<User | null>(null);
  protected readonly recentLevelUps = signal<CharacterLevelUp[]>([]);
  protected readonly scrollDurationSeconds = signal(MIN_SCROLL_DURATION_SECONDS);
  private readonly firstContent = viewChild<ElementRef<HTMLElement>>('firstContent');
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

  ngAfterViewInit(): void {
    const content = this.firstContent()?.nativeElement;
    if (!content || typeof ResizeObserver === 'undefined') {
      return;
    }

    // The track scrolls one copy of the content width, so the duration is derived from that width to keep the speed constant.
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      this.scrollDurationSeconds.set(Math.max(MIN_SCROLL_DURATION_SECONDS, width / SCROLL_SPEED_PX_PER_SECOND));
    });
    observer.observe(content);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
