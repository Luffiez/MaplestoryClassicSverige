import { AuthUser } from '../models/auth.model';
import { CharacterLevelHistoryEntry, User } from '../models/player.model';

export const MOCK_AUTH_USER: AuthUser = {
    id: '100000000000000001',
    username: 'LocalMapler',
    discriminator: '0',
    avatar: null,
    email: 'local-mapler@example.test'
};

export const MOCK_USERS: User[] = [
    {
        id: 1,
        discordUserId: MOCK_AUTH_USER.id,
        discordUsername: MOCK_AUTH_USER.username,
        createdAt: '2026-01-12T18:30:00Z',
        sverigeRank: 1,
        characters: [
            {
                id: 1,
                discordUserId: MOCK_AUTH_USER.id,
                isPrimary: true,
                characterName: 'HolyMoly',
                world: 'Scania',
                level: 142,
                class: 'Magician',
                job: 'Bishop',
                externalId: 'mock-character-1',
                lastSyncedAt: '2026-10-02T09:15:00Z',
                rank: 184,
                characterImageUrl: "/mock-1.png",
                cacheLastUpdatedAt: '2026-10-02T09:15:00Z'
            },
            {
                id: 2,
                discordUserId: MOCK_AUTH_USER.id,
                isPrimary: false,
                characterName: 'Shadower',
                world: 'Scania',
                level: 96,
                class: 'Thief',
                job: 'Shadower',
                externalId: 'mock-character-2',
                lastSyncedAt: '2026-10-01T20:45:00Z',
                rank: 1284,
                characterImageUrl: "/mock-2.png",
                cacheLastUpdatedAt: '2026-10-01T20:45:00Z'
            }
        ]
    },
    {
        id: 2,
        discordUserId: '100000000000000002',
        discordUsername: 'HenesisLocal',
        createdAt: '2026-02-03T11:00:00Z',
        sverigeRank: 3,
        characters: [
            {
                id: 3,
                discordUserId: '100000000000000002',
                isPrimary: true,
                characterName: 'Hero',
                world: 'Bera',
                level: 121,
                class: 'Warrior',
                job: 'Hero',
                externalId: 'mock-character-3',
                lastSyncedAt: '2026-10-02T08:10:00Z',
                rank: 492,
                characterImageUrl: "/mock-4.png",
                cacheLastUpdatedAt: '2026-10-02T08:10:00Z'
            }
        ]
    },
    {
        id: 3,
        discordUserId: '100000000000000003',
        discordUsername: 'SleepywoodTester',
        createdAt: '2026-03-18T16:20:00Z',
        sverigeRank: 2,
        characters: []
    },
    {
        id: 4,
        discordUserId: '100000000000000002',
        discordUsername: 'EliniaLocal',
        createdAt: '2026-02-03T11:00:00Z',
        sverigeRank: 4,
        characters: [
            {
                id: 4,
                discordUserId: '100000000000000002',
                isPrimary: true,
                characterName: 'Wizeard',
                world: 'Bera',
                level: 68,
                class: 'Magician',
                job: 'Wizard (Fire/Poison)',
                externalId: 'mock-character-4',
                lastSyncedAt: '2026-10-02T08:10:00Z',
                rank: 492423,
                characterImageUrl: "/mock-3.png",
                cacheLastUpdatedAt: '2026-10-02T08:10:00Z'
            }
        ]
    },
];

// Keyed by characterId. Wizeard uses id 4 so it does not clash with Hero (id 3).
export const MOCK_CHARACTER_LEVEL_HISTORY: (CharacterLevelHistoryEntry & { characterName: string })[] = [
    { id: 1, characterId: 1, characterName: 'HolyMoly', level: 138, recordedAt: '2026-09-01T10:00:00Z' },
    { id: 2, characterId: 1, characterName: 'HolyMoly', level: 140, recordedAt: '2026-09-20T19:30:00Z' },
    { id: 3, characterId: 1, characterName: 'HolyMoly', level: 141, recordedAt: '2026-10-28T21:00:00Z' },
    { id: 4, characterId: 1, characterName: 'HolyMoly', level: 142, recordedAt: '2026-11-03T09:15:00Z' },
    { id: 5, characterId: 2, characterName: 'Shadower', level: 92, recordedAt: '2026-08-15T12:00:00Z' },
    { id: 6, characterId: 2, characterName: 'Shadower', level: 96, recordedAt: '2026-10-01T20:45:00Z' },
    { id: 7, characterId: 3, characterName: 'Hero', level: 121, recordedAt: '2026-10-02T08:10:00Z' },
    { id: 8, characterId: 4, characterName: 'Wizeard', level: 66, recordedAt: '2026-07-30T14:00:00Z' },
    { id: 9, characterId: 4, characterName: 'Wizeard', level: 68, recordedAt: '2026-10-10T18:20:00Z' }
];
