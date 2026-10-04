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
        },
        {
            name: '/setprimary {characterName}',
            description: 'Ställ in en av dina synkade karaktärer som primär. Servernamnet berikas med klass och level från den primära karaktären.',
            details: 'Använd kommandot i Discord när du vill ställa in en av dina synkade karaktärer som primär.'
        }

        ,
        {
            name: '/joinparty {mapName}',
            description: 'Markera vilken karta du tränar på, fler kanske vill haka på?',
            details: 'Använd kommandot i Discord för att ange vilken karta du för närvarande tränar på.'
        }
        ,
        {
            name: '/leaveparty',
            description: 'Lämna den aktuella träningsgruppen på kartan.',
            details: 'Använd kommandot i Discord när du vill lämna den aktuella träningsgruppen på kartan.'
        }
        ,
        {
            name: '/partylist',
            description: 'Visa listan över alla kartor som spelare för närvarande tränar på.',
            details: 'Använd kommandot i Discord för att se vilka kartor spelare är aktiva på.'
        }
    ];
}
