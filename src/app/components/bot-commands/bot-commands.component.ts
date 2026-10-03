import { ChangeDetectionStrategy, Component } from '@angular/core';

interface BotCommand {
    name: string;
    description: string;
    details: string;
}

@Component({
    selector: 'app-bot-commands',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './bot-commands.component.html',
    styleUrl: './bot-commands.component.css'
})
export class BotCommandsComponent {
    protected readonly commands: BotCommand[] = [
        {
            name: '/check {discordUsername}',
            description: 'Visa information om en spelares synkade MapleStory-karaktär.',
            details: 'Kör kommandot i Discord för att visa karaktärsinformation som har synkats av en spelare.'
        },
        {
            name: '/sync {characterName}',
            description: 'Länka ditt Discord-konto till en MapleStory-karaktär.',
            details: 'Starta kommandot i Discord för att länka ditt konto till din karaktär.'
        },
        {
            name: '/desync {characterName}',
            description: 'Ta bort en av dina synkade karaktärer.',
            details: 'Använd kommandot i Discord när du vill ta bort en karaktär som tidigare har synkats.'
        },
        {
            name: '/leaderboards',
            description: 'Visa varje Discord-användares karaktär med högst nivå bland de synkade karaktärerna.',
            details: 'Kör kommandot i Discord för att visa topplistan baserad på användarnas högsta synkade karaktärsnivå.'
        }
    ];
}
