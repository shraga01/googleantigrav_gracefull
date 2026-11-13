import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Button } from '../common/Button';
import { PastelCard } from '../common/PastelCard';
import { ReminderSettingsModal } from './ReminderSettingsModal';
import { getDictionary } from '../../locales';
import type { Locale } from '../../types';

export const SettingsMenu: React.FC = () => {
    // -------------------------------------------------------------------------
    // 1. All useState & useRef Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const { userProfile, setLanguage, refreshProfile, refreshStreak } = useApp();
    const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleRestoreClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (!content) {
                alert(t.settings?.restoreError || (isHebrew ? 'שגיאה בשחזור הנתונים. ודא/י שהקובץ תקין.' : 'Failed to restore data. Please ensure the file is valid.'));
                return;
            }

            const result = StorageService.importData(content);
            if (result.success) {
                refreshProfile();
                if (refreshStreak) {
                    void refreshStreak();
                }
                alert(t.settings?.restoreSuccess || (isHebrew ? 'הנתונים שוחזרו בהצלחה מתוך קובץ הגיבוי!' : 'Data restored successfully from backup file!'));
                window.location.reload();
            } else {
                alert(result.error || t.settings?.restoreError || (isHebrew ? 'שגיאה בשחזור הנתונים. ודא/י שהקובץ תקין.' : 'Failed to restore data. Please ensure the file is valid.'));
            }
        };
        reader.onerror = () => {
            alert(t.settings?.restoreError || (isHebrew ? 'שגיאה בשחזור הנתונים. ודא/י שהקובץ תקין.' : 'Failed to restore data. Please ensure the file is valid.'));
        };
        reader.readAsText(file);
        event.target.value = '';
    }, [isHebrew, refreshProfile, refreshStreak, t.settings?.restoreError, t.settings?.restoreSuccess]);

    const handleDelete = useCallback(() => {
        if (
            confirm(
                isHebrew
                    ? (t.settings?.deleteConfirm || 'האם אתה בטוח? פעולה זו תמחק את כל הנתונים שלך לצמיתות.')
                    : (t.settings?.deleteConfirm || 'Are you sure? This will permanently delete all your data.')
            )
        ) {
            StorageService.clearAllData();
            window.location.reload();
        }
    }, [isHebrew, t.settings?.deleteConfirm]);

    const toggleLanguage = useCallback(() => {
        const newLang = isHebrew ? 'english' : 'hebrew';
        if (
            confirm(
                isHebrew
                    ? (t.settings?.langConfirm || 'החלפת שפה תדרוש טעינה מחדש. להמשיך?')
                    : (t.settings?.langConfirm || 'Switching language requires a reload. Continue?')
            )
        ) {
            setLanguage(newLang);
        }
    }, [isHebrew, setLanguage, t.settings?.langConfirm]);

    const handleReminderSaved = useCallback(() => {
        refreshProfile();
    }, [refreshProfile]);

    return (
        <div className="p-2 sm:p-4 max-w-xl mx-auto space-y-5 w-full min-w-0 box-border">
            {/* Pre-Sleep Evening Reminder & Calendar Sync Section */}
            <PastelCard
                variant="lavender"
                title={t.reminders?.title || (isHebrew ? 'תזכורות ערב וטקס שינה' : 'Evening Reminders')}
                subtitle={
                    t.reminders?.subtitle ||
                    (isHebrew
                        ? 'תזכורות ערב מותאמות לשגרה וסנכרון ליומן במכשיר'
                        : 'Evening alerts & calendar sync')
                }
            >
                <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-700 bg-white/70 p-3 rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                            <span className="font-bold block">
                                {t.settings?.reminderStatus || (isHebrew ? 'סטטוס תזכורת:' : 'Reminder Status:')}
                            </span>
                            <span className="text-neutral-600">
                                {userProfile?.reminderSettings?.enabled ?? true
                                    ? (isHebrew
                                        ? `${t.settings?.activeAt || 'פעיל בשעה'} ${userProfile?.reminderSettings?.eveningTime || '21:30'}`
                                        : `${t.settings?.activeAt || 'Active at'} ${userProfile?.reminderSettings?.eveningTime || '21:30'}`)
                                    : (t.settings?.disabled || (isHebrew ? 'כבוי' : 'Disabled'))}
                            </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            userProfile?.reminderSettings?.enabled ?? true
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-200 text-neutral-600'
                        }`}>
                            {userProfile?.reminderSettings?.enabled ?? true
                                ? (t.settings?.enabled || (isHebrew ? 'מופעל' : 'Enabled'))
                                : (t.settings?.disabled || (isHebrew ? 'כבוי' : 'Off'))}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowReminderModal(true)}
                        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                        <span>🌙</span>
                        <span>
                            {t.settings?.configureEvening || (isHebrew
                                ? 'הגדר שעת ערב וסנכרון ליומן'
                                : 'Configure Evening Time & Calendar Sync')}
                        </span>
                    </button>
                </div>
            </PastelCard>

            {/* Profile Section */}
            <PastelCard
                variant="peach"
                title={t.settings?.profile || (isHebrew ? 'פרופיל אישי' : 'Personal Profile')}
                subtitle={t.settings?.profileSub || (isHebrew ? 'פרטי המשתמש ושלב התרגול' : 'User details and current habit stage')}
            >
                <div className="pt-2 text-xs space-y-2 text-neutral-800">
                    <div className="flex justify-between py-1 border-b border-black/5">
                        <span className="font-bold">{t.settings?.name || (isHebrew ? 'שם:' : 'Name:')}</span>
                        <span>{userProfile?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5">
                        <span className="font-bold">{t.settings?.practicePhase || (isHebrew ? 'שלב תרגול:' : 'Practice Phase:')}</span>
                        <span className="font-semibold text-amber-900">
                            {userProfile?.dosingSchedule?.phase === 'maintenance_variety'
                                ? (t.settings?.phase2 || (isHebrew ? 'שלב 2: שגרה מותאמת (3 בשבוע)' : 'Phase 2: Tailored Routine (3x/wk)'))
                                : (isHebrew
                                    ? <>שלב 1: הרגל יומי (יום <span dir="ltr">{userProfile?.dosingSchedule?.currentDay || 1}/21</span>)</>
                                    : <>Phase 1: Daily Habit (Day {userProfile?.dosingSchedule?.currentDay || 1}/21)</>)}
                        </span>
                    </div>
                </div>
            </PastelCard>

            {/* Language Section */}
            <PastelCard
                variant="sky"
                title={t.settings?.interfaceLang || (isHebrew ? 'שפת ממשק' : 'Interface Language')}
                subtitle={t.settings?.bilingualSupport || (isHebrew ? 'תמיכה דו-לשונית מלאה' : 'Full bilingual English / Hebrew support')}
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
                title={t.settings?.dataTitle || (isHebrew ? 'ניהול נתונים ופרטיות' : 'Data & Privacy')}
                subtitle={t.settings?.dataSubtitle || (isHebrew ? 'שליטה מלאה בנתונים המקומיים והמרוחקים' : 'Full control of your local and remote data')}
            >
                <div className="pt-2 flex flex-col gap-2.5">
                    <Button variant="secondary" onClick={handleExport} fullWidth>
                        {t.settings?.exportBackup || (isHebrew ? 'ייצוא וגיבוי הנתונים שלי' : 'Export Personal Data Backup')}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelected}
                        accept=".json,application/json"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <Button variant="outline" onClick={handleRestoreClick} fullWidth>
                        {t.settings?.restoreBackup || (isHebrew ? 'שחזור נתונים מקובץ גיבוי' : 'Restore Data from Backup File')}
                    </Button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full py-2.5 px-4 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                    >
                        {t.settings?.deleteData || (isHebrew ? 'מחק את כל הנתונים' : 'Delete All Data')}
                    </button>
                </div>
            </PastelCard>

            {/* About Section - High Contrast on Warm Cream BG */}
            <div className="text-center text-xs text-stone-600 space-y-1 pt-2 pb-6">
                <p className="font-semibold">{t.settings?.version || 'Daily Appreciation Platform v1.7'}</p>
                <p className="text-amber-800/80">{t.settings?.subversion || 'Bilingual Gratitude & Well-Being'}</p>
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
