import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth/auth.service';
import { AnnouncementBannerComponent } from './components/announcement-banner/announcement-banner.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule, AnnouncementBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  private readonly MASCOT_MIN_DELAY_MS = 20_000;
  private readonly MASCOT_MAX_DELAY_MS = 60_000;
  private mascotTimer: ReturnType<typeof setTimeout> | null = null;

  authService = inject(AuthService);
  protected readonly title = signal('maplestory-classic-web');
  private readonly bgm = new Audio('sleepywood-bg.mp3');
  private readonly sfx = new Audio('maplestory-click.mp3');
  isMuted = signal(false);
  isLogoHovered = signal(false);
  mobileMenuOpen = signal(false);
  mascotVisible = signal(false);

  constructor() {
    this.bgm.loop = true;
    this.bgm.volume = 0.18;
    this.sfx.volume = 0.45;

    this.startBackgroundMusic();
    this.scheduleMascot();
  }

  ngOnDestroy(): void {
    if (this.mascotTimer !== null) {
      clearTimeout(this.mascotTimer);
    }
  }

  private scheduleMascot(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const delay = this.MASCOT_MIN_DELAY_MS
      + Math.random() * (this.MASCOT_MAX_DELAY_MS - this.MASCOT_MIN_DELAY_MS);

    this.mascotTimer = setTimeout(() => this.mascotVisible.set(true), delay);
  }

  onMascotAnimationEnd(): void {
    this.mascotVisible.set(false);
    this.scheduleMascot();
  }

  private startBackgroundMusic(): void {
    this.bgm.play().catch(() => {
      // Browser will allow playback after user interaction.
    });
  }

  toggleMute(): void {
    this.isMuted.set(!this.isMuted());
    const muted = this.isMuted();
    this.bgm.muted = muted;
    this.sfx.muted = muted;
  }

  playButtonSfx(): void {
    if (this.isMuted()) {
      return;
    }

    this.sfx.currentTime = 0;
    this.sfx.play().catch(() => {
      // Ignore autoplay restrictions until the user interacts.
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(isOpen => !isOpen);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
