import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, Language } from '../types';
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
    logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [language, setLanguageState] = useState<Language>('english');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [googleId, setGoogleIdState] = useState<string | null>(null);

    useEffect(() => {
        // Initial load from localStorage
        loadFromLocalStorage();

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                console.log('Auth state: User signed in', user.uid);
                setIsAuthenticated(true);
                setGoogleIdState(user.uid);

                // Check if cached profile matches current user
                const cachedProfile = StorageService.getUserProfile();
                if (cachedProfile && cachedProfile.userId === user.uid) {
                    console.log('Using cached profile for user:', user.uid);
                    setUserProfile(cachedProfile);
                    setLanguageState(cachedProfile.language);
                    updateDocumentDirection(cachedProfile.language);
                } else {
                    // Try to fetch profile from server
                    console.log('Fetching profile from server for user:', user.uid);
                    try {
                        const serverProfile = await ApiService.getProfile();
                        if (serverProfile) {
                            console.log('Got profile from server');
                            // Cache it locally
                            StorageService.saveUserProfile(serverProfile);
                            setUserProfile(serverProfile);
                            setLanguageState(serverProfile.language);
                            updateDocumentDirection(serverProfile.language);
                        } else {
                            console.log('No profile on server - user needs onboarding');
                            // No profile exists - user needs to complete onboarding
                            setUserProfile(null);
                        }
                    } catch (error) {
                        console.error('Failed to fetch profile from server:', error);
                        // Fall back to null - show onboarding
                        setUserProfile(null);
                    }
                }
                setIsLoading(false);
            } else {
                console.log('Auth state: User signed out');
                setIsAuthenticated(false);
                setGoogleIdState(null);
                setUserProfile(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
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

    const setGoogleId = (id: string | null) => {
        setGoogleIdState(id);
    };

    const logout = async () => {
        console.log('Logging out...');
        // 1. Clear React state (but DON'T clear localStorage - keep as cache)
        setUserProfile(null);
        setIsAuthenticated(false);
        setGoogleIdState(null);

        // 2. Sign out of Firebase
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
            logout
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
