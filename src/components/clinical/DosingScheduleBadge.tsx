import React from 'react';
import type { DosingSchedule, Locale } from '../../types';
import { getDictionary } from '../../locales';

interface DosingScheduleBadgeProps {
    dosingSchedule?: DosingSchedule;
    streakCount?: number;
    locale: Locale;
}

export const DosingScheduleBadge: React.FC<DosingScheduleBadgeProps> = ({
    dosingSchedule,
    streakCount,
    locale,
}) => {
    const t = getDictionary(locale);

    const isMaintenance = dosingSchedule?.phase === 'maintenance_variety';
    const currentDay = Math.max(1, dosingSchedule?.currentDay || 0, streakCount || 0);
    const clampedOnboardingDay = Math.min(21, currentDay);
    const weeklyCount = dosingSchedule?.weeklyCompletedCount || 0;
    const targetCount = 3;

    const progressPercent = Math.min(
        100,
        Math.round(
            isMaintenance
                ? (weeklyCount / targetCount) * 100
                : (clampedOnboardingDay / 21) * 100
        )
    );

    const badgeText = isMaintenance
        ? `${weeklyCount} / ${targetCount}`
        : t.dosing.currentDay.replace('{day}', String(clampedOnboardingDay));

    const titleText = isMaintenance
        ? t.dosing.maintenanceTitle
        : t.dosing.onboardingTitle;

    const subtitleText = isMaintenance
        ? t.dosing.maintenanceDesc
        : t.dosing.onboardingDesc;

    return (
        <section
            aria-label={titleText}
            className="bg-white/95 rounded-2xl p-3.5 shadow-sm border border-amber-100/80 flex items-center justify-between gap-3 w-full min-w-0 box-border"
        >
            {/* Start Side (Right in RTL): Flame + Day Badge + Track Labels */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg shadow-inner shrink-0">
                    🔥
                </div>
                <div className="min-w-0 flex-1 text-start">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                            {badgeText}
                        </span>
                        <span className="text-xs font-semibold text-stone-700 truncate">
                            {titleText}
                        </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                        {subtitleText}
                    </p>
                </div>
            </div>

            {/* End Side (Left in RTL): Dynamic Percentage + Progress Bar */}
            <div className="w-20 shrink-0 flex flex-col items-end">
                <span dir="ltr" className="text-xs font-bold text-amber-600 mb-1">
                    {progressPercent}%
                </span>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-l from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </section>
    );
};
