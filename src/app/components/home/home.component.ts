import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private readonly authService = inject(AuthService);
    protected readonly username = computed(() => this.authService.user()?.username ?? 'Mapler');
}
