import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Language, StreakData } from '../types';
import { StorageService } from '../services/storage';
import { onAuthChange, getUserGoogleId } from '../services/auth';

interface AppContextType {
    userProfile: UserProfile | null;
    language: Language;
    isLoading: boolean;
    isAuthenticated: boolean;
    googleId: string | null;
    updateProfile: (profile: UserProfile) => void;
    setLanguage: (lang: Language) => void;
    refreshProfile: () => void;
    refreshStreak: () => void;
    setGoogleId: (id: string | null) => void;
    logout: () => Promise<void>;
    newlyUnlockedBadges: string[];
    setNewlyUnlockedBadges: (badges: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [language, setLanguageState] = useState<Language>('english');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleId, setGoogleIdState] = useState<string | null>(null);
    const [streak, setStreak] = useState<StreakData>(StorageService.getStreak());
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);

    useEffect(() => {
        loadData();

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange((user) => {
            if (user) {
                setIsAuthenticated(true);
                const gid = getUserGoogleId();
                setGoogleIdState(gid);

                // If user signs in but no profile exists, they're in onboarding
                // The profile will be created after they complete onboarding
            } else {
                setIsAuthenticated(false);
                setGoogleIdState(null);
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        setIsLoading(true);
        const profile = StorageService.getUserProfile();
        if (profile) {
            setUserProfile(profile);
            setLanguageState(profile.language);
            updateDocumentDirection(profile.language);
            // Also attempt to sync streak on load if we have a profile (which implies logged in)
            fetchStreakFromServer();
        }
        setStreak(StorageService.getStreak());
        setIsLoading(false);
    };

    const updateProfile = (profile: UserProfile) => {
        StorageService.saveUserProfile(profile);
        setUserProfile(profile);
        setLanguageState(profile.language);

        document.documentElement.dir = profile.language === 'hebrew' ? 'rtl' : 'ltr';
        document.documentElement.lang = profile.language === 'hebrew' ? 'he' : 'en';
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // If profile exists, update it too
        if (userProfile) {
            const updated = { ...userProfile, language: lang };
            updateProfile(updated);
        } else {
            // Just update UI for onboarding
            document.documentElement.dir = lang === 'hebrew' ? 'rtl' : 'ltr';
            document.documentElement.lang = lang === 'hebrew' ? 'he' : 'en';
        }
    };

    const refreshProfile = () => {
        loadData();
    };

    const fetchProfileFromServer = async (): Promise<UserProfile | null> => {
        try {
            const serverProfile = await ApiService.getProfile();
            if (serverProfile) {
                StorageService.saveUserProfile(serverProfile);
                setUserProfile(serverProfile);
                setLanguageState(serverProfile.language);
                updateDocumentDirection(serverProfile.language);
            }
            return serverProfile;
        } catch (error) {
            console.error('Failed to fetch profile from server:', error);
            return null;
        }
    };

    const fetchStreakFromServer = async () => {
        try {
            const serverStreak = await ApiService.getStreak();
            if (serverStreak) {
                // Ensure array fields initialized
                const fullStreak: StreakData = {
                    milestonesAchieved: [],
                    ...serverStreak
                };

                // Auto-sync phase 2: If local storage has more entries than the server,
                // we reconstruct the server's history by pushing local dates.
                // (Server only stores dates, not content)
                const localEntries = StorageService.getEntries();
                if (localEntries.length > fullStreak.totalDaysPracticed) {
                    console.log(`Syncing missing entries to server... Local: ${localEntries.length}, Server: ${fullStreak.totalDaysPracticed}`);

                    // Sort local entries chronologically ascending
                    const sortedLocalEntries = [...localEntries].sort((a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                    // Upload all missing dates
                    let badgesToAward: string[] = [];
                    for (const entry of sortedLocalEntries) {
                        try {
                            const res = await ApiService.saveEntry(entry);
                            if (res.success && res.newBadges && res.newBadges.length > 0) {
                                badgesToAward = [...badgesToAward, ...res.newBadges];
                            }
                        } catch (err) {
                            console.warn(`Failed to sync date ${entry.date}:`, err);
                        }
                    }

                    if (badgesToAward.length > 0) {
                        const uniqueBadges = Array.from(new Set(badgesToAward));
                        setNewlyUnlockedBadges(uniqueBadges);
                    }

                    // Refetch the fully corrected streak from the server
                    const correctedStreak = await ApiService.getStreak();
                    if (correctedStreak) {
                        const finalStreak: StreakData = {
                            milestonesAchieved: [],
                            ...correctedStreak
                        };
                        StorageService.updateStreak(finalStreak);
                        setStreak(finalStreak);
                        return; // Done syncing
                    }
                }

                // Temporary Phase 3 patch: Repair frozen/wrong streakDays in local entries based on server truth
                if (serverStreak.currentStreak < localEntries.length) {
                    const today = new Date().toLocaleDateString('en-CA');
                    const sortedLocalEntries = [...localEntries].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    if (sortedLocalEntries.length > 0 && sortedLocalEntries[0].date === today && sortedLocalEntries[0].streakDay !== serverStreak.currentStreak) {
                        console.log(`Patching today's corrupted local streakDay (${sortedLocalEntries[0].streakDay}) to match server (${serverStreak.currentStreak})`);
                        sortedLocalEntries[0].streakDay = serverStreak.currentStreak;

                        // Clear array and resave to fix corrupted local state
                        StorageService.clearAllData();
                        StorageService.saveUserProfile(userProfile!); // Put profile back
                        StorageService.updateStreak(fullStreak); // Put streak back
                        sortedLocalEntries.reverse().forEach(e => StorageService.saveEntry(e)); // Put entries back corrected
                    }
                }

                StorageService.updateStreak(fullStreak);
                setStreak(fullStreak);
            }
        } catch (error) {
            console.error('Failed to fetch streak:', error);
        }
    };

    const setGoogleId = (id: string | null) => {
        setGoogleIdState(id);
    };

    const logout = async () => {
        console.log('Logging out...');
        // 1. Clear profile from storage
        StorageService.clearUserProfile();
        // 2. Clear React state
        setUserProfile(null);
        setIsAuthenticated(false);
        setGoogleIdState(null);
        setStreak({
            currentStreak: 0,
            longestStreak: 0,
            totalDaysPracticed: 0,
            lastPracticeDate: null,
            practiceDates: [],
            milestonesAchieved: []
        });
        // 3. Sign out of Firebase
        const { signOut } = await import('../services/auth');
        await signOut();
        console.log('Logout complete');
    };

    return (
        <AppContext.Provider value={{
            userProfile,
            language,
            isLoading,
            isAuthenticated,
            googleId,
            updateProfile,
            setLanguage,
            refreshProfile,
            refreshStreak,
            setGoogleId,
            streak,
            refreshStreak: fetchStreakFromServer,
            logout,
            newlyUnlockedBadges,
            setNewlyUnlockedBadges
        }}>
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
