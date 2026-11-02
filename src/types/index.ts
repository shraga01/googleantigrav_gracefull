export type Language = 'hebrew' | 'english';

export interface UserProfile {
    userId: string;
    language: Language;
    name?: string;
    gender?: string;
    dateOfBirth?: string;
    familyStatus?: string;
    children?: string[];
    career?: string;
    livingSituation?: string;
    dreams?: string;
    goals?: string;
    joys?: string;
    challenges?: string;
    otherInfo?: string;
    unlockedBadges?: { code: string; awardedAt: number }[];
    createdAt: number;
    reminderTime?: string;
}

/**
 * Individual Evidence-Based Gratitude Item.
 * In accordance with Seligman et al. (Three Good Things Protocol):
 * Agency Attribution (ייחוס סיבתי / סוכנות) is the active clinical ingredient.
 */
export interface GratitudeItem {
    act: string;               // Concrete occurrence: What happened specifically?
    benefactor?: string;      // Who was involved (or self)
    benefit: string;          // Concrete benefit: How did it make life easier/better?
    agencyAttribution: string; // Mandatory: Why did this happen? What was my role/condition?
    mentalSubtraction?: string;// Counterfactual: What would life look like without this?
}

export type GratitudeProtocolType = 'three_good_things' | 'gratitude_letter' | 'mental_subtraction';

export interface GratitudeLetter {
    letterId: string;
    userId: string;
    recipient: string;
    relationship: string;
    content: string;
    impactOnLife: string;
    virtualDeliveryMethod: 'read_aloud' | 'empty_chair' | 'sent_direct';
    createdAt: number;
}

export interface DailyEntry {
    entryId: string;
    userId?: string;
    date: string; // YYYY-MM-DD
    protocol?: GratitudeProtocolType;
    openingSentence: string;
    suggestions: string[];
    items?: GratitudeItem[]; // Structured clinical protocol items
    userContent: {
        type: 'text' | 'audio';
        content: string; // Text or Base64 audio
        duration?: number;
    };
    mentalSubtractionReflection?: string;
    completedAt: number;
    streakDay: number;
    milestoneReached?: string;
    qualityScore?: number; // 0 to 100
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalDaysPracticed: number;
    lastPracticeDate: string | null; // YYYY-MM-DD
    practiceDates?: string[];
    milestonesAchieved: string[];
}

// Modular Prompt Engine Dimensions
export type PromptTarget = 'self' | 'close_other' | 'stranger' | 'environment' | 'adversity_relief';
export type PromptLens = 'somatic' | 'relational' | 'competence' | 'sensory';
export type PromptAngle = 'novelty' | 'depth' | 'subtraction';
export type PromptConstraint = 'no_generic_nouns' | 'require_agency' | 'under_40_words';

export interface PromptConfig {
    target: PromptTarget;
    lens: PromptLens;
    angle: PromptAngle;
    constraints: PromptConstraint[];
}

export interface ApiStreakResponse {
    currentStreak: number;
    longestStreak: number;
    totalDaysPracticed: number;
    lastPracticeDate: string | null;
    practiceDates?: string[];
}

export interface ApiEntryResponse extends DailyEntry {
    serverTimestamp?: number;
}
