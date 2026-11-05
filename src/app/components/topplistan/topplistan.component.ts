import { Component } from '@angular/core';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';

@Component({
    selector: 'app-topplistan',
    standalone: true,
    imports: [LeaderboardComponent],
    templateUrl: './topplistan.component.html',
    styleUrl: './topplistan.component.css'
})
export class TopplistanComponent {}
