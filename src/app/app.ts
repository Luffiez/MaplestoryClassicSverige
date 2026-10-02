import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  protected readonly title = signal('maplestory-classic-web');
  protected readonly discordCommunicationsEnabled = !environment.devMode;
  private readonly bgm = new Audio('/sleepywood-bg.mp3');
  private readonly sfx = new Audio('/maplestory-click.mp3');
  isMuted = signal(false);
  isLogoHovered = signal(false);

  constructor() {
    this.bgm.loop = true;
    this.bgm.volume = 0.18;
    this.sfx.volume = 0.45;

    this.startBackgroundMusic();
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
}
