import type { Badge } from '../types/badges';
import type { FluentIconName } from '../components/common/FluentIcon';
import type { DailyEntry, StreakData } from '../types';
import { StorageService } from '../services/storage';

// Map badge codes to their CSS class for 3D icon styling
export const getBadgeIconClass = (code: string): string => {
    const classMap: Record<string, string> = {
        'first_step': 'badge-icon-first-step',
        'perfect_day': 'badge-icon-perfect-day',
        'week_champion': 'badge-icon-week-champion',
        'streak_14': 'badge-icon-streak-14',
        'streak_21': 'badge-icon-streak-21',
        'streak_28': 'badge-icon-streak-28',
        'milestone_10': 'badge-icon-milestone-10',
        'milestone_25': 'badge-icon-milestone-25',
        'milestone_50': 'badge-icon-milestone-50',
        'milestone_100': 'badge-icon-milestone-100',
        'community_sharer': 'badge-icon-community-sharer',
        'friend_recruiter': 'badge-icon-friend-recruiter',
    };
    return classMap[code] || 'badge-icon';
};

// Get the number to display inside badge
export const getBadgeNumber = (code: string): string | null => {
    const numberMap: Record<string, string> = {
        'first_step': '1',
        'week_champion': '7',
        'streak_14': '14',
        'streak_21': '21',
        'streak_28': '28',
        'milestone_10': '10',
        'milestone_25': '25',
        'milestone_50': '50',
        'milestone_100': '100',
    };
    return numberMap[code] || null;
};

// Map badge codes to FluentIcon names
export const getBadgeFluentIcon = (code: string): FluentIconName | null => {
    switch (code) {
        case 'first_step': return 'Coin';
        case 'perfect_day': return 'Star';
        case 'week_champion': return 'Crown';
        case 'community_sharer': return 'Handshake';
        case 'friend_recruiter': return 'People';
        default: return null;
    }
};

export const ALL_BADGES: Badge[] = [
    { _id: '1', code: 'first_step', name: 'סיום ראשון', nameEn: 'First Complete', description: 'השלמת את היום הראשון שלך!', descriptionEn: 'Completed your first day!', icon: '1', category: 'milestone', isUnlocked: false, awardedAt: undefined, order: 1 },
    { _id: '2', code: 'perfect_day', name: 'יום מושלם', nameEn: 'Perfect Day', description: 'קיבלת ציון 100 ביום אחד', descriptionEn: '100% score in one day', icon: '⭐', category: 'quality', isUnlocked: false, order: 2 },
    { _id: '3', code: 'week_champion', name: 'אלוף שבועי', nameEn: 'Week Champion', description: 'רצף של 7 ימים', descriptionEn: '7 day streak', icon: '7', category: 'streak', isUnlocked: false, order: 3 },
    { _id: '4', code: 'streak_14', name: 'רצף 14', nameEn: 'Streak 14', description: 'רצף של 14 ימים', descriptionEn: '14 day streak', icon: '14', category: 'streak', isUnlocked: false, order: 4 },
    { _id: '5', code: 'streak_21', name: 'רצף 21', nameEn: 'Streak 21', description: 'רצף של 21 ימים', descriptionEn: '21 day streak', icon: '21', category: 'streak', isUnlocked: false, order: 5 },
    { _id: '6', code: 'streak_28', name: 'רצף 28', nameEn: 'Streak 28', description: 'רצף של 28 ימים', descriptionEn: '28 day streak', icon: '28', category: 'streak', isUnlocked: false, order: 6 },
    { _id: '7', code: 'milestone_10', name: '10 רשומות', nameEn: '10 Entries', description: 'כתבת 10 רשומות', descriptionEn: 'Wrote 10 entries', icon: '10', category: 'milestone', isUnlocked: false, order: 7 },
    { _id: '8', code: 'milestone_25', name: '25 רשומות', nameEn: '25 Entries', description: 'כתבת 25 רשומות', descriptionEn: 'Wrote 25 entries', icon: '25', category: 'milestone', isUnlocked: false, order: 8 },
    { _id: '9', code: 'milestone_50', name: '50 רשומות', nameEn: '50 Entries', description: 'כתבת 50 רשומות', descriptionEn: 'Wrote 50 entries', icon: '50', category: 'milestone', isUnlocked: false, order: 9 },
    { _id: '10', code: 'milestone_100', name: '100 רשומות', nameEn: '100 Entries', description: 'כתבת 100 רשומות', descriptionEn: 'Wrote 100 entries', icon: '100', category: 'milestone', isUnlocked: false, order: 10 },
    { _id: '11', code: 'community_sharer', name: 'מפיץ אור והוקרה', nameEn: 'Gratitude Sharer', description: 'שיתפת הכרת תודה ב-WhatsApp', descriptionEn: 'Shared gratitude via WhatsApp', icon: '🤝', category: 'social', isUnlocked: false, order: 11 },
    { _id: '12', code: 'friend_recruiter', name: 'מגייס חברים', nameEn: 'Friend Recruiter', description: 'הזמנת חבר לתרגול ב-WhatsApp', descriptionEn: 'Invited a friend via WhatsApp', icon: '👥', category: 'social', isUnlocked: false, order: 12 },
];

