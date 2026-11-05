import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { AuthCallbackComponent } from './components/auth/auth-callback.component';
import { authGuard } from './auth.guard';
import { LandingPageComponent } from './components/landing/landing-page.component';
import { PartiesComponent } from './components/parties/parties.component';
import { HomeComponent } from './components/home/home.component';
import { TopplistanComponent } from './components/topplistan/topplistan.component';
import { PatchnotesComponent } from './components/patchnotes/patchnotes.component';

export const routes: Routes = [
    { path: 'auth/callback', component: AuthCallbackComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
    { path: 'party', component: PartiesComponent, canActivate: [authGuard] },
    { path: 'topplistan', component: TopplistanComponent, canActivate: [authGuard] },
    {
        path: 'info',
        loadComponent: () => import('./components/info/info.component').then(component => component.InfoComponent),
        canActivate: [authGuard]
    },
    { path: 'patchnotes', component: PatchnotesComponent, canActivate: [authGuard] },
    { path: 'botkommandon', redirectTo: 'info' },
    { path: '', component: LandingPageComponent },
    { path: '**', redirectTo: '' }
];
