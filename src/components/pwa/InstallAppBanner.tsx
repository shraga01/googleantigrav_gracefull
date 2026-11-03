/**
 * Native-Grade PWA Installation Manager
 * Platform: daily-appreciation-app (Samsung Galaxy S26 & Android Standalone UX)
 * 
 * Strict React 19 Execution Order:
 * 1. useState (top)
 * 2. useCallback (middle)
 * 3. useEffect (bottom)
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppBannerProps {
    locale?: Locale;
    className?: string;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({
    locale = 'he',
    className = '',
}) => {
    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true
        );
    });
    const [isDismissed, setIsDismissed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    });
    const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

    const t = getDictionary(locale);

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations (Physically above useEffect)
    // -------------------------------------------------------------------------
    const handleInstallClick = useCallback(async () => {
        if (!deferredPrompt) {
            // If beforeinstallprompt hasn't fired yet, show native browser menu tip
            alert(
                locale === 'he'
                    ? 'להתקנה ידנית: לחץ על שלוש הנקודות בדפדפן (⋮) ובחר "התקן אפליקציה" או "הוסף למסך הבית".'
                    : 'To install manually: Tap the browser menu (⋮) and choose "Install app" or "Add to Home screen".'
            );
            return;
        }

        try {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                setInstalledSuccess(true);
                setDeferredPrompt(null);
            }
        } catch (error) {
            console.warn('PWA install prompt failed:', error);
        }
    }, [deferredPrompt, locale]);

    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('pwa_prompt_dismissed', 'true');
        }
    }, []);

    // -------------------------------------------------------------------------
    // 3. All useEffect Declarations (Strictly physical bottom)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsStandalone(true);
            setInstalledSuccess(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Also check standalone media query dynamically
        const mql = window.matchMedia('(display-mode: standalone)');
        const handleMqlChange = (e: MediaQueryListEvent) => {
            setIsStandalone(e.matches);
        };
        mql.addEventListener('change', handleMqlChange);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            mql.removeEventListener('change', handleMqlChange);
        };
    }, []);

    // Do not show banner if already running as installed standalone app or dismissed
    if (isStandalone || isDismissed) {
        return null;
    }

    return (
        <aside
            aria-label={t.pwa?.title || 'Install Application'}
            className={`w-full min-w-0 box-border mb-3 animate-fadeIn ${className}`}
        >
            <PastelCard
                variant="peach"
                title={t.pwa?.title || (locale === 'he' ? 'התקנה ב-Samsung Galaxy S26' : 'Install on Galaxy S26')}
                subtitle={
                    t.pwa?.subtitle ||
                    (locale === 'he'
                        ? 'מסך מלא AMOLED, גישה מהירה במצב אופליין ותזכורות ערב מוגנות'
                        : 'Full AMOLED standalone display, instant offline access & reliable evening alarms')
                }
                badge="PWA"
                action={
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                        aria-label="Dismiss banner"
                    >
                        ✕
                    </button>
                }
            >
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-neutral-700">
                        <span className="text-xl">📱</span>
                        <span>
                            {installedSuccess
                                ? (locale === 'he' ? '✓ האפליקציה הותקנה בהצלחה!' : '✓ App installed successfully!')
                                : (locale === 'he'
                                    ? 'הוסף למסך הבית לחוויית אפליקציה מקומית מהירה ונקייה'
                                    : 'Add to home screen for native-grade performance')}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleInstallClick}
                            className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            {locale === 'he' ? 'התקן למכשיר ⚡' : 'Install App ⚡'}
                        </button>
                    </div>
                </div>
            </PastelCard>
        </aside>
    );
};
