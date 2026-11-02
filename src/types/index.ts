export type Language = 'hebrew' | 'english';
export type Locale = 'he' | 'en';

export interface DosingSchedule {
    phase: 'onboarding_daily_21' | 'maintenance_variety';
    startDate: string; // ISO string
    currentDay: number; // 1 to 21 during onboarding, or overall count
    targetWeeklyFrequency: 7 | 3; // 7 during onboarding, 2-3 during maintenance
    weeklyCompletedCount: number;
    lastPracticeDate: string | null; // YYYY-MM-DD
}

export interface UserProfile {
    userId: string;
    language: Language;
    locale: Locale;
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
    dosingSchedule?: DosingSchedule;
    unlockedBadges?: { code: string; awardedAt: number }[];
    createdAt: number;
    reminderTime?: string;
}

/**
 * Validated 6-Item Gratitude Questionnaire (GQ-6)
 * McCullough, Emmons, & Tsang (2002).
 * Administered longitudinally at T1 (Baseline), T2 (Day 21), T3 (Day 60+).
 */
export interface GQ6Assessment {
    assessmentId: string;
    userId: string;
    timepoint: 'T1_baseline' | 'T2_midpoint' | 'T3_maintenance';
    items: [number, number, number, number, number, number]; // 1-7 Likert for items 1-6
    reverseItem3: number; // Inverted score for negative item 3
    reverseItem6: number; // Inverted score for negative item 6
    totalScore: number;   // 6 to 42
    completedAt: number;
}

/**
 * Evidence-Based Three Good Things (3GT) Item.
 * In accordance with Seligman et al. protocol:
 * `causalReflection` (Agency Attribution) is the mandatory clinical active ingredient.
 */
export interface ThreeGoodThingsItem {
    act: string;               // Specific concrete event
    benefactor?: string;      // Person involved (or self)
    benefit: string;          // Concrete benefit / ease
    causalReflection: string; // Mandatory: "Why did this happen? What was my personal role, choice, or condition?"
    affectRating: number;     // 1-7 Likert rating of affective elevation / ease
    mentalSubtraction?: string;// Optional counterfactual reflection
}

export type GratitudeItem = ThreeGoodThingsItem;

export type GratitudeProtocolType =
    | 'three_good_things'
    | 'gratitude_letter'
    | 'virtual_visit'
    | 'mental_subtraction'
    | 'huberman_recall'
    | 'gq6_assessment';

export interface GratitudeLetter {
    letterId: string;
    userId: string;
    recipient: string;
    relationship: string;
    content: string; // ~300 words
    impactOnLife: string;
    virtualDeliveryMethod: 'read_aloud' | 'empty_chair' | 'sent_direct';
    createdAt: number;
}

/**
 * Empty Chair 3-Position Virtual Gratitude Visit Protocol
 * Position 1: Self Expressing (reading letter to visualized person)
 * Position 2: Other Responding (embodying recipient in empty chair, receiving gratitude)
 * Position 3: Self Integration (returning to self, anchoring somatic relief and prosocial bond)
 */
export interface VirtualGratitudeVisit {
    visitId: string;
    userId: string;
    letterId?: string;
    recipient: string;
    position1_selfExpressing: string;
    position2_otherResponding: string;
    position3_selfIntegration: string;
    completedAt: number;
}

/**
 * Huberman Narrative Recall Protocol
 * Andrew Huberman neurobiology protocol:
 * Recalling receiving genuine gratitude triggers heightened mPFC & autonomic vagal activation.
 */
export interface HubermanStory {
    storyId: string;
    userId: string;
    benefactor: string;   // Who thanked the user
    context: string;      // The action/help the user provided
    wordsReceived: string;// The specific words or sentiment communicated
    somaticEcho: string;  // The physiological feeling (warmth in chest, calming)
    completedAt: number;
}

export interface DailyEntry {
    entryId: string;
    userId?: string;
    date: string; // YYYY-MM-DD
    protocol?: GratitudeProtocolType;
    openingSentence: string;
    suggestions: string[];
    items?: ThreeGoodThingsItem[];
    userContent: {
        type: 'text' | 'audio';
        content: string;
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
    lastPracticeDate: string | null;
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

export interface EmpiricalHistoricalContext {
    profile: UserProfile | null;
    streak: StreakData | null;
    recentEntries: DailyEntry[];
    latestGQ6: GQ6Assessment | null;
    totalGQ6Count: number;
    latestVisit: VirtualGratitudeVisit | null;
    latestStory: HubermanStory | null;
    dosingPhase: 'onboarding_daily_21' | 'maintenance_variety';
}

