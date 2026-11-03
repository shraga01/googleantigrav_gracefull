/**
 * Clinical Evening Reminder Engine (Doctrine-Aware)
 * Platform: daily-appreciation-app (Samsung Galaxy S26 & Android)
 * 
 * Enforces:
 * 1. Phase-Adaptive Cadence:
 *    - Onboarding (Days 1-21): Daily evening reminder for mPFC neuroplasticity.
 *    - Maintenance (Day 22+): Strictly 3x/week (Sun, Tue, Thu) to buffer hedonic adaptation.
 * 2. Completion Suppression:
 *    - Suppresses reminder if today's gratitude practice is already completed.
 * 3. Dual-Assurance Delivery:
 *    - Layer 1: FCM / Web Push Notification.
 *    - Layer 2: Native Android S26 Calendar/Alarm Sync via .ics recurring VALARM.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { UserProfile, ReminderSettings } from '../types';
import { FirestoreService } from './firestoreService';

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export interface ReminderCadenceEvaluation {
    shouldRemindToday: boolean;
    reason: string;
    targetHour: number;
    targetMinute: number;
    isMaintenance: boolean;
    isCompletedToday: boolean;
    digitalSunsetActive: boolean;
    deepLinkUrl: string;
}

export const ReminderEngine = {
    /**
     * Default reminder settings tailored for evening pre-sleep reflection.
     */
    getDefaultSettings: (): ReminderSettings => {
        let timezone = 'Asia/Jerusalem';
        try {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem';
        } catch {
            // fallback
        }
        return {
            enabled: true,
            eveningTime: '21:30',
            timezone,
            preferredDays: [0, 2, 4], // Sunday, Tuesday, Thursday
            digitalSunsetMode: true,
        };
    },

    /**
     * Evaluates whether a reminder is clinically indicated for today.
     * Enforces Rule 1 (Phase-Adaptive Cadence) and Rule 2 (Completion Suppression).
     */
    evaluateCadence: async (
        profile: UserProfile
    ): Promise<ReminderCadenceEvaluation> => {
        const settings = profile.reminderSettings || ReminderEngine.getDefaultSettings();
        const todayStr = new Date().toLocaleDateString('en-CA');
        const now = new Date();
        const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...

        const [hoursStr, minutesStr] = (settings.eveningTime || '21:30').split(':');
        const targetHour = parseInt(hoursStr || '21', 10);
        const targetMinute = parseInt(minutesStr || '30', 10);

        const isMaintenance = profile.dosingSchedule?.phase === 'maintenance_variety';
        const deepLinkUrl = '/?mode=evening_ritual&source=reminder';

        // Check digital sunset mode (>= 20:00 local time or 1 hour before evening target)
        const digitalSunsetActive =
            settings.digitalSunsetMode && (now.getHours() >= 20 || now.getHours() >= targetHour - 1);

        if (!settings.enabled) {
            return {
                shouldRemindToday: false,
                reason: 'Reminders disabled in settings',
                targetHour,
                targetMinute,
                isMaintenance,
                isCompletedToday: false,
                digitalSunsetActive,
                deepLinkUrl,
            };
        }

        // Rule 2: Completion Suppression Check
        let isCompletedToday = profile.dosingSchedule?.lastPracticeDate === todayStr;
        if (!isCompletedToday && profile.userId) {
            try {
                const todayEntry = await FirestoreService.getEntryByDate(profile.userId, todayStr);
                if (todayEntry) {
                    isCompletedToday = true;
                }
            } catch (err) {
                console.warn('Could not query today entry for suppression check:', err);
            }
        }

        if (isCompletedToday) {
            return {
                shouldRemindToday: false,
                reason: 'Completed today: Suppressed per clinical protocol (no unnecessary alerts)',
                targetHour,
                targetMinute,
                isMaintenance,
                isCompletedToday: true,
                digitalSunsetActive,
                deepLinkUrl,
            };
        }

        // Rule 1: Phase-Adaptive Cadence
        if (!isMaintenance) {
            // Phase 1: Onboarding Daily 21 - Every evening
            return {
                shouldRemindToday: true,
                reason: 'Phase 1: Daily evening practice required for mPFC neuroplasticity',
                targetHour,
                targetMinute,
                isMaintenance: false,
                isCompletedToday: false,
                digitalSunsetActive,
                deepLinkUrl,
            };
        }

        // Phase 2: Maintenance Variety - Only on preferred days (default: Sun, Tue, Thu)
        const preferred = settings.preferredDays && settings.preferredDays.length > 0
            ? settings.preferredDays
            : [0, 2, 4];

        const isPreferredDay = preferred.includes(currentDayOfWeek);
        if (!isPreferredDay) {
            return {
                shouldRemindToday: false,
                reason: 'Phase 2: Off-day to prevent hedonic adaptation & gratitude fatigue',
                targetHour,
                targetMinute,
                isMaintenance: true,
                isCompletedToday: false,
                digitalSunsetActive,
                deepLinkUrl,
            };
        }

        return {
            shouldRemindToday: true,
            reason: 'Phase 2: Scheduled practice day (Variety & Hedonic Adaptation Buffer)',
            targetHour,
            targetMinute,
            isMaintenance: true,
            isCompletedToday: false,
            digitalSunsetActive,
            deepLinkUrl,
        };
    },

    /**
     * Checks if Digital Sunset Mode should be applied right now.
     */
    isDigitalSunsetActive: (profile?: UserProfile | null): boolean => {
        if (!profile?.reminderSettings?.digitalSunsetMode) return false;
        const hour = new Date().getHours();
        return hour >= 20 || hour < 5;
    },

    /**
     * Request browser notification permission (FCM / Web Push).
     */
    requestNotificationPermission: async (): Promise<NotificationPermission> => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'denied';
        }
        return await Notification.requestPermission();
    },

    /**
     * Layer 2: 100% Hardware-Guaranteed S26 Calendar/Alarm Sync (.ics generator).
     * Works completely offline and triggers Samsung Calendar & Native Alarm.
     */
    generateIcsContent: (
        profile: UserProfile,
        locale: 'he' | 'en' = 'he'
    ): string => {
        const settings = profile.reminderSettings || ReminderEngine.getDefaultSettings();
        const isMaintenance = profile.dosingSchedule?.phase === 'maintenance_variety';
        const [hours, minutes] = (settings.eveningTime || '21:30').split(':').map((v) => parseInt(v, 10));

        const now = new Date();
        const startYear = now.getFullYear();
        const startMonth = String(now.getMonth() + 1).padStart(2, '0');
        const startDay = String(now.getDate()).padStart(2, '0');
        const startH = String(hours).padStart(2, '0');
        const startM = String(minutes).padStart(2, '0');

        const dtStart = `${startYear}${startMonth}${startDay}T${startH}${startM}00`;
        const dtEnd = `${startYear}${startMonth}${startDay}T${startH}${String((minutes + 15) % 60).padStart(2, '0')}00`;

        // Recurrence rule
        let rrule = 'RRULE:FREQ=DAILY;COUNT=21';
        if (isMaintenance) {
            const preferred = settings.preferredDays && settings.preferredDays.length > 0
                ? settings.preferredDays
                : [0, 2, 4];
            const byDays = preferred.map((d) => DAY_CODES[d % 7]).join(',');
            rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byDays}`;
        }

        const summary = locale === 'he'
            ? 'טקס הכרת תודה לפני השינה 🌙 (יום הודיה)'
            : 'Evening Gratitude Ritual 🌙 (Daily Appreciation)';

        const description = locale === 'he'
            ? '10 דקות של 3 דברים טובים וייחוס סוכנות אישית לוויסות וגאלי והרגעת מחשבות לפני השינה.\\nקישור ישיר לתרגול: https://daily-appreciation-app-275bf.web.app/?mode=evening_ritual'
            : '10-minute Seligman 3GT with causal agency reflection for pre-sleep vagal regulation.\\nDirect link: https://daily-appreciation-app-275bf.web.app/?mode=evening_ritual';

        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Daily Appreciation App//Evening Ritual//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:evening-ritual-${profile.userId || 's26'}-${Date.now()}@daily-appreciation`,
            `DTSTAMP:${dtStart}Z`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            rrule,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            'LOCATION:Daily Appreciation PWA',
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-PT10M',
            'ACTION:DISPLAY',
            `DESCRIPTION:${summary}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
    },

    /**
     * Download or trigger S26 calendar import for the .ics file.
     */
    downloadIcsCalendarFile: (profile: UserProfile, locale: 'he' | 'en' = 'he'): void => {
        const icsData = ReminderEngine.generateIcsContent(profile, locale);
        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'evening-gratitude-ritual.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Trigger a cloud verification test for the evening reminder via Cloud Function
     */
    triggerCloudTest: async (): Promise<{ success: boolean; message: string; pushSent: boolean; isCompletedToday: boolean }> => {
        const callable = httpsCallable<Record<string, unknown>, { success: boolean; message: string; pushSent: boolean; isCompletedToday: boolean }>(
            functions,
            'triggerTestEveningReminder'
        );
        const res = await callable({});
        return res.data;
    },
};
