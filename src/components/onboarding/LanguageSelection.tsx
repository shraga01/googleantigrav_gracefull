import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FluentIcon } from '../common/FluentIcon';

interface LanguageSelectionProps {
    onNext: () => void;
}

const LANGUAGES = [
    { code: 'english', flag: '🇬🇧', nativeName: 'English', subtitle: 'Continue in English' },
    { code: 'hebrew', flag: '🇮🇱', nativeName: 'עברית', subtitle: 'המשך בעברית' },
    { code: 'arabic', flag: '🇸🇦', nativeName: 'العربية', subtitle: 'تابع بالعربية' },
    { code: 'russian', flag: '🇷🇺', nativeName: 'Русский', subtitle: 'Продолжить на русском' },
    { code: 'french', flag: '🇫🇷', nativeName: 'Français', subtitle: 'Continuer en français' },
    { code: 'spanish', flag: '🇪🇸', nativeName: 'Español', subtitle: 'Continuar en español' },
    { code: 'amharic', flag: '🇪🇹', nativeName: 'አማርኛ', subtitle: 'በአማርኛ ቀጥል' },
];

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onNext }) => {
    const { setLanguage } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(LANGUAGES[0]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleContinue = () => {
        setLanguage(selected.code as 'english' | 'hebrew');
        onNext();
    };

    return (
        <div className="bg-white font-display text-white antialiased overflow-hidden mesh-gradient h-[100dvh] w-full relative">
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-y-auto sm:max-w-md mx-auto sm:border-x sm:border-white/20 sm:shadow-2xl bg-white/5 backdrop-blur-3xl sm:backdrop-blur-sm sm:bg-white/10 p-6 pb-safe text-white">
                {/* 3D Animated Globe Icon */}
                <div style={{ marginBottom: '24px' }}>
                    <FluentIcon name="Globe" size={80} />
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    className="w-full h-16 rounded-full glass-card text-white text-xl font-black tracking-tight glass-button-glow hover:scale-[1.02] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 mt-auto sm:mt-8"
                >
                    {selected.code === 'hebrew' ? 'המשך' : 'Continue'}
                </button>
            </div>
        </div>
    );
};
