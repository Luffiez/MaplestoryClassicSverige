import { AuthUser } from '../models/auth.model';
import { User } from '../models/player.model';

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
        characters: [
            {
                id: 1,
                discordUserId: MOCK_AUTH_USER.id,
                isPrimary: true,
                characterName: 'DevBishop',
                world: 'Scania',
                level: 142,
                class: 'Magician',
                job: 'Bishop',
                externalId: 'mock-character-1',
                lastSyncedAt: '2026-10-02T09:15:00Z',
                rank: 184,
                characterImageUrl: null,
                cacheLastUpdatedAt: '2026-10-02T09:15:00Z'
            },
            {
                id: 2,
                discordUserId: MOCK_AUTH_USER.id,
                isPrimary: false,
                characterName: 'LocalShadower',
                world: 'Scania',
                level: 96,
                class: 'Thief',
                job: 'Shadower',
                externalId: 'mock-character-2',
                lastSyncedAt: '2026-10-01T20:45:00Z',
                rank: 1284,
                characterImageUrl: null,
                cacheLastUpdatedAt: '2026-10-01T20:45:00Z'
            }
        ]
    },
    {
        id: 2,
        discordUserId: '100000000000000002',
        discordUsername: 'HenesisLocal',
        createdAt: '2026-02-03T11:00:00Z',
        characters: [
            {
                id: 3,
                discordUserId: '100000000000000002',
                isPrimary: true,
                characterName: 'MockHero',
                world: 'Bera',
                level: 121,
                class: 'Warrior',
                job: 'Hero',
                externalId: 'mock-character-3',
                lastSyncedAt: '2026-10-02T08:10:00Z',
                rank: 492,
                characterImageUrl: null,
                cacheLastUpdatedAt: '2026-10-02T08:10:00Z'
            }
        ]
    },
    {
        id: 3,
        discordUserId: '100000000000000003',
        discordUsername: 'SleepywoodTester',
        createdAt: '2026-03-18T16:20:00Z',
        characters: []
    },
    {
        id: 4,
        discordUserId: '100000000000000002',
        discordUsername: 'HenesisLocal',
        createdAt: '2026-02-03T11:00:00Z',
        characters: [
            {
                id: 3,
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
                characterImageUrl: null,
                cacheLastUpdatedAt: '2026-10-02T08:10:00Z'
            }
        ]
    },
];