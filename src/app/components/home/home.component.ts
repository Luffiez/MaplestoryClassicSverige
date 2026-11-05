import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { PlayerService } from '../../services/player.service';
import { getJobIconUrl } from '../../job-icon';
@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private readonly authService = inject(AuthService);
    private readonly playerService = inject(PlayerService);
    protected readonly username = computed(() => this.authService.user()?.username ?? 'Mapler');
    protected readonly stats = toSignal(
        this.playerService.getUserStats().pipe(catchError(() => of(null)))
    );

    protected classIcon(characterClass: string): string | null {
        return getJobIconUrl(characterClass);
    }
}
