import { Component, input, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Character } from '../../models/player.model';

export interface CharacterTrophy {
    src: string;
    alt: string;
    title: string;
}

@Component({
    selector: 'app-character-card',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './character-card.component.html',
    styleUrl: './character-card.component.css'
})
export class CharacterCardComponent {
    character = input.required<Character>();
    sverigeRank = input<number | null>(null);
    levelGain = input(0);
    jobIcon = input<string | null>(null);
    classBackground = input<string | null>(null);
    trophy = input<CharacterTrophy | null>(null);
    shopUrl = input('');
    showShopLinks = input(false);
    historyRequested = output<Character>();
}
