import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_KEY = 'maplestory-classic.favorites';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    private readonly favoriteIds = signal<ReadonlySet<string>>(this.readStoredIds());

    readonly count = computed(() => this.favoriteIds().size);

    constructor() {
        effect(() => {
            this.writeStoredIds(this.favoriteIds());
        });
    }

    isFavorite(discordUserId: string): boolean {
        return this.favoriteIds().has(discordUserId);
    }

    /** Returns the current favorite set so callers can read it reactively inside computed signals. */
    getFavoriteIds(): ReadonlySet<string> {
        return this.favoriteIds();
    }

    toggle(discordUserId: string): void {
        this.favoriteIds.update(current => {
            const next = new Set(current);
            if (next.has(discordUserId)) {
                next.delete(discordUserId);
            } else {
                next.add(discordUserId);
            }
            return next;
        });
    }

    private readStoredIds(): ReadonlySet<string> {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed: unknown = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
        } catch {
            return new Set();
        }
    }

    private writeStoredIds(ids: ReadonlySet<string>): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
        } catch {
            // Storage can be unavailable (private mode, quota); favorites then only last for this page view.
        }
    }
}
