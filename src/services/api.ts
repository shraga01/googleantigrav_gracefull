import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
     * Check if there is an entry for today on the server
     */
    getTodayEntry: async () => {
        try {
            const token = await ApiService.getToken();
            if (!token) return null;

            const today = new Date().toLocaleDateString('en-CA');
            const response = await fetch(`${API_URL}/entries/${today}`, {
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
    }
};
