import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { environment } from '../environments/environment';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (environment.devMode) {
        return true;
    }

    return authService.waitForAuthInitialization().pipe(
        map(isAuthenticated => isAuthenticated || router.createUrlTree(['/']))
    );
};
