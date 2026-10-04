export interface Character {
    id: number;
    discordUserId: string;
    isPrimary: boolean;
    characterName: string;
    world: string;
    level: number;
    class: string;
    job: string;
    externalId: string;
    lastSyncedAt: string;
    rank: number | null;
    characterImageUrl: string | null;
    cacheLastUpdatedAt: string | null;
}

export interface User {
    id: number;
    discordUserId: string;
    discordUsername?: string | null;
    createdAt: string;
    characters: Character[];
}

export interface PaginatedResponse<T> {
    items: T[];
    offset: number;
    limit: number;
    totalCount: number;
}

export interface PartyMember {
    discordUserId: string;
    discordUsername: string | null;
    characterName: string;
    isPrimaryCharacter: boolean;
}

export interface PartyMap {
    mapName: string;
    members: PartyMember[];
}

export interface PartyListResponse {
    maps: PartyMap[];
    totalMaps: number;
    totalMembers: number;
}
