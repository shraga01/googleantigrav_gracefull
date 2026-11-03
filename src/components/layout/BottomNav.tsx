import React from 'react';
import '../../styles/navigation.css';
import { useApp } from '../../context/AppContext';
import { IconSun, IconJournal, IconStats, IconSettings } from '../common/SvgIcon';

interface BottomNavProps {
    currentTab: 'daily' | 'history' | 'stats' | 'settings';
    setCurrentTab: (tab: 'daily' | 'history' | 'stats' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    const tabs: Array<{
        id: 'daily' | 'history' | 'stats' | 'settings';
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }> = [
        {
            id: 'daily',
            label: isHebrew ? 'היום' : 'Today',
            icon: IconSun,
        },
        {
            id: 'history',
            label: isHebrew ? 'יומן' : 'Journal',
            icon: IconJournal,
        },
        {
            id: 'stats',
            label: isHebrew ? 'מדדים' : 'Stats',
            icon: IconStats,
        },
        {
            id: 'settings',
            label: isHebrew ? 'הגדרות' : 'Settings',
            icon: IconSettings,
        },
    ];

    return (
        <nav
            translate="no"
            aria-label={isHebrew ? 'ניווט ראשי' : 'Main Navigation'}
            className="notranslate fixed sm:absolute bottom-0 start-0 end-0 z-40 w-full max-w-[440px] mx-auto pt-2 px-3 shrink-0 animate-fadeIn pointer-events-auto box-border"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
            <div className="glass-card rounded-2xl p-1.5 grid grid-cols-4 w-full h-16 items-center border-white/10 shadow-2xl backdrop-blur-xl bg-white/10 mx-auto box-border">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all h-full ${
                                isActive
                                    ? 'bg-white text-pink-600 shadow-md font-bold'
                                    : 'text-white/80 hover:text-white font-medium'
                            }`}
                        >
                            <IconComponent className="w-5 h-5 shrink-0" />
                            <span className="text-[11px] sm:text-xs truncate max-w-full tracking-tight">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
