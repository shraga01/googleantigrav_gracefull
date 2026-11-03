import React from 'react';
import { useApp } from '../../context/AppContext';
import { IconHeart } from '../common/SvgIcon';

interface HomeScreenProps {
    onStartPractice: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartPractice }) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-full min-w-0 h-full animate-fadeIn relative z-10 py-6 box-border">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="text-center mb-8 relative z-10 w-full min-w-0 px-3">
                <p className="text-white/90 text-sm font-bold tracking-widest uppercase mb-3 text-glow">
                    {isHebrew ? 'תרגול הודיה' : 'Practice Gratitude'}
                </p>
                <p className="text-white font-semibold tracking-wide glass-card px-5 py-2.5 rounded-full inline-block shadow-lg text-sm sm:text-base max-w-full break-words">
                    {isHebrew
                        ? 'רגע טוב שקרה + מי היה מעורב + איך תרמת לזה'
                        : 'Good moment + Who was involved + Your small part'}
                </p>
            </div>

            {/* Central Circle Button */}
            <div className="relative group cursor-pointer z-10 my-4" onClick={onStartPractice}>
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all duration-500 scale-110"></div>
                <button
                    type="button"
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center glass-card border-white/40 glass-button-glow hover:scale-[1.03] transition-all duration-500 shadow-2xl"
                >
                    <IconHeart className="w-16 h-16 mb-4 text-white" fill="white" />
                    <span className="text-white text-2xl font-black tracking-tight px-8 text-center leading-tight text-glow">
                        {isHebrew ? 'הודיה יומית' : 'Daily Appreciation'}
                    </span>
                    <div className="mt-4 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                    </div>
                </button>
            </div>

            <div className="mt-8 text-center z-10 px-4 w-full min-w-0">
                <p className="text-white font-medium text-base sm:text-lg max-w-[320px] mx-auto leading-relaxed text-glow break-words">
                    {isHebrew
                        ? 'קח רגע שקט כדי להרהר בדברים הטובים מהיום.'
                        : 'Take a quiet moment to reflect on the good things from today.'}
                </p>
            </div>
        </div>
    );
};
