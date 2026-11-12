import React from 'react';
import '../../styles/navigation.css';
import { useApp } from '../../context/AppContext';
import { getDictionary } from '../../locales';
import type { Locale } from '../../types';
import { IconSun, IconJournal, IconStats, IconSettings } from '../common/SvgIcon';

interface BottomNavProps {
    currentTab: 'daily' | 'history' | 'stats' | 'settings';
    setCurrentTab: (tab: 'daily' | 'history' | 'stats' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
    const { userProfile } = useApp();
    const locale: Locale = userProfile?.locale || (userProfile?.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const t = getDictionary(locale);

    const tabs: Array<{
        id: 'daily' | 'history' | 'stats' | 'settings';
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }> = [
        {
            id: 'daily',
            label: t.nav.daily,
            icon: IconSun,
        },
        {
            id: 'history',
            label: t.nav.journal,
            icon: IconJournal,
        },
        {
            id: 'stats',
            label: t.nav.stats,
            icon: IconStats,
        },
        {
            id: 'settings',
            label: t.nav.settings,
            icon: IconSettings,
        },
    ];

    return (
        <nav
            translate="no"
            aria-label={isHebrew ? 'ניווט ראשי' : 'Main Navigation'}
            className="notranslate stitch-bottom-nav fixed sm:absolute bottom-0 start-0 end-0 z-40 w-full max-w-[440px] mx-auto bg-white/95 backdrop-blur-lg border-t border-stone-100 shadow-floating-bar px-4 pt-2 shrink-0 box-border"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
        >
            <div className="grid grid-cols-4 w-full items-center">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCurrentTab(tab.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-1 transition-colors focus:outline-none ${
                                isActive
                                    ? 'text-amber-600'
                                    : 'text-stone-400 hover:text-stone-600'
                            }`}
                        >
                            <div
                                className={`w-10 h-7 rounded-xl flex items-center justify-center transition-transform ${
                                    isActive ? 'bg-amber-50 text-amber-600 shadow-xs' : ''
                                }`}
                            >
                                <IconComponent className="w-5 h-5 shrink-0" />
                            </div>
                            <span
                                className={`text-[11px] truncate max-w-full tracking-tight ${
                                    isActive ? 'font-bold text-amber-600' : 'font-medium'
                                }`}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
