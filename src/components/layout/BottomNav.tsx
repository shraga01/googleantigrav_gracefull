import React from 'react';
import '../../styles/navigation.css';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
    currentTab: 'daily' | 'history' | 'stats' | 'settings';
    setCurrentTab: (tab: 'daily' | 'history' | 'stats' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <nav
            className="pt-2 px-4 z-10 w-full shrink-0 animate-fadeIn"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
        >
            <div className="glass-card rounded-full p-2 flex items-center justify-between gap-1 border-white/10 shadow-2xl backdrop-blur-xl bg-white/10 mx-auto max-w-md">

                {/* Settings Tab */}
                <button
                    onClick={() => setCurrentTab('settings')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 rounded-full transition-all ${currentTab === 'settings'
                        ? 'bg-white text-pink-500 shadow-lg'
                        : 'text-white/70 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]" style={currentTab === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        settings
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isHebrew ? 'הגדרות' : 'Settings'}
                    </span>
                </button>

                {/* Stats Tab */}
                <button
                    onClick={() => setCurrentTab('stats')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 rounded-full transition-all ${currentTab === 'stats'
                        ? 'bg-white text-pink-500 shadow-lg'
                        : 'text-white/70 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]" style={currentTab === 'stats' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        insights
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isHebrew ? 'מדדים' : 'Stats'}
                    </span>
                </button>

                {/* Journal Tab */}
                <button
                    onClick={() => setCurrentTab('history')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 rounded-full transition-all ${currentTab === 'history'
                        ? 'bg-white text-pink-500 shadow-lg'
                        : 'text-white/70 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]" style={currentTab === 'history' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        menu_book
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isHebrew ? 'יומן' : 'Journal'}
                    </span>
                </button>

                {/* Daily Tab */}
                <button
                    onClick={() => setCurrentTab('daily')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 rounded-full transition-all ${currentTab === 'daily'
                        ? 'bg-white text-pink-500 shadow-lg'
                        : 'text-white/70 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]" style={currentTab === 'daily' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        volunteer_activism
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isHebrew ? 'תרגול' : 'Practice'}
                    </span>
                </button>

            </div>
        </nav>
    );
};
