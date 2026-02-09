import React from 'react';
import '../../styles/navigation.css';
import { useApp } from '../../context/AppContext';

// Simple SVG Icons
const Icons = {
    Home: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L4 9v12h5v-7h6v7h5V9z" />
        </svg>
    ),
    Book: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
        </svg>
    ),
    Chart: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
    )
};

interface BottomNavProps {
    currentTab: 'daily' | 'history' | 'stats' | 'settings';
    setCurrentTab: (tab: 'daily' | 'history' | 'stats' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <div className="bottom-nav-container">
            {/* 1. Today / Home */}
            <div
                className={`nav-item ${currentTab === 'daily' ? 'active' : ''}`}
                onClick={() => setCurrentTab('daily')}
            >
                <div className="nav-icon-3d nav-icon-today">
                    <Icons.Home />
                </div>
                <span className="nav-label">{isHebrew ? 'היום' : 'Today'}</span>
            </div>

            {/* 2. Journal / History */}
            <div
                className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}
                onClick={() => setCurrentTab('history')}
            >
                <div className="nav-icon-3d nav-icon-journal">
                    <Icons.Book />
                </div>
                <span className="nav-label">{isHebrew ? 'יומן' : 'Journal'}</span>
            </div>

            {/* 3. Stats */}
            <div
                className={`nav-item ${currentTab === 'stats' ? 'active' : ''}`}
                onClick={() => setCurrentTab('stats')}
            >
                <div className="nav-icon-3d nav-icon-stats">
                    <Icons.Chart />
                </div>
                <span className="nav-label">{isHebrew ? 'מדדים' : 'Stats'}</span>
            </div>
        </div>
    );
};
