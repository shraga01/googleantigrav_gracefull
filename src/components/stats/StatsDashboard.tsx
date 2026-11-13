import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { useApp } from '../../context/AppContext';
import { BadgeList } from '../profile/BadgeList';
import { evaluateBadges } from '../../utils/badgeUtils';
import type { StreakData } from '../../types';

export const StatsDashboard: React.FC = () => {
    const { userProfile, updateProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    // -------------------------------------------------------------------------
    // 1. All useState & useRef Declarations (Strictly at physical top - Rule 1.3)
    // -------------------------------------------------------------------------
    const [streakData, setStreakData] = useState<StreakData>(() => {
        return StorageService.reconcileStreakFromEntries();
    });

    const [unlockedCodesState, setUnlockedCodesState] = useState<string[]>(() => {
        const storedProfile = StorageService.getUserProfile();
        const profileCodes = userProfile?.unlockedBadges?.map((b) => b.code)
            || storedProfile?.unlockedBadges?.map((b) => b.code)
            || [];
        const initialEntries = StorageService.getEntries();
        const currentStreak = StorageService.reconcileStreakFromEntries();
        const evalResult = evaluateBadges(initialEntries, currentStreak, profileCodes);
        return Array.from(new Set([...profileCodes, ...evalResult.unlockedBadges.map((b) => b.code)]));
    });

    // -------------------------------------------------------------------------
    // 2. All useCallback & useMemo (Physically above useEffect - Rule 1.3)
    // -------------------------------------------------------------------------
    const entries = useMemo(() => StorageService.getEntries(), []);

    const badgeEvaluation = useMemo(() => {
        return evaluateBadges(entries, streakData, unlockedCodesState);
    }, [entries, streakData, unlockedCodesState]);

    const allUnlockedCodes = useMemo(() => {
        return Array.from(new Set([
            ...unlockedCodesState,
            ...badgeEvaluation.unlockedBadges.map((b) => b.code),
        ]));
    }, [unlockedCodesState, badgeEvaluation.unlockedBadges]);

    const refreshDashboard = useCallback(() => {
        const reconciled = StorageService.reconcileStreakFromEntries();
        const latestEntries = StorageService.getEntries();
        const existingCodes = userProfile?.unlockedBadges?.map((b) => b.code)
            || StorageService.getUserProfile()?.unlockedBadges?.map((b) => b.code)
            || [];
        const evalResult = evaluateBadges(latestEntries, reconciled, existingCodes);

        const newUnlockedList = Array.from(new Set([
            ...existingCodes,
            ...evalResult.unlockedBadges.map((b) => b.code),
        ]));

        setStreakData(reconciled);
        setUnlockedCodesState(newUnlockedList);

        if (userProfile && updateProfile) {
            updateProfile({
                ...userProfile,
                unlockedBadges: evalResult.unlockedBadges.map((b) => ({
                    code: b.code,
                    awardedAt: typeof b.awardedAt === 'string' ? new Date(b.awardedAt).getTime() : (b.awardedAt || Date.now()),
                })),
            }, false);
        } else {
            const cached = StorageService.getUserProfile();
            if (cached) {
                StorageService.saveUserProfile({
                    ...cached,
                    unlockedBadges: evalResult.unlockedBadges.map((b) => ({
                        code: b.code,
                        awardedAt: typeof b.awardedAt === 'string' ? new Date(b.awardedAt).getTime() : (b.awardedAt || Date.now()),
                    })),
                });
            }
        }
    }, [userProfile, updateProfile]);

    const handleInviteFriend = useCallback(() => {
        const inviteText = isHebrew
            ? 'היי! אני מתרגל הכרת תודה יומית באפליקציה הזו וזה ממש מעלה את מצב הרוח. מזמין אותך להצטרף אלי: https://daily-appreciation-app-275bf.web.app'
            : 'Hey! I am practicing daily gratitude with this app and it has been wonderful. Join me: https://daily-appreciation-app-275bf.web.app';

        StorageService.markFriendInvited();
        window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');

        // Immediately refresh streak, unlock friend_recruiter, and sync profile
        refreshDashboard();
    }, [isHebrew, refreshDashboard]);

    const handleBadgeAction = useCallback(() => {
        refreshDashboard();
    }, [refreshDashboard]);

    // -------------------------------------------------------------------------
    // 3. useEffect Hooks (Physically below all hooks referencing them - Rule 1.3)
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Sync newly discovered badges to external profile storage (zero setState cascading renders)
        if (badgeEvaluation.newlyUnlockedCodes.length > 0) {
            const formattedBadges = badgeEvaluation.unlockedBadges.map((b) => ({
                code: b.code,
                awardedAt: typeof b.awardedAt === 'string' ? new Date(b.awardedAt).getTime() : (b.awardedAt || Date.now()),
            }));

            if (userProfile && updateProfile) {
                updateProfile({
                    ...userProfile,
                    unlockedBadges: formattedBadges,
                }, false);
            } else {
                const cached = StorageService.getUserProfile();
                if (cached) {
                    StorageService.saveUserProfile({
                        ...cached,
                        unlockedBadges: formattedBadges,
                    });
                }
            }
        }
    }, [badgeEvaluation.newlyUnlockedCodes.length, badgeEvaluation.unlockedBadges, updateProfile, userProfile]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingTop: '10px' }} dir={isHebrew ? 'rtl' : 'ltr'}>
            {/* Top Streak & Total Days Row */}
            <div className="grid grid-cols-2 gap-3.5 mb-4">
                {/* Current Streak Card */}
                <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-amber-200/70 shadow-soft-card flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-extrabold text-amber-900 tracking-tight leading-none mb-1">
                            {streakData.currentStreak}
                        </div>
                        <div className="text-xs font-semibold text-stone-600">
                            {isHebrew ? 'רצף נוכחי' : 'Current Streak'}
                        </div>
                    </div>
                    {/* Warm Stitch circular/rounded-2xl icon wrapper with crisp flame SVG */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                        </svg>
                    </div>
                </div>

                {/* Total Days Card */}
                <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-emerald-200/70 shadow-soft-card flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-extrabold text-stone-900 tracking-tight leading-none mb-1">
                            {streakData.totalDaysPracticed}
                        </div>
                        <div className="text-xs font-semibold text-stone-600">
                            {isHebrew ? 'סה״כ ימים' : 'Total Days'}
                        </div>
                    </div>
                    {/* Sage/emerald icon wrapper with calendar/check SVG */}
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Longest Streak & Last Practice Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-stone-200/80 mb-4 text-stone-800 shadow-xs">
                <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-600">{isHebrew ? 'רצף שיא' : 'Longest Streak'}</span>
                    <span className="text-sm font-bold text-stone-900">{streakData.longestStreak}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-stone-600">{isHebrew ? 'תרגול אחרון' : 'Last Practice'}</span>
                    <span className="text-sm font-bold text-stone-900">{streakData.lastPracticeDate || '-'}</span>
                </div>
            </div>

            {/* Inviting WhatsApp Invite Button */}
            <div className="mb-4">
                <button
                    onClick={handleInviteFriend}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                    <span className="text-base">💌</span>
                    <span>{isHebrew ? 'הזמן חבר לתרגול ב-WhatsApp' : 'Invite a Friend via WhatsApp'}</span>
                </button>
            </div>

            {/* Badges Section in Clean Warm Stitch Container */}
            <div className="bg-white rounded-3xl p-5 shadow-soft-card border border-amber-100/90">
                <BadgeList
                    unlockedBadgeCodes={allUnlockedCodes}
                    isLoading={false}
                    isHebrew={isHebrew}
                    progressMap={badgeEvaluation.progressMap}
                    onBadgeAction={handleBadgeAction}
                />
            </div>
        </div>
    );
};
