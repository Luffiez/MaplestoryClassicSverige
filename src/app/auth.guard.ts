import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { environment } from '../environments/environment';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (environment.devMode || authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/']);
};
