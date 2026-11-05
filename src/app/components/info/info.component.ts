import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BotCommand {
    group: string;
    name: string;
    description: string;
    details: string;
}

interface CommandGroup {
    title: string;
    commands: BotCommand[];
}

@Component({
    selector: 'app-info',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    templateUrl: './info.component.html',
    styleUrl: './info.component.css'
})
export class InfoComponent {
    protected readonly commands: BotCommand[] = [

        {
            group: 'Karaktärer',
            name: '/sync {characterName}',
            description: 'Länka ditt Discord-konto till en MapleStory-karaktär.',
            details: 'Starta kommandot i Discord för att länka ditt konto till din karaktär.'
        },
        {
            group: 'Karaktärer',
            name: '/desync {characterName}',
            description: 'Ta bort en av dina synkade karaktärer.',
            details: 'Använd kommandot i Discord när du vill ta bort en karaktär som tidigare har synkats.'
        },
        {
            group: 'Karaktärer',
            name: '/check {discordUsername}',
            description: 'Visa information om en spelares synkade MapleStory-karaktär.',
            details: 'Använd kommandot i Discord för att visa karaktärsinformation som har synkats av en spelare. Svaret syns bara för dig som kör kommandot.'
        },
        {
            group: 'Konto',
            name: '/nickname {nickname}',
            description: 'Ändra ditt Discord-namn till ett specifikt smeknamn.',
            details: 'Använd kommandot i Discord för att ändra ditt smeknamn.'
        },
        {
            group: 'Karaktärer',
            name: '/setprimary {characterName}',
            description: 'Ställ in en av dina synkade karaktärer som primär. Servernamnet berikas med klass och level från den primära karaktären.',
            details: 'Använd kommandot i Discord när du vill ställa in en av dina synkade karaktärer som primär.'
        },
        {
            group: 'Topplista',
            name: '/leaderboards',
            description: 'Visa varje Discord-användares karaktär med högst nivå bland de synkade karaktärerna.',
            details: 'Använd kommandot i Discord för att visa topplistan baserad på användarnas högsta synkade karaktärsnivå. Svaret syns bara för dig som kör kommandot.'
        },
        {
            group: 'Party',
            name: '/joinparty {mapName}',
            description: 'Markera vilken karta du tränar på, fler kanske vill haka på?',
            details: 'Använd kommandot i Discord för att ange vilken karta du för närvarande tränar på. /leaveparty körs automatiskt efter 12 timmar.'
        },
        {
            group: 'Party',
            name: '/leaveparty',
            description: 'Lämna den aktuella träningsgruppen på kartan.',
            details: 'Använd kommandot i Discord när du vill lämna den aktuella träningsgruppen på kartan.'
        },
        {
            group: 'Konto',
            name: '/leave',
            description: 'Ta bort all din data från boten: synkade karaktärer, partymedlemskap och smeknamnet på servern.',
            details: 'Använd kommandot i Discord för att ta bort all data som boten har sparat om dig. Du måste bekräfta innan något tas bort.'
        },
        {
            group: 'Party',
            name: '/partylist',
            description: 'Visa listan över alla kartor som spelare för närvarande tränar på.',
            details: 'Använd kommandot i Discord för att se vilka kartor spelare är aktiva på.'
        }
    ];

    protected readonly commandGroups: CommandGroup[] = ['Karaktärer', 'Party', 'Topplista', 'Konto'].map(title => ({
        title,
        commands: this.commands.filter(command => command.group === title)
    }));
}
