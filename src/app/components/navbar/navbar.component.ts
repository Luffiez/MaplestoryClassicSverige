import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

const PAGE_LABELS: Record<string, string> = {
  '/home': 'Hem',
  '/players': 'Medlemmar',
  '/party': 'Party',
  '/topplistan': 'Topplistan',
  '/info': 'Info',
  '/patchnotes': 'Patchnotes'
};

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly router = inject(Router);

  protected readonly authService = inject(AuthService);
  readonly isMuted = input.required<boolean>();
  readonly muteToggle = output<void>();
  readonly soundClick = output<void>();

  protected readonly mobileMenuOpen = signal(false);
  protected readonly currentPageLabel = signal(this.labelForUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(event => this.labelForUrl(event.urlAfterRedirects))
      )
      .subscribe(label => this.currentPageLabel.set(label));
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(isOpen => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  private labelForUrl(url: string): string {
    const path = url.split(/[?#]/)[0];
    return PAGE_LABELS[path] ?? '';
  }
}
