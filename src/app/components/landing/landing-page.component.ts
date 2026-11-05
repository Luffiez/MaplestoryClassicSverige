import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
    authService = inject(AuthService);
    private router = inject(Router);
    readonly discordInviteUrl = environment.discordInviteUrl;

    ngOnInit(): void {
        this.authService.waitForAuthInitialization().subscribe(isAuthenticated => {
            if (isAuthenticated) {
                this.router.navigate(['/home']);
            }
        });
    }
}
