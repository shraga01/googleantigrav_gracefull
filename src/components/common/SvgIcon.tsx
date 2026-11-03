import React from 'react';

interface SvgIconProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
    fill?: string;
    stroke?: string;
}

/**
 * Pure SVG Icons for Daily Appreciation App
 * Zero external font dependency, zero ligature text node translation bugs.
 */

export const IconBack: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

export const IconInfo: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.8" />
    </svg>
);

export const IconSettings: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

export const IconStats: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

export const IconJournal: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
);

export const IconSun: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

export const IconHeart: React.FC<SvgIconProps> = ({ className = 'w-6 h-6', size, style, fill = 'currentColor' }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill={fill}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

export const IconCheck: React.FC<SvgIconProps> = ({ className = 'w-5 h-5', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const IconClose: React.FC<SvgIconProps> = ({ className = 'w-5 h-5', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const IconChevronDown: React.FC<SvgIconProps> = ({ className = 'w-5 h-5', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const IconChevronUp: React.FC<SvgIconProps> = ({ className = 'w-5 h-5', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

export const IconSparkles: React.FC<SvgIconProps> = ({ className = 'w-5 h-5', size, style }) => (
    <svg
        className={`notranslate shrink-0 ${className}`}
        style={size ? { width: size, height: size, ...style } : style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
);
