import React, { useState } from 'react';
import type { DosingSchedule, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';
import { IconInfo, IconChevronDown, IconChevronUp } from '../common/SvgIcon';

interface DosingScheduleBadgeProps {
    dosingSchedule?: DosingSchedule;
    locale: Locale;
}

export const DosingScheduleBadge: React.FC<DosingScheduleBadgeProps> = ({
    dosingSchedule,
    locale,
}) => {
    const [isScienceExpanded, setIsScienceExpanded] = useState(false);
    const t = getDictionary(locale);

    const isMaintenance = dosingSchedule?.phase === 'maintenance_variety';
    const currentDay = dosingSchedule?.currentDay || 1;
    const weeklyCount = dosingSchedule?.weeklyCompletedCount || 0;
    const targetCount = isMaintenance ? 3 : 7;

    const titleText = isMaintenance
        ? t.dosing.maintenanceTitle
        : t.dosing.onboardingTitle;

    const subtitleText = isMaintenance
        ? t.dosing.maintenanceDesc
        : t.dosing.onboardingDesc;

    const progressPercent = Math.min(
        100,
        Math.round(
            isMaintenance
                ? (weeklyCount / targetCount) * 100
                : (currentDay / 21) * 100
        )
    );

    return (
        <PastelCard
            variant="sage"
            title={titleText}
            subtitle={subtitleText}
            action={
                <button
                    type="button"
                    aria-label={t.dosing.scienceToggle}
                    onClick={() => setIsScienceExpanded((prev) => !prev)}
                    className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-200/50 transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                    <IconInfo className="w-4 h-4 text-emerald-800" />
                    {isScienceExpanded ? (
                        <IconChevronUp className="w-3.5 h-3.5 text-emerald-800" />
                    ) : (
                        <IconChevronDown className="w-3.5 h-3.5 text-emerald-800" />
                    )}
                </button>
            }
            className="w-full max-w-full box-border"
        >
            <div className="pt-2 w-full min-w-0 box-border">
                {/* Single clean progress status row (no duplicate day strings) */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950 mb-1.5 gap-2 w-full min-w-0">
                    <span className="truncate flex-1 min-w-0">
                        {isMaintenance
                            ? t.dosing.weeklyGoal.replace('{count}', String(targetCount))
                            : t.dosing.currentDay.replace('{day}', String(currentDay))}
                    </span>
                    <span dir="ltr" className="flex-shrink-0 ms-2 whitespace-nowrap font-bold">
                        {isMaintenance ? `${weeklyCount} / ${targetCount}` : `${progressPercent}%`}
                    </span>
                </div>

                {/* Progress bar with logical styling */}
                <div className="w-full h-2.5 bg-emerald-200/70 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                        }}
                    />
                </div>

                {/* Expandable Neuroscience Summary */}
                {isScienceExpanded && (
                    <div className="mt-3 p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed animate-fadeIn">
                        <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-950">
                            <span>🧠</span>
                            <span>{t.dosing.scienceToggle}</span>
                        </div>
                        <p>{t.dosing.scienceDesc}</p>
                    </div>
                )}
            </div>
        </PastelCard>
    );
};
