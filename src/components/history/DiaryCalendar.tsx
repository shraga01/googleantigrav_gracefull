import React, { useState, useMemo } from 'react';
import type { DailyEntry } from '../../types';

interface DiaryCalendarProps {
    entries: DailyEntry[];
    onSelectEntry: (entry: DailyEntry) => void;
    isHebrew: boolean;
}

export const DiaryCalendar: React.FC<DiaryCalendarProps> = ({ entries, onSelectEntry, isHebrew }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Month Navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Calendar Data Generation
    const { days, monthLabel } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of current month

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ day: null, dateStr: null });
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            // Format YYYY-MM-DD manually to match entry.date
            // Note: Month is 0-indexed, so we need +1. Pad with 0.
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(i).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;

            days.push({ day: i, dateStr });
        }

        const monthNames = isHebrew
            ? ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
            : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const monthLabel = `${monthNames[month]} ${year}`;

        return { days, monthLabel };
    }, [currentDate, isHebrew]);

    const weekDays = isHebrew
        ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="mb-8 relative overflow-hidden px-2">
            {/* Header - Styled with Glassmorphism */}
            <div className="flex items-center justify-between mb-8 relative z-10 px-4">
                <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 hover:scale-110 active:scale-90 shadow-lg">
                    <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-white text-center tracking-wide drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {monthLabel}
                </h3>
                <button onClick={handleNextMonth} className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 hover:scale-110 active:scale-90 shadow-lg">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Days of Week */}
            <div
                className="gap-2 mb-4 text-center text-[#FF69B4] text-[12px] font-bold uppercase tracking-widest relative z-10"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    direction: isHebrew ? 'rtl' : 'ltr'
                }}
            >
                {weekDays.map(d => (
                    <div key={d} className="h-6">{d}</div>
                ))}
            </div>

            {/* Calendar Grid - Borderless */}
            <div
                className="gap-y-4 gap-x-2 relative z-10"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    direction: isHebrew ? 'rtl' : 'ltr'
                }}
            >
                {days.map((d, index) => {
                    if (!d.day || !d.dateStr) {
                        return <div key={`empty-${index}`} className="aspect-square min-h-[44px]" />;
                    }

                    const entry = entries.find(e => e.date === d.dateStr);
                    const isToday = d.dateStr === new Date().toLocaleDateString('en-CA');

                    // Minimal Colorful Design: Flat, vibrant circles for entries.
                    return (
                        <div
                            key={d.dateStr}
                            onClick={() => {
                                console.log('🖱️ Day clicked:', d.dateStr);
                                if (entry) onSelectEntry(entry);
                            }}
                            className={`
                                flex flex-col items-center justify-center relative transition-transform duration-200 min-h-[44px] min-w-[44px]
                                ${entry ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                            `}
                            role={entry ? "button" : "presentation"}
                            aria-label={entry ? `View entry for ${d.dateStr}` : `Empty day ${d.dateStr}`}
                        >
                            {/* The Day Circle Indicator */}
                            <div className={`
                                w-10 h-10 rounded-full flex flex-col items-center justify-center relative transition-colors duration-300
                                ${entry ? 'bg-[#86efac] text-[#064e3b] shadow-[0_0_15px_rgba(134,239,172,0.5)]' : 'bg-transparent text-white/40'}
                                ${isToday && !entry ? 'border-2 border-white/30 text-white' : ''}
                                ${isToday && entry ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}
                            `}>
                                <span className={`text-[15px] ${entry ? 'font-bold' : 'font-medium'}`}>
                                    {d.day}
                                </span>
                            </div>

                            {/* Tiny dot below the circle for extra visual flair if there's an entry (Optional but clean) */}
                            {entry && (
                                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
