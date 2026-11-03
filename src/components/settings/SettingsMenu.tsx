import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Button } from '../common/Button';
import { PastelCard } from '../common/PastelCard';
import { ReminderSettingsModal } from './ReminderSettingsModal';
import { InstallAppBanner } from '../pwa/InstallAppBanner';
import { getDictionary } from '../../locales';
import type { Locale } from '../../types';

export const SettingsMenu: React.FC = () => {
    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const { userProfile, setLanguage, refreshProfile } = useApp();
    const [showReminderModal, setShowReminderModal] = useState<boolean>(false);

    const locale: Locale = userProfile?.locale || (userProfile?.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const t = getDictionary(locale);

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations (Physically above useEffect)
    // -------------------------------------------------------------------------
    const handleExport = useCallback(() => {
        const data = StorageService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-appreciation-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const handleDelete = useCallback(() => {
        if (
            confirm(
                isHebrew
                    ? 'האם אתה בטוח? פעולה זו תמחק את כל הנתונים שלך לצמיתות.'
                    : 'Are you sure? This will permanently delete all your data.'
            )
        ) {
            StorageService.clearAllData();
            window.location.reload();
        }
    }, [isHebrew]);

    const toggleLanguage = useCallback(() => {
        const newLang = isHebrew ? 'english' : 'hebrew';
        if (
            confirm(
                isHebrew
                    ? 'החלפת שפה תדרוש טעינה מחדש. להמשיך?'
                    : 'Switching language requires a reload. Continue?'
            )
        ) {
            setLanguage(newLang);
        }
    }, [isHebrew, setLanguage]);

    const handleReminderSaved = useCallback(() => {
        refreshProfile();
    }, [refreshProfile]);

    return (
        <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
            {/* PWA Installation for Samsung Galaxy S26 */}
            <InstallAppBanner locale={locale} />

            {/* Pre-Sleep Evening Reminder & S26 Calendar Sync Section */}
            <PastelCard
                variant="lavender"
                title={t.reminders?.title || (isHebrew ? 'תזכורות ערב וטקס שינה' : 'Evening Reminders')}
                subtitle={
                    t.reminders?.subtitle ||
                    (isHebrew
                        ? 'תזכורות מותאמות-דוקטרינה וסנכרון חומרתי לשעון/יומן Samsung S26'
                        : 'Doctrine-aware alerts & hardware sync to Samsung S26 calendar/alarm')
                }
                badge="Samsung S26"
            >
                <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-700 bg-white/70 p-3 rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                            <span className="font-bold block">
                                {isHebrew ? 'סטטוס תזכורת:' : 'Reminder Status:'}
                            </span>
                            <span className="text-neutral-500">
                                {userProfile?.reminderSettings?.enabled ?? true
                                    ? (isHebrew
                                        ? `פעיל בשעה ${userProfile?.reminderSettings?.eveningTime || '21:30'}`
                                        : `Active at ${userProfile?.reminderSettings?.eveningTime || '21:30'}`)
                                    : (isHebrew ? 'כבוי' : 'Disabled')}
                            </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            userProfile?.reminderSettings?.enabled ?? true
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-200 text-neutral-600'
                        }`}>
                            {userProfile?.reminderSettings?.enabled ?? true
                                ? (isHebrew ? 'מופעל' : 'Enabled')
                                : (isHebrew ? 'כבוי' : 'Off')}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowReminderModal(true)}
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                        <span>🌙</span>
                        <span>
                            {isHebrew
                                ? 'הגדר שעת ערב וסנכרון לשעון S26'
                                : 'Configure Evening Time & S26 Sync'}
                        </span>
                    </button>
                </div>
            </PastelCard>

            {/* Profile Section */}
            <PastelCard
                variant="peach"
                title={isHebrew ? 'פרופיל אישי' : 'Personal Profile'}
                subtitle={isHebrew ? 'פרטי המשתמש והדוקטרינה הקלינית' : 'User details and clinical dosing'}
            >
                <div className="pt-2 text-xs space-y-2 text-neutral-800">
                    <div className="flex justify-between py-1 border-b border-black/5">
                        <span className="font-bold">{isHebrew ? 'שם:' : 'Name:'}</span>
                        <span>{userProfile?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5">
                        <span className="font-bold">{isHebrew ? 'שלב תרגול:' : 'Practice Phase:'}</span>
                        <span className="font-semibold text-amber-900">
                            {userProfile?.dosingSchedule?.phase === 'maintenance_variety'
                                ? (isHebrew ? 'שלב 2: גיוון ותחזוקה (3 בשבוע)' : 'Phase 2: Variety & Maintenance (3x/wk)')
                                : (isHebrew ? `שלב 1: בנייה נוירופלסטית (יום ${userProfile?.dosingSchedule?.currentDay || 1}/21)` : `Phase 1: Neuroplastic Onboarding (Day ${userProfile?.dosingSchedule?.currentDay || 1}/21)`)}
                        </span>
                    </div>
                </div>
            </PastelCard>

            {/* Language Section */}
            <PastelCard
                variant="sky"
                title={isHebrew ? 'שפת ממשק' : 'Interface Language'}
                subtitle={isHebrew ? 'תמיכה דו-לשונית מלאה' : 'Full bilingual English / Hebrew support'}
            >
                <div className="pt-2">
                    <Button variant="outline" onClick={toggleLanguage} fullWidth>
                        {isHebrew ? 'Switch to English 🇬🇧' : 'עבור לעברית 🇮🇱'}
                    </Button>
                </div>
            </PastelCard>

            {/* Data Management Section */}
            <PastelCard
                variant="sage"
                title={isHebrew ? 'ניהול נתונים ופרטיות' : 'Data & Privacy'}
                subtitle={isHebrew ? 'שליטה מלאה בנתונים המקומיים והמרוחקים' : 'Full control of your local and remote data'}
            >
                <div className="pt-2 flex flex-col gap-2.5">
                    <Button variant="secondary" onClick={handleExport} fullWidth>
                        {isHebrew ? 'ייצא נתונים (Backup JSON)' : 'Export Data (Backup JSON)'}
                    </Button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full py-2.5 px-4 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                    >
                        {isHebrew ? 'מחק את כל הנתונים' : 'Delete All Data'}
                    </button>
                </div>
            </PastelCard>

            {/* About Section */}
            <div className="text-center text-xs text-neutral-500 space-y-1 pt-2 pb-6">
                <p className="font-semibold">Daily Appreciation Platform v1.1</p>
                <p>Optimized for Samsung Galaxy S26 & AMOLED Standalone Display</p>
            </div>

            {/* Reminder Settings Modal */}
            {showReminderModal && userProfile && (
                <ReminderSettingsModal
                    userProfile={userProfile}
                    onClose={() => setShowReminderModal(false)}
                    onSaveSuccess={handleReminderSaved}
                />
            )}
        </div>
    );
};
