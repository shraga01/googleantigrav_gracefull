import React from 'react';
import { useApp } from '../../context/AppContext';

interface HomeScreenProps {
    onStartPractice: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartPractice }) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <div className="flex flex-col items-center justify-center w-full h-full animate-fadeIn relative z-10 mt-[-5vh]">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="text-center mb-12 relative z-10">
                <p className="text-white/90 text-sm font-bold tracking-widest uppercase mb-3 text-glow">
                    {isHebrew ? 'תרגול הודיה' : 'Practice Gratitude'}
                </p>
                <p className="text-white font-semibold tracking-wide glass-card px-6 py-3 rounded-full inline-block shadow-lg">
                    {isHebrew
                        ? 'מעשה ספציפי + אדם + איך זה עזר לך'
                        : 'Concrete act + Person + How it helped'}
                </p>
            </div>

            {/* Central Circle Button */}
            <div className="relative group cursor-pointer z-10 mt-4 mb-8" onClick={onStartPractice}>
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all duration-500 scale-110"></div>
                <button
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center glass-card border-white/40 glass-button-glow hover:scale-[1.03] transition-all duration-500 shadow-2xl"
                >
                    <span
                        className="material-symbols-outlined text-6xl mb-4 text-white"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        favorite
                    </span>
                    <span className="text-white text-2xl font-black tracking-tight px-10 text-center leading-tight text-glow">
                        {isHebrew ? 'הודיה יומית' : 'Daily Appreciation'}
                    </span>
                    <div className="mt-4 flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/40"></div>
                        <div className="w-1 h-1 rounded-full bg-white/40"></div>
                        <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    </div>
                </button>
            </div>

            <div className="mt-12 text-center z-10 px-4">
                <p className="text-white font-medium text-lg max-w-[300px] mx-auto leading-relaxed text-glow">
                    {isHebrew
                        ? 'קח רגע שקט כדי להרהר בדברים הטובים מהיום.'
                        : 'Take a quiet moment to reflect on the good things from today.'}
                </p>
            </div>
        </div>
    );
};
