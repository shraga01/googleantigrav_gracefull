import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Language, StreakData } from '../types';
import { StorageService } from '../services/storage';
import { onAuthChange } from '../services/auth';
import { ApiService } from '../services/api';

interface AppContextType {
    userProfile: UserProfile | null;
    language: Language;
    isLoading: boolean;
    isAuthenticated: boolean;
    googleId: string | null;
    updateProfile: (profile: UserProfile, syncToServer?: boolean) => void;
    setLanguage: (lang: Language) => void;
    refreshProfile: () => void;
    fetchProfileFromServer: () => Promise<UserProfile | null>;
    setGoogleId: (id: string | null) => void;
    streak: StreakData;
    refreshStreak: () => void;
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
        // Initial load from localStorage
        loadFromLocalStorage();

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange(async (user) => {
            console.log('🔄 onAuthChange triggered, user:', user?.uid || 'null');
            if (user) {
                console.log('Auth state: User signed in', user.uid);
                setIsAuthenticated(true);
                setGoogleIdState(user.uid);

                // Fetch streak 
                fetchStreakFromServer();

                // Check if cached profile matches current user
                const cachedProfile = StorageService.getUserProfile();
                console.log('🔍 Cached profile:', cachedProfile?.userId || 'null');

                if (cachedProfile && cachedProfile.userId === user.uid) {
                    console.log('✅ Using cached profile for user:', user.uid);
                    setUserProfile(cachedProfile);
                    setLanguageState(cachedProfile.language);
                    updateDocumentDirection(cachedProfile.language);
                    setIsLoading(false);
                } else {
                    // Try to fetch profile from server
                    console.log('🌐 Fetching profile from server for user:', user.uid);
                    try {
                        const serverProfile = await ApiService.getProfile();
                        console.log('📥 Server response:', serverProfile ? 'Profile found' : 'No profile');
                        if (serverProfile) {
                            console.log('✅ Got profile from server, setting state...');
                            // Cache it locally
                            StorageService.saveUserProfile(serverProfile);
                            setUserProfile(serverProfile);
                            setLanguageState(serverProfile.language);
                            updateDocumentDirection(serverProfile.language);
                        } else {
                            console.log('⚠️ No profile on server - user needs onboarding');
                            // No profile exists - user needs to complete onboarding
                            setUserProfile(null);
                        }
                    } catch (error) {
                        console.error('❌ Failed to fetch profile from server:', error);
                        // Fall back to null - show onboarding
                        setUserProfile(null);
                    }
                    setIsLoading(false);
                }
            } else {
                console.log('Auth state: User signed out');
                setIsAuthenticated(false);
                setGoogleIdState(null);
                setUserProfile(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadFromLocalStorage = () => {
        setIsLoading(true);
        const profile = StorageService.getUserProfile();
        if (profile) {
            setUserProfile(profile);
            setLanguageState(profile.language);
            updateDocumentDirection(profile.language);
        }
        setIsLoading(false);
    };

    const updateDocumentDirection = (lang: Language) => {
        document.documentElement.dir = lang === 'hebrew' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang === 'hebrew' ? 'he' : 'en';
    };

    const updateProfile = (profile: UserProfile, syncToServer = true) => {
        // Save to localStorage
        StorageService.saveUserProfile(profile);
        setUserProfile(profile);
        setLanguageState(profile.language);
        updateDocumentDirection(profile.language);

        // Sync to server in background
        if (syncToServer) {
            ApiService.saveProfile(profile).catch(error => {
                console.error('Failed to sync profile to server:', error);
            });
        }
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        updateDocumentDirection(lang);

        // If profile exists, update it too
        if (userProfile) {
            const updated = { ...userProfile, language: lang };
            updateProfile(updated);
        }
    };

    const refreshProfile = () => {
        loadFromLocalStorage();
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
        // 1. Clear profile from localStorage (important for security - don't show old profile to new user)
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
            fetchProfileFromServer,
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
