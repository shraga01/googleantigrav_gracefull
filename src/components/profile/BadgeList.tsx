import React, { useState } from 'react';
import type { Badge } from '../../types/badges';
import '../../styles/badges.css';
import {
    ALL_BADGES,
    getBadgeIconClass,
    getBadgeNumber,
} from '../../utils/badgeUtils';
import { StorageService } from '../../services/storage';

const BadgeIcon: React.FC<{ badge: Badge; isUnlocked: boolean; isHebrew?: boolean }> = ({ badge, isHebrew }) => {
    const code = badge.code;
    const number = getBadgeNumber(code);

    if (code === 'first_step') {
        return (
            <div className="relative flex items-center justify-center w-full h-full">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 5.6L20 10l-4.4 3.8L17 19.5 12 16.5 7 19.5 8.4 13.8 4 10l5.6-2.4L12 2z" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white pt-0.5">
                    1
                </span>
            </div>
        );
    }

    if (code === 'perfect_day') {
        return (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 5.6L20 10l-4.4 3.8L17 19.5 12 16.5 7 19.5 8.4 13.8 4 10l5.6-2.4L12 2z" />
                <path d="M19 2l.7 1.6L21.3 4.3l-1.6.7L19 6.6l-.7-1.6-1.6-.7 1.6-.7L19 2z" />
                <path d="M5 17l.5 1.2 1.2.5-1.2.5L5 20.4l-.5-1.2-1.2-.5 1.2-.5L5 17z" />
            </svg>
        );
    }

    if (code === 'week_champion') {
        return (
            <div className="relative flex items-center justify-center w-full h-full">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white pt-1">
                    7
                </span>
            </div>
        );
    }

    if (code === 'community_sharer') {
        return (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        );
    }

    if (code === 'friend_recruiter') {
        return (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        );
    }

    if (code.startsWith('streak_')) {
        return (
            <div className="flex flex-col items-center justify-center leading-none">
                <span className="text-lg font-black tracking-tight">{number}</span>
                <span className="text-[9px] font-bold opacity-80 uppercase">{isHebrew ? 'ימים' : 'DAYS'}</span>
            </div>
        );
    }

    if (code.startsWith('milestone_')) {
        return (
            <div className="flex flex-col items-center justify-center leading-none">
                <span className="text-lg font-black tracking-tight">{number}</span>
                <span className="text-[8px] font-bold opacity-80 uppercase">{isHebrew ? 'רשומות' : 'ENTRIES'}</span>
            </div>
        );
    }

    return number ? (
        <span className="text-base font-black">{number}</span>
    ) : null;
};

export interface BadgeListProps {
    unlockedBadgeCodes: string[];
    isLoading?: boolean;
    isHebrew?: boolean;
    progressMap?: Record<string, { current: number; target: number }>;
    onBadgeAction?: (badgeCode: string) => void;
}

