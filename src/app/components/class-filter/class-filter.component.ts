import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getJobIconUrl } from '../../job-icon';

@Component({
    selector: 'app-class-filter',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
    templateUrl: './class-filter.component.html',
    styleUrl: './class-filter.component.css'
})
export class ClassFilterComponent {
    readonly classOptions = input.required<string[]>();
    readonly selectedClass = input.required<string>();
    readonly selectedClassChange = output<string>();

    protected readonly getJobIcon = getJobIconUrl;
    protected readonly mobileFilterOpen = signal(false);

    protected selectClass(characterClass: string): void {
        this.selectedClassChange.emit(characterClass);
        this.mobileFilterOpen.set(false);
    }

    protected toggleMobileFilter(): void {
        this.mobileFilterOpen.update(isOpen => !isOpen);
    }
}
