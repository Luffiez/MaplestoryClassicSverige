import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
    authService = inject(AuthService);
    private router = inject(Router);

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
        }
    }
}
