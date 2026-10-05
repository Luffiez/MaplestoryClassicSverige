import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-callback">
      <div *ngIf="loading" class="loading">
        <p>Authenticating with Discord...</p>
      </div>
      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <p>Du måste vara medlem i Maplestory Classic Sverige på Discord för att logga in.</p>
        <a class="join-btn" [href]="discordInviteUrl" target="_blank" rel="noopener">Gå med i servern</a>
        <a class="back-link" (click)="goHome()">Tillbaka till startsidan</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .loading, .error {
      text-align: center;
      font-size: 1.2rem;
    }

    .error {
      color: #c00;
    }

    .join-btn { display: inline-block; margin: 0.5rem 0; padding: 0.6rem 1.2rem; background: #5865f2; color: #fff; border-radius: 6px; text-decoration: none; }

    .back-link { display: block; color: #888; cursor: pointer; font-size: 1rem; }
  `]
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;
  readonly discordInviteUrl = 'https://discord.gg/r55DABTdWG';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  goHome(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const errorParam = params['error'];

      if (errorParam) {
        this.error = `Authentication failed: ${errorParam}`;
        this.loading = false;
        return;
      }

      if (!code) {
        this.error = 'No authorization code received';
        this.loading = false;
        return;
      }

      this.authService.exchangeCodeForToken(code).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to authenticate';
          this.loading = false;
          }
      });
    });
  }
}
