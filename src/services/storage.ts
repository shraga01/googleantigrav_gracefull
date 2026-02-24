import type { UserProfile, DailyEntry, StreakData } from '../types';

const KEYS = {
    PROFILE: 'daily_app_profile',
    ENTRIES: 'daily_app_entries',
    STREAK: 'daily_app_streak',
};

export const StorageService = {
    // Profile
    getUserProfile: (): UserProfile | null => {
        const data = localStorage.getItem(KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    },

    saveUserProfile: (profile: UserProfile): void => {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    },

    clearUserProfile: (): void => {
        localStorage.removeItem(KEYS.PROFILE);
    },

    // Entries
    getEntries: (): DailyEntry[] => {
        const data = localStorage.getItem(KEYS.ENTRIES);
        return data ? JSON.parse(data) : [];
    },

    saveEntry: (entry: DailyEntry): void => {
        const entries = StorageService.getEntries();
        entries.unshift(entry); // Add to beginning
        localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
    },

    getEntryByDate: (date: string): DailyEntry | undefined => {
        const entries = StorageService.getEntries();
        return entries.find((e) => e.date === date);
    },

    // Streak
    getStreak: (): StreakData => {
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
    },

    updateStreak: (streak: StreakData): void => {
        localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
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
