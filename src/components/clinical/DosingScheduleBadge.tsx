import React from 'react';
import type { DosingSchedule, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';

interface DosingScheduleBadgeProps {
    dosingSchedule?: DosingSchedule;
    locale: Locale;
}

export const DosingScheduleBadge: React.FC<DosingScheduleBadgeProps> = ({
    dosingSchedule,
    locale,
}) => {
    const t = getDictionary(locale);

    const isMaintenance = dosingSchedule?.phase === 'maintenance_variety';
    const currentDay = dosingSchedule?.currentDay || 1;
    const weeklyCount = dosingSchedule?.weeklyCompletedCount || 0;
    const targetCount = isMaintenance ? 3 : 7;

    return (
        <PastelCard
            variant="sage"
            title={isMaintenance ? t.dosing.maintenanceTitle : t.dosing.onboardingTitle}
            subtitle={isMaintenance ? t.dosing.maintenanceDesc : t.dosing.onboardingDesc}
            badge={isMaintenance ? 'Maintenance' : `${currentDay}/21`}
            className="w-full max-w-full box-border"
        >
            <div className="pt-2 w-full min-w-0 box-border">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5 gap-2 w-full min-w-0">
                    <span className="truncate flex-1 min-w-0">
                        {isMaintenance
                            ? t.dosing.weeklyGoal.replace('{count}', String(targetCount))
                            : t.dosing.currentDay.replace('{day}', String(currentDay))}
                    </span>
                    <span className="flex-shrink-0 ms-2 whitespace-nowrap">
                        {isMaintenance
                            ? `${weeklyCount} / ${targetCount}`
                            : `${Math.round((currentDay / 21) * 100)}%`}
                    </span>
                </div>

                {/* Progress bar with logical styling */}
                <div className="w-full h-2.5 bg-emerald-200/60 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(
                                100,
                                isMaintenance
                                    ? (weeklyCount / targetCount) * 100
                                    : (currentDay / 21) * 100
                            )}%`,
                        }}
                    />
                </div>
            </div>
        </PastelCard>
    );
};
