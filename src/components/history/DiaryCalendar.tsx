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
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();

        const days = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ day: null, dateStr: null });
        }

        for (let i = 1; i <= daysInMonth; i++) {
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

    // --- Styles as plain objects (no Tailwind dependency) ---

    const arrowBtnStyle: React.CSSProperties = {
        width: 44,
        height: 44,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(255,105,180,0.35), rgba(138,43,226,0.35))',
        border: '1.5px solid rgba(255,255,255,0.35)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        flexShrink: 0,
    };

    const headerRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        padding: '0 16px',
        position: 'relative',
        zIndex: 10,
    };

    const monthTitleStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: '0.04em',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontFamily: "'Playfair Display', serif",
        flex: 1,
        margin: '0 12px',
    };

    const weekDayHeaderStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 8,
        marginBottom: 12,
        textAlign: 'center',
        color: '#FF69B4',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        direction: isHebrew ? 'rtl' : 'ltr',
    };

    const calendarGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '12px 8px',
        direction: isHebrew ? 'rtl' : 'ltr',
    };

    const getDayCircleStyle = (hasEntry: boolean, isToday: boolean): React.CSSProperties => {
        const base: React.CSSProperties = {
            width: 42,
            height: 42,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: hasEntry ? 700 : 500,
            transition: 'all 0.25s ease',
            position: 'relative',
        };

        if (hasEntry) {
            return {
                ...base,
                backgroundColor: '#86efac',
                color: '#064e3b',
                boxShadow: '0 0 16px rgba(134,239,172,0.55), 0 2px 8px rgba(0,0,0,0.1)',
                border: isToday ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.3)',
            };
        }

        if (isToday) {
            return {
                ...base,
                backgroundColor: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)',
            };
        }

        return {
            ...base,
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.45)',
        };
    };

    const getDayCellStyle = (hasEntry: boolean): React.CSSProperties => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        minWidth: 44,
        cursor: hasEntry ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        position: 'relative',
    });

    return (
        <div style={{ marginBottom: 32, position: 'relative', overflow: 'hidden', padding: '0 8px' }}>
            {/* Header Row: ◀  Month Year  ▶ */}
            <div style={headerRowStyle}>
                <button
                    onClick={handlePrevMonth}
                    style={arrowBtnStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    aria-label="Previous month"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 style={monthTitleStyle}>{monthLabel}</h3>

                <button
                    onClick={handleNextMonth}
                    style={arrowBtnStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    aria-label="Next month"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Week Day Headers */}
            <div style={weekDayHeaderStyle}>
                {weekDays.map(d => (
                    <div key={d} style={{ height: 24 }}>{d}</div>
                ))}
            </div>

            {/* Calendar Days Grid */}
            <div style={calendarGridStyle}>
                {days.map((d, index) => {
                    if (!d.day || !d.dateStr) {
                        return <div key={`empty-${index}`} style={{ minHeight: 44 }} />;
                    }

                    const entry = entries.find(e => e.date === d.dateStr);
                    const isToday = d.dateStr === new Date().toLocaleDateString('en-CA');
                    const hasEntry = !!entry;

                    return (
                        <div
                            key={d.dateStr}
                            onClick={() => {
                                if (entry) onSelectEntry(entry);
                            }}
                            style={getDayCellStyle(hasEntry)}
                            onMouseEnter={e => { if (hasEntry) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                            role={hasEntry ? 'button' : 'presentation'}
                            aria-label={hasEntry ? `View entry for ${d.dateStr}` : undefined}
                        >
                            <div style={getDayCircleStyle(hasEntry, isToday)}>
                                {d.day}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
