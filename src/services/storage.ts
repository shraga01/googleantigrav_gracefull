import type { UserProfile, DailyEntry, StreakData, ThreeGoodThingsItem } from '../types';

const KEYS = {
    PROFILE: 'daily_app_profile',
    ENTRIES: 'daily_app_entries',
    STREAK: 'daily_app_streak',
    DRAFT_PREFIX: 'daily_app_draft_',
};

export const StorageService = {
    // Profile
    getUserProfile: (): UserProfile | null => {
        try {
            const data = localStorage.getItem(KEYS.PROFILE);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    saveUserProfile: (profile: UserProfile): void => {
        try {
            localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
        } catch (err) {
            console.warn('Failed to save profile to localStorage:', err);
        }
    },

    clearUserProfile: (): void => {
        localStorage.removeItem(KEYS.PROFILE);
    },

    // Daily Draft Persistence (Samsung Keyboard / Tab Switch / Reload Resilience)
    getDraft: (date: string): ThreeGoodThingsItem[] | null => {
        try {
            const raw = localStorage.getItem(`${KEYS.DRAFT_PREFIX}${date}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === 3) {
                return parsed as ThreeGoodThingsItem[];
            }
            return null;
        } catch {
            return null;
        }
    },

    saveDraft: (date: string, items: ThreeGoodThingsItem[]): void => {
        try {
            localStorage.setItem(`${KEYS.DRAFT_PREFIX}${date}`, JSON.stringify(items));
        } catch (err) {
            console.warn('Failed to persist draft to localStorage:', err);
        }
    },

    clearDraft: (date: string): void => {
        try {
            localStorage.removeItem(`${KEYS.DRAFT_PREFIX}${date}`);
        } catch {
            // ignore
        }
    },

    // Entries
    getEntries: (): DailyEntry[] => {
        try {
            const data = localStorage.getItem(KEYS.ENTRIES);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveEntry: (entry: DailyEntry): void => {
        try {
            const entries = StorageService.getEntries().filter((e) => e.date !== entry.date);
            entries.unshift(entry);
            localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
        } catch (err) {
            console.warn('Failed to save entry to localStorage:', err);
        }
    },

    getEntryByDate: (date: string): DailyEntry | undefined => {
        const entries = StorageService.getEntries();
        return entries.find((e) => e.date === date);
    },

    // Streak
    getStreak: (): StreakData => {
        try {
            const data = localStorage.getItem(KEYS.STREAK);
            return data
                ? JSON.parse(data)
                : {
                    currentStreak: 0,
                    longestStreak: 0,
                    totalDaysPracticed: 0,
                    lastPracticeDate: null,
                    practiceDates: [],
                    milestonesAchieved: [],
                };
        } catch {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysPracticed: 0,
                lastPracticeDate: null,
                practiceDates: [],
                milestonesAchieved: [],
            };
        }
    },

    updateStreak: (streak: StreakData): void => {
        try {
            localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
        } catch (err) {
            console.warn('Failed to save streak to localStorage:', err);
        }
    },

    // Data Management
    clearAllData: (): void => {
        localStorage.clear();
    },

    exportData: (): string => {
        const profile = StorageService.getUserProfile();
        const entries = StorageService.getEntries();
        const streak = StorageService.getStreak();
        return JSON.stringify({ profile, entries, streak }, null, 2);
    }
};
