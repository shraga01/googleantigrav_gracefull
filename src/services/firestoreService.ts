/**
 * Firestore Empirical Data Service
 * 
 * Enforces Zero-Trust, Server-Side Authority, and Zero Mocks.
 * All user data is isolated under /users/{userId}/**.
 */

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, DailyEntry, StreakData, GratitudeLetter } from '../types';

export const FirestoreService = {
    /**
     * User Profile
     */
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const snapshot = await getDoc(userDocRef);
            if (snapshot.exists()) {
                return snapshot.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile from Firestore:', error);
            throw error;
        }
    },

    saveUserProfile: async (profile: UserProfile): Promise<void> => {
        try {
            const userDocRef = doc(db, 'users', profile.userId);
            await setDoc(userDocRef, profile, { merge: true });
        } catch (error) {
            console.error('Error saving user profile to Firestore:', error);
            throw error;
        }
    },

    /**
     * Daily Entries
     */
    getEntries: async (userId: string, count = 30): Promise<DailyEntry[]> => {
        try {
            const entriesColRef = collection(db, 'users', userId, 'entries');
            const q = query(entriesColRef, orderBy('completedAt', 'desc'), limit(count));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => d.data() as DailyEntry);
        } catch (error) {
            console.error('Error fetching entries from Firestore:', error);
            throw error;
        }
    },

    getEntryByDate: async (userId: string, date: string): Promise<DailyEntry | null> => {
        try {
            const entriesColRef = collection(db, 'users', userId, 'entries');
            const q = query(entriesColRef, where('date', '==', date), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs[0].data() as DailyEntry;
            }
            return null;
        } catch (error) {
            console.error('Error fetching entry by date from Firestore:', error);
            throw error;
        }
    },

    saveEntry: async (userId: string, entry: DailyEntry): Promise<void> => {
        try {
            const entryDocRef = doc(db, 'users', userId, 'entries', entry.entryId);
            await setDoc(entryDocRef, {
                ...entry,
                userId,
            });
        } catch (error) {
            console.error('Error saving entry to Firestore:', error);
            throw error;
        }
    },

    /**
     * Streak & Practice Tracking
     */
    getStreak: async (userId: string): Promise<StreakData> => {
        try {
            const streakDocRef = doc(db, 'users', userId, 'streak', 'summary');
            const snapshot = await getDoc(streakDocRef);
            if (snapshot.exists()) {
                return snapshot.data() as StreakData;
            }
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysPracticed: 0,
                lastPracticeDate: null,
                practiceDates: [],
                milestonesAchieved: [],
            };
        } catch (error) {
            console.error('Error fetching streak from Firestore:', error);
            throw error;
        }
    },

    updateStreak: async (userId: string, streak: StreakData): Promise<void> => {
        try {
            const streakDocRef = doc(db, 'users', userId, 'streak', 'summary');
            await setDoc(streakDocRef, streak, { merge: true });
        } catch (error) {
            console.error('Error updating streak in Firestore:', error);
            throw error;
        }
    },

    /**
     * Gratitude Letters
     */
    saveGratitudeLetter: async (userId: string, letter: GratitudeLetter): Promise<void> => {
        try {
            const letterDocRef = doc(db, 'users', userId, 'letters', letter.letterId);
            await setDoc(letterDocRef, letter);
        } catch (error) {
            console.error('Error saving gratitude letter to Firestore:', error);
            throw error;
        }
    },

    getGratitudeLetters: async (userId: string): Promise<GratitudeLetter[]> => {
        try {
            const lettersColRef = collection(db, 'users', userId, 'letters');
            const q = query(lettersColRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => d.data() as GratitudeLetter);
        } catch (error) {
            console.error('Error fetching gratitude letters:', error);
            throw error;
        }
    },
};
