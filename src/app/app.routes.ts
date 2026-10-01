import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { AuthCallbackComponent } from './components/auth/auth-callback.component';
import { authGuard } from './auth.guard';
import { LandingPageComponent } from './components/landing/landing-page.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: 'auth/callback', component: AuthCallbackComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
    { path: '', component: LandingPageComponent },
    { path: '**', redirectTo: '' }
];
