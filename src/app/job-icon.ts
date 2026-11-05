const JOB_ICON_FILES: Readonly<Record<string, string>> = {
    magician: 'magician.png',
    wizard: 'magician.png',
    cleric: 'magician.png',
    priest: 'magician.png',
    bishop: 'magician.png',
    mage: 'magician.png',
    archmage: 'magician.png',
    thief: 'thief.png',
    theif: 'thief.png',
    assassin: 'thief.png',
    hermit: 'thief.png',
    bandit: 'thief.png',
    'chief bandit': 'thief.png',
    'night lord': 'thief.png',
    shadower: 'thief.png',
    warrior: 'warrior.png',
    fighter: 'warrior.png',
    crusader: 'warrior.png',
    hero: 'warrior.png',
    page: 'warrior.png',
    knight: 'warrior.png',
    paladin: 'warrior.png',
    spearman: 'warrior.png',
    'dragon knight': 'warrior.png',
    'dark knight': 'warrior.png',
    bowman: 'bowman.png',
    hunter: 'bowman.png',
    ranger: 'bowman.png',
    bowmaster: 'bowman.png',
    crossbowman: 'bowman.png',
    sniper: 'bowman.png',
    marksman: 'bowman.png',
    archer: 'bowman.png'
};

export function getJobIconUrl(job: string): string | null {
    const baseJob = job.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase();
    const file = JOB_ICON_FILES[baseJob];
    return file ? `/${file}` : null;
}
