const CLASS_ICON_FILES: Readonly<Record<string, string>> = {
    magician: 'magician.png',
    thief: 'thief.png',
    bowman: 'bowman.png',
    warrior: 'warrior.png',
    swordsman: 'warrior.png'
};

export function getJobIconUrl(characterClass: string): string | null {
    const baseClass = characterClass.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase();
    const file = CLASS_ICON_FILES[baseClass];
    return file ? `/${file}` : null;
}
