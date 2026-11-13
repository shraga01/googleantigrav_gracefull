import type { UserProfile, DailyEntry, StreakData, ThreeGoodThingsItem } from '../types';

const KEYS = {
    PROFILE: 'daily_app_profile',
    ENTRIES: 'daily_app_entries',
    STREAK: 'daily_app_streak',
    DRAFT_PREFIX: 'daily_app_draft_',
    SHARED_GRATITUDE: 'daily_app_shared_gratitude',
    INVITED_FRIEND: 'daily_app_invited_friend',
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

    reconcileStreakFromEntries: (): StreakData => {
        try {
            const entries = StorageService.getEntries();
            const stored = StorageService.getStreak();

            // Extract unique valid date strings (YYYY-MM-DD) sorted ascending
            const dateSet = new Set<string>();
            for (const entry of entries) {
                if (entry && typeof entry.date === 'string') {
                    const trimmed = entry.date.trim();
                    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                        dateSet.add(trimmed);
                    }
                }
            }
            const uniqueDates = Array.from(dateSet).sort();

            const totalDaysPracticed = uniqueDates.length;
            const lastPracticeDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;

            if (uniqueDates.length === 0) {
                const reconciledEmpty: StreakData = {
                    ...stored,
                    currentStreak: 0,
                    longestStreak: stored.longestStreak || 0,
                    totalDaysPracticed: 0,
                    lastPracticeDate: null,
                    practiceDates: [],
                };
                StorageService.updateStreak(reconciledEmpty);
                return reconciledEmpty;
            }

            const parseToEpochDay = (dateStr: string): number => {
                const [y, m, d] = dateStr.split('-').map(Number);
                return Math.floor(Date.UTC(y, m - 1, d) / (1000 * 60 * 60 * 24));
            };

            // Compute longest consecutive run across all recorded practice dates
            let maxConsecutive = 0;
            let run = 0;
            let prevDay: number | null = null;

            for (const dateStr of uniqueDates) {
                const day = parseToEpochDay(dateStr);
                if (prevDay === null) {
                    run = 1;
                } else if (day === prevDay + 1) {
                    run += 1;
                } else if (day === prevDay) {
                    // duplicate safety
                } else {
                    run = 1;
                }
                if (run > maxConsecutive) {
                    maxConsecutive = run;
                }
                prevDay = day;
            }

            // Compute active current streak
            const todayStr = new Date().toLocaleDateString('en-CA');
            const todayDay = parseToEpochDay(todayStr);
            const lastDay = parseToEpochDay(uniqueDates[uniqueDates.length - 1]);
            const diffFromToday = todayDay - lastDay;

            let currentStreak = 0;
            if (diffFromToday <= 1) {
                // Active streak (diff 0 = practiced today, diff 1 = practiced yesterday, diff < 0 = clock variance)
                let activeRun = 1;
                let expectedPrev = lastDay - 1;
                for (let i = uniqueDates.length - 2; i >= 0; i--) {
                    const prevD = parseToEpochDay(uniqueDates[i]);
                    if (prevD === expectedPrev) {
                        activeRun++;
                        expectedPrev--;
                    } else {
                        break;
                    }
                }
                currentStreak = activeRun;
            } else {
                currentStreak = 0;
            }

            const longestStreak = Math.max(maxConsecutive, stored.longestStreak || 0, currentStreak);

            const reconciled: StreakData = {
                ...stored,
                currentStreak,
                longestStreak,
                totalDaysPracticed,
                lastPracticeDate,
                practiceDates: uniqueDates,
            };

            StorageService.updateStreak(reconciled);
            return reconciled;
        } catch (err) {
            console.warn('Failed to reconcile streak from entries:', err);
            return StorageService.getStreak();
        }
    },

    // Social Sharing Tracking
    markGratitudeShared: (): void => {
        try {
            localStorage.setItem(KEYS.SHARED_GRATITUDE, 'true');
        } catch (err) {
            console.warn('Failed to mark gratitude shared:', err);
        }
    },

    hasSharedGratitude: (): boolean => {
        try {
            return localStorage.getItem(KEYS.SHARED_GRATITUDE) === 'true';
        } catch {
            return false;
        }
    },

    markFriendInvited: (): void => {
        try {
            localStorage.setItem(KEYS.INVITED_FRIEND, 'true');
        } catch (err) {
            console.warn('Failed to mark friend invited:', err);
        }
    },

    hasInvitedFriend: (): boolean => {
        try {
            return localStorage.getItem(KEYS.INVITED_FRIEND) === 'true';
        } catch {
            return false;
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
    },

    importData: (jsonString: string): { success: boolean; error?: string } => {
        try {
            if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
                return { success: false, error: 'Empty backup data' };
            }

            const data = JSON.parse(jsonString);
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                return { success: false, error: 'Invalid backup file structure' };
            }

            const hasProfile = data.profile && typeof data.profile === 'object' && !Array.isArray(data.profile);
            const hasEntries = Array.isArray(data.entries);
            const hasStreak = data.streak && typeof data.streak === 'object' && !Array.isArray(data.streak);

            if (!hasProfile && !hasEntries && !hasStreak) {
                return { success: false, error: 'Backup does not contain valid platform data (profile, entries, or streak)' };
            }

            if (hasProfile) {
                localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
            }

            if (hasEntries) {
                localStorage.setItem(KEYS.ENTRIES, JSON.stringify(data.entries));
            }

            if (hasStreak) {
                localStorage.setItem(KEYS.STREAK, JSON.stringify(data.streak));
            }

            // Reconcile streak from entries to guarantee empirical integrity
            StorageService.reconcileStreakFromEntries();

            return { success: true };
        } catch (err) {
            console.error('Failed to import backup data:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to parse backup JSON',
            };
        }
    }
};
