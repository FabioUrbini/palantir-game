'use client';

// hooks/usePersistence.ts - localStorage persistence for game state

const STORAGE_KEY = 'palantir-player-state';
const TUTORIAL_KEY = 'palantir-tutorial-completed';

export interface PersistedState {
    playerResources: {
        budget: number;
        agents: number;
        dataCredits: number;
        influence: number;
    };
    entityStates: {
        [entityId: number]: {
            investigationLevel: number;
            flags: {
                priority: boolean;
                watchlist: boolean;
                investigated: boolean;
                resolved: boolean;
            };
        };
    };
    dismissedAlerts: number[];
    objectiveStates: {
        [objectiveId: string]: 'active' | 'completed' | 'failed';
    };
    savedAt: number;
}

export function savePlayerState(state: PersistedState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Failed to save player state:', error);
    }
}

export function loadPlayerState(): PersistedState | null {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        const state = JSON.parse(saved) as PersistedState;

        // Check if save is too old (older than 24 hours)
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - state.savedAt > maxAge) {
            clearPlayerState();
            return null;
        }

        return state;
    } catch (error) {
        console.warn('Failed to load player state:', error);
        return null;
    }
}

export function clearPlayerState(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear player state:', error);
    }
}

export function isTutorialCompleted(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        return localStorage.getItem(TUTORIAL_KEY) === 'true';
    } catch {
        return false;
    }
}

export function setTutorialCompleted(completed: boolean): void {
    if (typeof window === 'undefined') return;
    try {
        if (completed) {
            localStorage.setItem(TUTORIAL_KEY, 'true');
        } else {
            localStorage.removeItem(TUTORIAL_KEY);
        }
    } catch (error) {
        console.warn('Failed to save tutorial state:', error);
    }
}
