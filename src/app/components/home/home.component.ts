import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { PlayerService } from '../../services/player.service';
import { getJobIconUrl } from '../../job-icon';
import { buildDailyBarChart } from '../../daily-level-up-chart';
import { DailyLevelUp } from '../../models/player.model';
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
    protected readonly rangeOptions = [7, 30, 90];
    protected readonly selectedDays = signal(30);
    private readonly dailyStats = toSignal<DailyLevelUp[] | null | undefined>(
        toObservable(this.selectedDays).pipe(
            switchMap(days => this.playerService.getDailyLevelUps(days).pipe(catchError(() => of(null))))
        ),
        { initialValue: undefined }
    );
    protected readonly dailyCharts = computed(() => {
        const days = this.dailyStats();
        if (!days) {
            return null;
        }
        return [
            { id: 'level-ups', title: 'Level-ups per dag', chart: buildDailyBarChart(days, day => day.levelUps) },
            { id: 'active', title: 'Aktiva karaktärer per dag', chart: buildDailyBarChart(days, day => day.activeCharacters) }
        ];
    });
    protected readonly dailyFailed = computed(() => this.dailyStats() === null);
    protected readonly classBars = computed(() => {
        const counts = [...(this.stats()?.classCounts ?? [])].sort((a, b) => b.count - a.count);
        const max = counts[0]?.count ?? 0;
        const total = counts.reduce((sum, classCount) => sum + classCount.count, 0);
        return counts.map(classCount => ({
            class: classCount.class,
            count: classCount.count,
            width: max > 0 ? (classCount.count / max) * 100 : 0,
            share: total > 0 ? Math.round((classCount.count / total) * 1000) / 10 : 0
        }));
    });

    protected classIcon(characterClass: string): string | null {
        return getJobIconUrl(characterClass);
    }
}
