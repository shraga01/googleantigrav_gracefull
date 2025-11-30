export type Language = 'hebrew' | 'english';

export interface UserProfile {
    userId: string;
    language: Language;
    name?: string;
    gender?: string;
    dateOfBirth?: string;
    familyStatus?: string;
    children?: string[]; // Simplified for now, or array of objects
    career?: string;
    livingSituation?: string;
    dreams?: string;
    goals?: string;
    joys?: string;
    challenges?: string;
    otherInfo?: string;
    createdAt: number;
    reminderTime?: string;
}

export interface DailyEntry {
    entryId: string;
    date: string; // YYYY-MM-DD
    openingSentence: string;
    suggestions: string[];
    userContent: {
        type: 'text' | 'audio';
        content: string; // Text or Base64 audio
        duration?: number;
    };
    completedAt: number;
    streakDay: number;
    milestoneReached?: string;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalDaysPracticed: number;
    lastPracticeDate: string | null; // YYYY-MM-DD
    milestonesAchieved: string[];
}