export const BadgeList: React.FC<BadgeListProps> = ({
    unlockedBadgeCodes,
    isLoading,
    isHebrew,
    progressMap,
    onBadgeAction,
}) => {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const badges = ALL_BADGES.map((b) => ({
        ...b,
        isUnlocked: unlockedBadgeCodes.includes(b.code),
    }));

    if (isLoading) {
        return (
            <div className="w-full text-center">
                <div className="text-stone-900 font-bold text-lg mb-4">
                    {isHebrew ? 'הישגים' : 'Achievements'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#FAF7F2] border border-stone-200/80 rounded-2xl h-36" />
                    ))}
                </div>
            </div>
        );
    }

    const sortedBadges = [...badges].sort((a, b) => a.order - b.order);

    return (
        <div style={{ direction: isHebrew ? 'rtl' : 'ltr' }}>
            <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                    {isHebrew ? 'הישגים ותגים' : 'Achievements & Badges'}
                </h3>
                <p className="text-xs text-stone-500">
                    {isHebrew ? 'המשיכו לתרגל כדי לפתוח תגים חדשים ולהעמיק את התרגול' : 'Keep practicing to unlock badges and deepen your practice'}
                </p>
            </div>

            {/* Single Unified Grid: 6 rows of 2 on mobile, 4 rows of 3 on desktop - Zero orphan rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {sortedBadges.map((badge) => {
                    const isUnlocked = badge.isUnlocked;
                    const progress = progressMap?.[badge.code] || { current: isUnlocked ? 1 : 0, target: 1 };

                    if (isUnlocked) {
                        return (
                            <div
                                key={badge.code}
                                onClick={() => setSelectedBadge(badge)}
                                className="bg-gradient-to-b from-amber-50/90 to-orange-50/50 border-2 border-amber-300 rounded-2xl p-3.5 shadow-xs flex flex-col items-center justify-between text-center cursor-pointer transition-transform hover:-translate-y-0.5 relative min-h-[140px]"
                            >
                                <div className={`badge-icon ${getBadgeIconClass(badge.code)} badge-unlocked text-white`}>
                                    <BadgeIcon badge={badge} isUnlocked={true} isHebrew={isHebrew} />
                                </div>
                                <div className="text-stone-900 font-bold text-xs line-clamp-1 mb-1.5">
                                    {isHebrew ? badge.name : (badge.nameEn || badge.name)}
                                </div>
                                <div className="mt-auto">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                                        ✓ {isHebrew ? 'נפתח' : 'Unlocked'}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={badge.code}
                            onClick={() => setSelectedBadge(badge)}
                            className="bg-[#FAF7F2] border border-stone-200/90 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center cursor-pointer transition-transform hover:-translate-y-0.5 relative min-h-[140px]"
                        >
                            <div className="w-14 h-14 aspect-square rounded-2xl shrink-0 flex items-center justify-center mx-auto mb-2 relative bg-white border border-amber-200/70 text-amber-700 shadow-xs">
                                <BadgeIcon badge={badge} isUnlocked={false} isHebrew={isHebrew} />
                            </div>
                            <div className="text-stone-700 font-semibold text-xs line-clamp-1 mb-1.5">
                                {isHebrew ? badge.name : (badge.nameEn || badge.name)}
                            </div>
                            <div className="w-full mt-auto">
                                <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, Math.round((progress.current / (progress.target || 1)) * 100))}%` }}
                                    />
                                </div>
                                <div className="text-[11px] text-stone-500 font-medium mt-1">
                                    {progress.current}/{progress.target}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div
                    onClick={() => setSelectedBadge(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border border-amber-100 max-w-sm w-full text-center relative animate-in fade-in zoom-in-95 duration-200"
                    >
                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="absolute top-4 end-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-full transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                                selectedBadge.isUnlocked
                                    ? `badge-icon ${getBadgeIconClass(selectedBadge.code)} badge-unlocked text-white`
                                    : 'bg-[#FAF7F2] border-2 border-amber-200 text-amber-700'
                            }`}>
                                <BadgeIcon badge={selectedBadge} isUnlocked={selectedBadge.isUnlocked} isHebrew={isHebrew} />
                            </div>
                        </div>

                        <h4 className="text-xl font-bold text-stone-900 mb-2">
                            {isHebrew ? selectedBadge.name : (selectedBadge.nameEn || selectedBadge.name)}
                        </h4>

                        <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                            {isHebrew ? selectedBadge.description : (selectedBadge.descriptionEn || selectedBadge.description)}
                        </p>

                        {/* Progress counter / status pill */}
                        <div className="mb-4">
                            {selectedBadge.isUnlocked ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    ✓ {isHebrew ? 'נפתח בהצלחה!' : 'Unlocked!'}
                                </span>
                            ) : (
                                <div className="bg-[#FAF7F2] rounded-xl p-3 border border-stone-200/80">
                                    <div className="flex justify-between items-center text-xs text-stone-600 font-medium mb-1.5">
                                        <span>{isHebrew ? 'התקדמות' : 'Progress'}</span>
                                        <span className="font-bold text-amber-700">
                                            {progressMap?.[selectedBadge.code]?.current || 0} / {progressMap?.[selectedBadge.code]?.target || 1}
                                        </span>
                                    </div>
                                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(100, Math.round(((progressMap?.[selectedBadge.code]?.current || 0) / (progressMap?.[selectedBadge.code]?.target || 1)) * 100))}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive WhatsApp buttons for friend_recruiter or community_sharer */}
                        {selectedBadge.code === 'friend_recruiter' && (
                            <button
                                onClick={() => {
                                    const inviteText = isHebrew
                                        ? 'היי! אני מתרגל הכרת תודה יומית באפליקציה הזו וזה ממש מעלה את מצב הרוח. מזמין אותך להצטרף אלי: https://daily-appreciation-app-275bf.web.app'
                                        : 'Hey! I am practicing daily gratitude with this app and it has been wonderful. Join me: https://daily-appreciation-app-275bf.web.app';
                                    if (typeof (StorageService as { markFriendInvited?: () => void }).markFriendInvited === 'function') {
                                        (StorageService as { markFriendInvited: () => void }).markFriendInvited();
                                    } else {
                                        localStorage.setItem('daily_app_invited_friend', 'true');
                                    }
                                    window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');
                                    if (onBadgeAction) {
                                        onBadgeAction('friend_recruiter');
                                    }
                                }}
                                className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                <span>💌</span>
                                <span>{isHebrew ? 'הזמן חבר לתרגול ב-WhatsApp' : 'Invite a Friend via WhatsApp'}</span>
                            </button>
                        )}

                        {selectedBadge.code === 'community_sharer' && (
                            <button
                                onClick={() => {
                                    const shareText = isHebrew
                                        ? 'היי, רציתי לשתף אותך בהכרת תודה חמה מהיום: תודה על הנוכחות והעזרה שלך! ✨'
                                        : 'Hi! I wanted to share a warm note of gratitude with you today: thank you for being there and helping out! ✨';
                                    if (typeof (StorageService as { markGratitudeShared?: () => void }).markGratitudeShared === 'function') {
                                        (StorageService as { markGratitudeShared: () => void }).markGratitudeShared();
                                    } else {
                                        localStorage.setItem('daily_app_shared_gratitude', 'true');
                                    }
                                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                                    if (onBadgeAction) {
                                        onBadgeAction('community_sharer');
                                    }
                                }}
                                className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                <span>💌</span>
                                <span>{isHebrew ? 'שלח/י מילה טובה ב-WhatsApp' : 'Send Gratitude via WhatsApp'}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
