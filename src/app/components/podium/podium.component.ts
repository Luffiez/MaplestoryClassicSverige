import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LeaderboardEntry } from '../../services/leaderboard.service';

@Component({
    selector: 'app-podium',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgOptimizedImage],
    templateUrl: './podium.component.html',
    styleUrl: './podium.component.css'
})
export class PodiumComponent {
    readonly entries = input.required<LeaderboardEntry[]>();

    protected readonly podiumPlaces = [0, 1, 2];
}
