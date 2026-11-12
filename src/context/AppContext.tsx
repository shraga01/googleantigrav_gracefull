import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import type { UserProfile, Language, StreakData } from '../types';
import { StorageService } from '../services/storage';
import { onAuthChange, signOut as firebaseSignOut } from '../services/auth';
import { FirestoreService } from '../services/firestoreService';

interface AppContextType {
    userProfile: UserProfile | null;
    language: Language;
    isLoading: boolean;
    isAuthenticated: boolean;
    googleId: string | null;
    updateProfile: (profile: UserProfile, syncToServer?: boolean) => Promise<void>;
    setLanguage: (lang: Language) => void;
    refreshProfile: () => void;
    fetchProfileFromServer: () => Promise<UserProfile | null>;
    setGoogleId: (id: string | null) => void;
    streak: StreakData;
    refreshStreak: () => Promise<void>;
    logout: () => Promise<void>;
    newlyUnlockedBadges: string[];
    setNewlyUnlockedBadges: (badges: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // -------------------------------------------------------------------------
    // 1. All useState & useRef Declarations (Strictly at the physical top)
    // -------------------------------------------------------------------------
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => StorageService.getUserProfile());
    const [language, setLanguageState] = useState<Language>(() => {
        const cached = StorageService.getUserProfile();
        return cached?.language || 'english';
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleId, setGoogleIdState] = useState<string | null>(null);
    const [streak, setStreak] = useState<StreakData>(() => StorageService.getStreak());
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);

    const googleIdRef = useRef<string | null>(null);

    // -------------------------------------------------------------------------
    // 2. All useCallback and Pure Utility Functions (Physically above useEffect)
    // -------------------------------------------------------------------------
    const updateDocumentDirection = useCallback((lang: Language) => {
        document.documentElement.dir = lang === 'hebrew' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang === 'hebrew' ? 'he' : 'en';
    }, []);

    const fetchStreakFromServer = useCallback(async (currentUserId?: string) => {
        const uid = currentUserId || googleIdRef.current;
        if (!uid) return;

        try {
            const serverStreak = await FirestoreService.getStreak(uid);
            if (serverStreak) {
                setStreak(serverStreak);
                StorageService.updateStreak(serverStreak);
            }
        } catch (error) {
            console.error('Failed to fetch streak from Firestore:', error);
        }
    }, []);

    const fetchProfileFromServer = useCallback(async (currentUserId?: string): Promise<UserProfile | null> => {
        const uid = currentUserId || googleIdRef.current;
        if (!uid) return null;

        try {
            const profile = await FirestoreService.getUserProfile(uid);
            if (profile) {
                setUserProfile(profile);
                setLanguageState(profile.language);
                updateDocumentDirection(profile.language);
                StorageService.saveUserProfile(profile);
            }
            return profile;
        } catch (error) {
            console.error('Failed to fetch profile from Firestore:', error);
            return null;
        }
    }, [updateDocumentDirection]);

    const updateProfile = useCallback(async (profile: UserProfile, syncToServer = true) => {
        setUserProfile(profile);
        setLanguageState(profile.language);
        updateDocumentDirection(profile.language);
        StorageService.saveUserProfile(profile);

        if (syncToServer && profile.userId) {
            try {
                await FirestoreService.saveUserProfile(profile);
            } catch (error) {
                console.error('Failed to sync profile to Firestore:', error);
            }
        }
    }, [updateDocumentDirection]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        updateDocumentDirection(lang);

        if (userProfile) {
            const updated = { ...userProfile, language: lang };
            void updateProfile(updated);
        }
    }, [userProfile, updateDocumentDirection, updateProfile]);

    const refreshProfile = useCallback(() => {
        const local = StorageService.getUserProfile();
        if (local) {
            setUserProfile(local);
            setLanguageState(local.language);
            updateDocumentDirection(local.language);
        }
    }, [updateDocumentDirection]);

    const setGoogleId = useCallback((id: string | null) => {
        googleIdRef.current = id;
        setGoogleIdState(id);
    }, []);

    const logout = useCallback(async () => {
        console.log('Logging out cleanly...');
        StorageService.clearUserProfile();
        googleIdRef.current = null;
        setUserProfile(null);
        setIsAuthenticated(false);
        setGoogleIdState(null);
        setStreak({
            currentStreak: 0,
            longestStreak: 0,
            totalDaysPracticed: 0,
            lastPracticeDate: null,
            practiceDates: [],
            milestonesAchieved: [],
        });
        await firebaseSignOut();
    }, []);

    // -------------------------------------------------------------------------
    // 3. All useEffect Hooks (Physically below all state & callbacks)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setIsAuthenticated(true);
                googleIdRef.current = firebaseUser.uid;
                setGoogleIdState(firebaseUser.uid);

                // Fetch empirical Firestore data without tearing down auth listener
                await fetchStreakFromServer(firebaseUser.uid);
                await fetchProfileFromServer(firebaseUser.uid);
                setIsLoading(false);
            } else {
                setIsAuthenticated(false);
                googleIdRef.current = null;
                setGoogleIdState(null);
                setUserProfile(StorageService.getUserProfile());
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchStreakFromServer, fetchProfileFromServer]);

    return (
        <AppContext.Provider
            value={{
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
                refreshStreak: async () => {
                    await fetchStreakFromServer();
                },
                logout,
                newlyUnlockedBadges,
                setNewlyUnlockedBadges,
            }}
        >
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