export function evaluateBadges(
    entries: DailyEntry[],
    streak: StreakData,
    alreadyUnlockedCodes: string[] = []
): {
    unlockedBadges: Badge[];
    newlyUnlockedCodes: string[];
    progressMap: Record<string, { current: number; target: number }>;
} {
    const alreadyUnlockedSet = new Set(alreadyUnlockedCodes);
    const newlyUnlockedCodes: string[] = [];
    const progressMap: Record<string, { current: number; target: number }> = {};

    // 1. Compute empirical metrics from entries and streak
    const totalDays = Math.max(streak.totalDaysPracticed || 0, entries.length);
    const totalEntries = entries.length;
    const longestStreak = Math.max(streak.longestStreak || 0, streak.currentStreak || 0);

    let maxMomentsInAnyDay = 0;
    for (const entry of entries) {
        if (entry.items && Array.isArray(entry.items)) {
            const count = entry.items.filter((it) => it && typeof it.act === 'string' && it.act.trim().length > 0).length;
            if (count > maxMomentsInAnyDay) {
                maxMomentsInAnyDay = count;
            }
        }
    }

    const hasShared = StorageService.hasSharedGratitude();
    const hasInvited = StorageService.hasInvitedFriend();

    // 2. Define criteria and progress for each of the 12 badges
    const badgeEvaluators: Record<string, { condition: boolean; current: number; target: number }> = {
        first_step: {
            condition: totalDays >= 1,
            current: Math.min(totalDays, 1),
            target: 1,
        },
        perfect_day: {
            condition: maxMomentsInAnyDay >= 3,
            current: Math.min(maxMomentsInAnyDay, 3),
            target: 3,
        },
        week_champion: {
            condition: longestStreak >= 7,
            current: Math.min(longestStreak, 7),
            target: 7,
        },
        streak_14: {
            condition: longestStreak >= 14,
            current: Math.min(longestStreak, 14),
            target: 14,
        },
        streak_21: {
            condition: longestStreak >= 21,
            current: Math.min(longestStreak, 21),
            target: 21,
        },
        streak_28: {
            condition: longestStreak >= 28,
            current: Math.min(longestStreak, 28),
            target: 28,
        },
        milestone_10: {
            condition: totalEntries >= 10,
            current: Math.min(totalEntries, 10),
            target: 10,
        },
        milestone_25: {
            condition: totalEntries >= 25,
            current: Math.min(totalEntries, 25),
            target: 25,
        },
        milestone_50: {
            condition: totalEntries >= 50,
            current: Math.min(totalEntries, 50),
            target: 50,
        },
        milestone_100: {
            condition: totalEntries >= 100,
            current: Math.min(totalEntries, 100),
            target: 100,
        },
        community_sharer: {
            condition: hasShared,
            current: hasShared ? 1 : 0,
            target: 1,
        },
        friend_recruiter: {
            condition: hasInvited,
            current: hasInvited ? 1 : 0,
            target: 1,
        },
    };

    // 3. Evaluate each badge in ALL_BADGES
    const unlockedBadges: Badge[] = [];

    for (const badge of ALL_BADGES) {
        const evalInfo = badgeEvaluators[badge.code] || { condition: false, current: 0, target: 1 };
        const isPreviouslyUnlocked = alreadyUnlockedSet.has(badge.code);
        const conditionMet = evalInfo.condition;
        const isNowUnlocked = isPreviouslyUnlocked || conditionMet;

        // If previously unlocked, show full progress
        progressMap[badge.code] = {
            current: isPreviouslyUnlocked ? evalInfo.target : evalInfo.current,
            target: evalInfo.target,
        };

        if (conditionMet && !isPreviouslyUnlocked) {
            newlyUnlockedCodes.push(badge.code);
        }

        if (isNowUnlocked) {
            unlockedBadges.push({
                ...badge,
                isUnlocked: true,
                awardedAt: badge.awardedAt || new Date().toISOString(),
            });
        }
    }

    return {
        unlockedBadges,
        newlyUnlockedCodes,
        progressMap,
    };
}
