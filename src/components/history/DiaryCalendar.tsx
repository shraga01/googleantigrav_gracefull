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
            {/* Header - Minimal and Clean */}
            <div className="flex items-center justify-between mb-8 relative z-10 px-4">
                <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-90">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-white text-center tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {monthLabel}
                </h3>
                <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-90">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
                                ${entry ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                            `}
                        >
                            {/* The Day Circle Indicator */}
                            <div className={`
                                w-10 h-10 rounded-full flex flex-col items-center justify-center relative
                                ${entry ? 'bg-[#FF69B4] text-white shadow-lg shadow-pink-500/40' : 'bg-transparent text-white/40'}
                                ${isToday && !entry ? 'border-2 border-white/30 text-white' : ''}
                                ${isToday && entry ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2e1065]' : ''}
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
