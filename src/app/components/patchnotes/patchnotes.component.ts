import { ChangeDetectionStrategy, Component } from '@angular/core';

type PatchNoteType = 'Nytt' | 'Ändrat' | 'Fix';

interface PatchNoteItem {
    type: PatchNoteType;
    text: string;
}

interface PatchNoteEntry {
    date: string;
    items: PatchNoteItem[];
}

interface PatchNoteGroup {
    type: PatchNoteType;
    texts: string[];
}

interface PatchNoteView {
    date: string;
    label: string;
    groups: PatchNoteGroup[];
}

const TYPE_ORDER: PatchNoteType[] = ['Nytt', 'Ändrat', 'Fix'];

const PATCH_NOTES: PatchNoteEntry[] = [
    {
        date: '2026-11-07',
        items: [
            { type: 'Nytt', text: 'Jämför-dialogen visar karaktärernas porträtt ovanför jämförelsen, med en VS-bild mellan dem.' },
            { type: 'Nytt', text: 'Startsidan visar statistik per klass, samt högsta, lägsta och median-level.' },
            { type: 'Nytt', text: 'Discord: alla synkade karaktärer uppdateras direkt när boten startar.' },
            { type: 'Ändrat', text: 'Jämförelsen markerar bättre värden med en grön pil ▲ och sämre med en röd pil ▼.' },
            { type: 'Ändrat', text: 'Discord: synkläget är borttaget och karaktärerna uppdateras automatiskt. /setmanual och /setlevel finns inte längre.' },
            { type: 'Fix', text: 'Jobbikonerna i Topplistan och Medlemmar baseras nu på klassen i stället för jobbet.' },
            { type: 'Fix', text: 'Discord: nivån i smeknamnet visas korrekt.' },
            { type: 'Fix', text: 'Discord: profiluppdateringar avbryts efter en stund i stället för att låta kommandon hänga.' }
        ]
    },
    {
        date: '2026-11-06',
        items: [
            { type: 'Nytt', text: 'Jämför karaktärer sida vid sida i en tabell på Medlemmar-sidan.' },
            { type: 'Nytt', text: 'Se hur en karaktärs level har utvecklats över tid i spelarens detaljer.' },
            { type: 'Nytt', text: 'Banderollen högst upp visar nu nyaste medlemmen och de senaste level-upperna.' },
            { type: 'Nytt', text: 'Patchnotes-sidan: alla uppdateringar samlade här, nyast överst och grupperade per datum.' },
            { type: 'Ändrat', text: 'Banderollens senaste level-ups visar nu namn och nivå före och efter, t.ex. Namn (50 -> 51).' },
            { type: 'Ändrat', text: 'Banderollen rullar långsammare, och hastigheten anpassas efter hur mycket text som visas.' }
        ]
    },
    {
        date: '2026-11-05',
        items: [
            { type: 'Nytt', text: 'Topplistan finns nu som egen flik i menyn, med rankning och pokaler för top 3.' },
            { type: 'Nytt', text: 'Jobbikoner visas för karaktärerna på Topplistan och Medlemmar.' },
            { type: 'Nytt', text: 'Din Sverige-rank visas i spelarens detaljer.' },
            { type: 'Nytt', text: 'Info-sidan har fått en snabbstartsguide och en tydligare lista med Discord-kommandon.' },
            { type: 'Nytt', text: 'Discord: kommandot /leave tar bort all din data från boten, efter bekräftelse.' },
            { type: 'Nytt', text: 'Discord: karaktärers level sparas över tid, och det finns statistik över antal användare och karaktärer.' },
            { type: 'Ändrat', text: 'Karaktärslistan har en ny layout som fungerar bättre på mobil.' },
            { type: 'Ändrat', text: 'Discord: svar från /check och /leaderboards syns bara för dig som kör kommandot.' },
            { type: 'Ändrat', text: 'Discord: klassnamnen i smeknamnet på servern visas tydligare.' },
            { type: 'Ändrat', text: 'Tydligare hover-effekt på den aktiva länken i menyn.' }
        ]
    },
    {
        date: '2026-11-03',
        items: [
            { type: 'Nytt', text: 'Banderoll för meddelanden högst upp på sidan.' },
            { type: 'Nytt', text: 'En animerad maskot som springer förbi ibland.' },
            { type: 'Fix', text: 'Omdirigeringen fungerar nu korrekt när du inte är inloggad.' },
            { type: 'Fix', text: 'Felmeddelandet vid Discord-inloggning är tydligare.' },
            { type: 'Fix', text: 'Spelarlistan försöker igen vid tillfälliga fel.' },
            { type: 'Fix', text: 'Discord: namn och topplistan är rättade, och kontrollerna vid synk är säkrare.' }
        ]
    }
];

@Component({
    selector: 'app-patchnotes',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './patchnotes.component.html',
    styleUrl: './patchnotes.component.css'
})
export class PatchnotesComponent {
    private static readonly dateFormatter = new Intl.DateTimeFormat('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    protected readonly patchNotes: PatchNoteView[] = [...PATCH_NOTES]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(entry => ({
            date: entry.date,
            label: PatchnotesComponent.dateFormatter.format(new Date(`${entry.date}T00:00:00`)),
            groups: TYPE_ORDER
                .map(type => ({
                    type,
                    texts: entry.items.filter(item => item.type === type).map(item => item.text)
                }))
                .filter(group => group.texts.length > 0)
        }));
}
