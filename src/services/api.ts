import { getAuth } from 'firebase/auth';
import type { UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds - increased for Cloud Run cold starts

/**
 * Helper function to fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const ApiService = {
    /**
     * Get the token for the current user
     */
    getToken: async (): Promise<string | null> => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return null;
        return user.getIdToken();
    },

    /**
     * Get the current user's Firebase UID
     */
    getFirebaseUid: (): string | null => {
        const auth = getAuth();
        return auth.currentUser?.uid || null;
    },

    /**
     * Fetch user profile from server
     */
    getProfile: async (): Promise<UserProfile | null> => {
        try {
            const token = await ApiService.getToken();
            if (!token) return null;

            const response = await fetchWithTimeout(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                console.log('No profile found on server');
                return null;
            }

            if (!response.ok) {
                console.warn('Failed to fetch profile from server');
                return null;
            }

            const profile = await response.json();
            console.log('✅ Profile fetched from server');
            return profile as UserProfile;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.warn('Profile fetch timed out');
            } else {
                console.error('Failed to fetch profile:', error);
            }
            return null;
        }
    },

    /**
     * Save/update user profile to server
     */
    saveProfile: async (profile: UserProfile): Promise<boolean> => {
        try {
            const token = await ApiService.getToken();
            if (!token) {
                console.warn('No auth token, cannot save profile to server');
                return false;
            }

            const response = await fetchWithTimeout(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                console.warn('Failed to save profile to server');
                return false;
            }

            console.log('✅ Profile saved to server');
            return true;
        } catch (error) {
            console.error('Failed to save profile:', error);
            return false;
        }
    },

    /**
     * Check if there is an entry for today on the server
     */
    getTodayEntry: async () => {
        try {
            const token = await ApiService.getToken();
            if (!token) return null;

            const today = new Date().toLocaleDateString('en-CA');
            const response = await fetchWithTimeout(`${API_URL}/entries/${today}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.warn('API sync warning:', errorData);
                return null;
            }

            const entry = await response.json();
            return entry;
        } catch (error) {
            console.error('Failed to fetch today\'s entry:', error);
            return null;
        }
    },

    /**
     * Save/update daily entry to server
     */
    saveEntry: async (entry: any): Promise<boolean> => {
        try {
            const token = await ApiService.getToken();
            if (!token) {
                console.warn('No auth token, cannot save entry to server');
                return false;
            }

            const response = await fetchWithTimeout(`${API_URL}/entries`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });

            if (!response.ok) {
                console.warn('Failed to save entry to server');
                return false;
            }

            console.log('✅ Entry saved to server');
            return true;
        } catch (error) {
            console.error('Failed to save entry:', error);
            return false;
        }
    },

    /**
     * Get user streak from server
     */
    getStreak: async (): Promise<{ currentStreak: number; longestStreak: number; totalDaysPracticed: number; lastPracticeDate: string | null } | null> => {
        try {
            const token = await ApiService.getToken();
            if (!token) return null;

            const response = await fetchWithTimeout(`${API_URL}/streak`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.warn('Failed to fetch streak from server');
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch streak:', error);
            return null;
        }
    }
};
