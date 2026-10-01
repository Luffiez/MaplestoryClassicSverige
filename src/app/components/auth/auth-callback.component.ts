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
  `]
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const errorParam = params['error'];

      if (errorParam) {
        this.error = `Authentication failed: ${errorParam}`;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
        return;
      }

      if (!code) {
        this.error = 'No authorization code received';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
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
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      });
    });
  }
}
