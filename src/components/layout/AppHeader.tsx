import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getDictionary } from '../../locales';
import type { Locale } from '../../types';
import { IconBack, IconClose, IconInfo } from '../common/SvgIcon';

interface AppHeaderProps {
    onLogout: () => void;
    onBack?: () => void;
    title: string;
    subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onLogout, onBack, title, subtitle }) => {
    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const { userProfile, setLanguage } = useApp();
    const [infoModalOpen, setInfoModalOpen] = useState(false);

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations
    // -------------------------------------------------------------------------
    const handleCloseInfo = useCallback(() => {
        setInfoModalOpen(false);
    }, []);

    // -------------------------------------------------------------------------
    // 3. All useEffect Declarations (Strictly physical bottom)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!infoModalOpen) return undefined;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setInfoModalOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [infoModalOpen]);

    if (!userProfile) return null;

    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const t = getDictionary(locale);

    return (
        <>
            <header className="pt-3 pb-2 px-4 sm:px-5 sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md transition-all w-full shrink-0 box-border">
                <div className="flex items-center justify-between gap-2">
                    {/* Back / Navigation Circular Button (Right in RTL) */}
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label={isHebrew ? 'חזרה' : 'Back'}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-amber-100/80 shadow-sm text-stone-600 hover:text-stone-900 active:scale-95 transition-all shrink-0"
                    >
                        <IconBack className="w-5 h-5 text-stone-700" />
                    </button>

                    {/* Center Title & Warm Amber Subtitle */}
                    <div className="text-center min-w-0 flex-1 px-1">
                        <h1 className="font-bold text-xl text-stone-900 tracking-tight truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-amber-700 text-xs sm:text-sm font-medium truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Info Circular Button (Left in RTL) -> Opens Scientific Background & Profile Modal */}
                    <button
                        type="button"
                        aria-label={isHebrew ? 'רקע מדעי והגדרות חשבון' : 'Scientific Info & Account'}
                        onClick={() => setInfoModalOpen(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-amber-100/80 shadow-sm text-amber-500 hover:text-amber-600 active:scale-95 transition-all shrink-0"
                    >
                        <IconInfo className="w-5 h-5 text-amber-500" />
                    </button>
                </div>
            </header>

            {/* Scientific Background & Account Modal */}
            {infoModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="science-info-modal-title"
                    onClick={handleCloseInfo}
                    className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-start justify-center pt-10 px-4 pb-8 overflow-y-auto animate-fadeIn"
                >
                    <div
                        dir={isHebrew ? 'rtl' : 'ltr'}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-amber-100 text-start space-y-4 box-border"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-3">
                            <h2
                                id="science-info-modal-title"
                                className="text-lg font-bold text-stone-900"
                            >
                                {isHebrew ? 'המדע שמאחורי הכרת התודה' : 'The Science of Appreciation'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseInfo}
                                aria-label={t.common.cancel}
                                className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-amber-50 transition-colors"
                            >
                                <IconClose className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm text-stone-700 leading-relaxed">
                            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100 space-y-1">
                                <div className="font-bold text-amber-900">
                                    🧠 {t.dosing.scienceToggle}
                                </div>
                                <p className="text-xs sm:text-sm text-stone-700">
                                    {t.dosing.scienceDesc}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                                <div className="font-bold text-indigo-950">
                                    💡 {t.threeGoodThings.seligmanTitle}
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-950/85">
                                    {t.threeGoodThings.seligmanBody}
                                </p>
                            </div>
                        </div>

                        {/* User Profile, Language Switch & Sign Out */}
                        <div className="pt-3 border-t border-stone-100 space-y-3">
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center shrink-0">
                                        {userProfile.name?.charAt(0).toUpperCase() || '🙏'}
                                    </div>
                                    <span className="font-semibold text-stone-800 truncate">
                                        {userProfile.name || (isHebrew ? 'מתרגל/ת' : 'Member')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLanguage('hebrew');
                                            setInfoModalOpen(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                                            isHebrew
                                                ? 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-stone-50 text-stone-700 border-stone-200'
                                        }`}
                                    >
                                        עברית
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLanguage('english');
                                            setInfoModalOpen(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                                            !isHebrew
                                                ? 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-stone-50 text-stone-700 border-stone-200'
                                        }`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onLogout();
                                        setInfoModalOpen(false);
                                    }}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
                                >
                                    {isHebrew ? 'התנתק מהחשבון' : 'Sign Out'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseInfo}
                                    className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                                >
                                    {isHebrew ? 'סגור' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
