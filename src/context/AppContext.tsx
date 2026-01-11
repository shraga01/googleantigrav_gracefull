import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Language } from '../types';
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
    setGoogleId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [language, setLanguageState] = useState<Language>('english');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleId, setGoogleIdState] = useState<string | null>(null);

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
    }, []);

    const loadData = () => {
        setIsLoading(true);
        const profile = StorageService.getUserProfile();
        if (profile) {
            setUserProfile(profile);
            setLanguageState(profile.language);

            // Update document direction based on language
            document.documentElement.dir = profile.language === 'hebrew' ? 'rtl' : 'ltr';
            document.documentElement.lang = profile.language === 'hebrew' ? 'he' : 'en';
        }
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

    const setGoogleId = (id: string | null) => {
        setGoogleIdState(id);
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
            setGoogleId
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
