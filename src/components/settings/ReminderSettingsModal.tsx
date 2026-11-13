/**
 * Clinical Pre-Sleep Reminder Settings Modal
 * Platform: daily-appreciation-app (Samsung Galaxy S26 & Android)
 * 
 * Strict React 19 TDZ Compliance:
 * 1. useState (top)
 * 2. useCallback (middle)
 * 3. useEffect (bottom)
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { UserProfile, ReminderSettings, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { ReminderEngine, type ReminderCadenceEvaluation } from '../../services/reminderEngine';
import { FirestoreService } from '../../services/firestoreService';
import { getDictionary } from '../../locales';

interface ReminderSettingsModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onSaveSuccess?: (updated: ReminderSettings) => void;
}

const PRESET_TIMES = ['20:30', '21:00', '21:30', '22:00', '22:30'];

const WEEKDAYS = [
    { day: 0, he: 'ראשון', en: 'Sun' },
    { day: 1, he: 'שני', en: 'Mon' },
    { day: 2, he: 'שלישי', en: 'Tue' },
    { day: 3, he: 'רביעי', en: 'Wed' },
    { day: 4, he: 'חמישי', en: 'Thu' },
    { day: 5, he: 'שישי', en: 'Fri' },
    { day: 6, he: 'שבת', en: 'Sat' },
];

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
    userProfile,
    onClose,
    onSaveSuccess,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const initialSettings: ReminderSettings =
        userProfile.reminderSettings || ReminderEngine.getDefaultSettings();

    const [enabled, setEnabled] = useState<boolean>(initialSettings.enabled);
    const [eveningTime, setEveningTime] = useState<string>(initialSettings.eveningTime || '21:30');
    const [preferredDays, setPreferredDays] = useState<number[]>(
        initialSettings.preferredDays || [0, 2, 4]
    );
    const [digitalSunsetMode, setDigitalSunsetMode] = useState<boolean>(
        initialSettings.digitalSunsetMode ?? true
    );
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [cadenceStatus, setCadenceStatus] = useState<ReminderCadenceEvaluation | null>(null);

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations (Physically above useEffect)
    // -------------------------------------------------------------------------
    const toggleDay = useCallback((day: number) => {
        setPreferredDays((prev) => {
            if (prev.includes(day)) {
                return prev.length > 1 ? prev.filter((d) => d !== day) : prev;
            }
            return [...prev, day].sort();
        });
    }, []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const updated: ReminderSettings = {
                enabled,
                eveningTime,
                timezone: initialSettings.timezone || 'Asia/Jerusalem',
                preferredDays,
                digitalSunsetMode,
                fcmToken: initialSettings.fcmToken,
            };

            const updatedProfile: UserProfile = {
                ...userProfile,
                reminderSettings: updated,
            };

            if (userProfile.userId) {
                await FirestoreService.updateReminderSettings(userProfile.userId, updated);
            }

            // Schedule native Android notification if running inside APK
            if (ReminderEngine.isNativePlatform()) {
                await ReminderEngine.scheduleNativeNotification(updatedProfile, locale);
            }

            if (onSaveSuccess) {
                onSaveSuccess(updated);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save reminder settings:', error);
            alert(locale === 'he' ? 'שגיאה בשמירת הגדרות התזכורת' : 'Failed to save reminder settings');
        } finally {
            setIsSaving(false);
        }
    }, [
        enabled,
        eveningTime,
        preferredDays,
        digitalSunsetMode,
        initialSettings,
        userProfile,
        onSaveSuccess,
        onClose,
        locale,
    ]);

    const handleRequestPush = useCallback(async () => {
        const perm = await ReminderEngine.requestNotificationPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
            alert(
                locale === 'he'
                    ? '✓ הרשאת התראות הופעלה בהצלחה!'
                    : '✓ Notifications enabled successfully!'
            );
        }
    }, [locale]);

    const handleSyncToS26Calendar = useCallback(() => {
        const mockProfile: UserProfile = {
            ...userProfile,
            reminderSettings: {
                enabled,
                eveningTime,
                timezone: initialSettings.timezone || 'Asia/Jerusalem',
                preferredDays,
                digitalSunsetMode,
            },
        };

        ReminderEngine.downloadIcsCalendarFile(mockProfile, locale);
        alert(
            locale === 'he'
                ? 'קובץ תזכורת יומן (.ics) הורד למכשירך. פתח אותו כדי לסנכרן ישירות לשעון המעורר וליומן של Samsung Galaxy S26!'
                : 'Calendar alarm file (.ics) downloaded. Open it to sync directly to your Samsung Galaxy S26 Calendar & native alarm!'
        );
    }, [userProfile, enabled, eveningTime, initialSettings.timezone, preferredDays, digitalSunsetMode, locale]);

    const handleTriggerTestReminder = useCallback(async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await ReminderEngine.triggerTestNotification(locale);
            setTestResult(res.message);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Test failed';
            setTestResult(`Test: ${msg}`);
        } finally {
            setIsTesting(false);
        }
    }, [locale]);

    // -------------------------------------------------------------------------
    // 3. All useEffect Declarations (Strictly physical bottom)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const checkPerm = async () => {
            const status = await ReminderEngine.checkNotificationPermission();
            setNotificationPermission(status === 'granted' ? 'granted' : 'denied');
        };
        void checkPerm();

        const evaluate = async () => {
            try {
                const evalResult = await ReminderEngine.evaluateCadence(userProfile);
                setCadenceStatus(evalResult);
            } catch (err) {
                console.warn('Cadence evaluation failed:', err);
            }
        };
        void evaluate();
    }, [userProfile]);

    const isMaintenance = userProfile.dosingSchedule?.phase === 'maintenance_variety';

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl my-8">
                <PastelCard
                    variant="lavender"
                    title={t.reminders?.title || (locale === 'he' ? 'הגדרות תזכורת ערב וטקס שינה' : 'Evening Reminder & Pre-Sleep Ritual')}
                    subtitle={
                        t.reminders?.subtitle ||
                        (locale === 'he'
                            ? 'מערכת תזכורות מותאמת-דוקטרינה להפחתת מתח ושיפור איכות השינה'
                            : 'Doctrine-aware reminder engine for pre-sleep vagal relaxation')
                    }
                    badge="Samsung S26"
                    elevated
                    action={
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            ✕
                        </button>
                    }
                >
                    <div className="space-y-5 pt-3 text-neutral-800">
                        {/* Status Alert: Clinical Cadence Insight */}
                        {cadenceStatus && (
                            <div className="p-3 bg-white/80 rounded-xl border border-purple-200 text-xs space-y-1">
                                <div className="font-bold flex items-center justify-between text-purple-950">
                                    <span>
                                        🌙 {locale === 'he' ? 'סטטוס התזכורת להיום:' : 'Tonight\'s Reminder Status:'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                                        cadenceStatus.shouldRemindToday
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {cadenceStatus.shouldRemindToday
                                            ? (locale === 'he' ? 'פעילה' : 'Scheduled')
                                            : (locale === 'he' ? 'מדוכאת' : 'Suppressed')}
                                    </span>
                                </div>
                                <p className="text-neutral-600 leading-relaxed">
                                    {cadenceStatus.reason}
                                </p>
                            </div>
                        )}

                        {/* Toggle: Reminders Enabled */}
                        <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-black/5">
                            <div>
                                <div className="text-sm font-bold text-neutral-800">
                                    {locale === 'he' ? 'הפעל תזכורת ערב' : 'Enable Evening Reminders'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                    {isMaintenance
                                        ? (locale === 'he' ? 'שלב 2: תזכורת 3 פעמים בשבוע' : 'Phase 2: 3x/week schedule')
                                        : (locale === 'he' ? 'שלב 1: תזכורת יומית לבנייה נוירופלסטית' : 'Phase 1: Daily reminder for neuroplasticity')}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                className="w-5 h-5 accent-purple-600 cursor-pointer"
                            />
                        </div>

                        {/* Evening Time Selector with Quick Presets */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                                {locale === 'he' ? 'שעת התזכורת (מומלץ 15-30 דקות לפני השינה):' : 'Evening Reminder Time (15-30m before bed):'}
                            </label>
                            <input
                                type="time"
                                value={eveningTime}
                                onChange={(e) => setEveningTime(e.target.value)}
                                className="w-full text-base font-semibold rounded-xl p-3 bg-white border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-neutral-800 shadow-xs mb-2"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_TIMES.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setEveningTime(time)}
                                        className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                                            eveningTime === time
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white/80 text-neutral-700 hover:bg-white border border-black/5'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Days for Phase 2 Maintenance */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
                                {locale === 'he'
                                    ? 'ימי תרגול מועדפים (לשלב התחזוקה - מומלץ 3 ימים):'
                                    : 'Preferred Practice Days (Maintenance phase - 3 days recommended):'}
                            </label>
                            <div className="grid grid-cols-7 gap-1">
                                {WEEKDAYS.map(({ day, he, en }) => {
                                    const isSelected = preferredDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-purple-600 text-white shadow-xs'
                                                    : 'bg-white/80 text-neutral-600 hover:bg-white border border-black/5'
                                            }`}
                                        >
                                            {locale === 'he' ? he : en}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Digital Sunset Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                            <div>
                                <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                                    <span>🌅</span>
                                    <span>{locale === 'he' ? 'מצב שקיעה דיגיטלית (Digital Sunset)' : 'Digital Sunset Mode'}</span>
                                </div>
                                <div className="text-xs text-amber-900/80">
                                    {locale === 'he'
                                        ? 'מפחית אור כחול ומפעיל גווני פסטל חמימים אחרי 20:00 להגנה על המלטונין'
                                        : 'Shifts to warm low-blue-light pastel palette after 20:00 to protect melatonin'}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={digitalSunsetMode}
                                onChange={(e) => setDigitalSunsetMode(e.target.checked)}
                                className="w-5 h-5 accent-amber-600 cursor-pointer"
                            />
                        </div>

                        {/* Layer 1: Native Android Local Notifications or Browser Web Push */}
                        <div className="p-3 bg-white/80 rounded-xl border border-black/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                    <span>{ReminderEngine.isNativePlatform() ? '📱' : '🔔'}</span>
                                    <span>
                                        {ReminderEngine.isNativePlatform()
                                            ? (locale === 'he' ? 'התראות מערכת Android (Local):' : 'Native Android Notifications:')
                                            : (locale === 'he' ? 'התראות דפדפן (Web Push):' : 'Browser Push Notifications:')}
                                    </span>
                                </span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                    notificationPermission === 'granted'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                    {notificationPermission === 'granted'
                                        ? (locale === 'he' ? 'מופעל' : 'Granted')
                                        : (locale === 'he' ? 'דורש אישור' : 'Permission needed')}
                                </span>
                            </div>
                            {notificationPermission !== 'granted' ? (
                                <button
                                    type="button"
                                    onClick={handleRequestPush}
                                    className="w-full py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-colors"
                                >
                                    {locale === 'he' ? 'אפשר התראות במכשיר' : 'Allow Device Notifications'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleTriggerTestReminder}
                                        disabled={isTesting}
                                        className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {isTesting
                                            ? (locale === 'he' ? 'בודק...' : 'Testing...')
                                            : (locale === 'he' ? 'בדיקת התראה מיידית (2 שניות)' : 'Test Immediate Alert (2s)')}
                                    </button>
                                </div>
                            )}
                            {testResult && (
                                <p className="text-xs text-neutral-600 italic">{testResult}</p>
                            )}
                        </div>

                        {/* Layer 2: Native Samsung Galaxy S26 Calendar/Alarm Sync */}
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                                <span>📱</span>
                                <span>
                                    {locale === 'he'
                                        ? 'סנכרון חומרתי ל-Samsung Galaxy S26 (בטוח מפני Doze):'
                                        : 'Hardware Guarantee for Galaxy S26 (Doze-Resistant):'}
                                </span>
                            </div>
                            <p className="text-xs text-emerald-900 leading-relaxed">
                                {locale === 'he'
                                    ? 'הורד קובץ תזכורת מחזורית המסנכרן ישירות לשעון המעורר וליומן המכשיר. פועל ב-100% ודאות גם כשהמסך כבוי או באופליין.'
                                    : 'Generates a recurring .ics alarm file syncing directly to Samsung Calendar and native alarm clock. Guaranteed 100% offline & screen-off reliability.'}
                            </p>
                            <button
                                type="button"
                                onClick={handleSyncToS26Calendar}
                                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                            >
                                <span>📅</span>
                                <span>
                                    {locale === 'he'
                                        ? 'סנכרן תזכורת ערב ליומן/שעון במכשיר'
                                        : 'Sync Evening Ritual to Galaxy S26 Calendar/Alarm'}
                                </span>
                            </button>
                        </div>

                        {/* Save & Cancel Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                            >
                                {t.common?.cancel || (locale === 'he' ? 'ביטול' : 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                            >
                                {isSaving
                                    ? (t.common?.loading || (locale === 'he' ? 'שומר...' : 'Saving...'))
                                    : (t.common?.save || (locale === 'he' ? 'שמור הגדרות' : 'Save Settings'))}
                            </button>
                        </div>
                    </div>
                </PastelCard>
            </div>
        </div>
    );
};
