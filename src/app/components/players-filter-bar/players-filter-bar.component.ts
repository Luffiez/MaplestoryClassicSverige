import { Component, input, output, signal } from '@angular/core';

export type PlayerSort = 'default' | 'created-asc' | 'created-desc' | 'level-asc' | 'level-desc';
export type MemberView = 'all' | 'favorites' | 'online';

@Component({
    selector: 'app-players-filter-bar',
    standalone: true,
    templateUrl: './players-filter-bar.component.html',
    styleUrl: './players-filter-bar.component.css'
})
export class PlayersFilterBarComponent {
    searchQuery = input('');
    selectedJob = input('');
    selectedSort = input<PlayerSort>('default');
    memberView = input<MemberView>('all');
    availableJobs = input<string[]>([]);
    favoriteCount = input(0);

    searchChange = output<string>();
    jobChange = output<string>();
    sortChange = output<PlayerSort>();
    memberViewChange = output<MemberView>();
    compareOpen = output<void>();

    filtersExpanded = signal(false);
}
