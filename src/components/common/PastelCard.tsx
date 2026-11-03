import React from 'react';

export type PastelVariant = 'sage' | 'lavender' | 'peach' | 'sky' | 'cream' | 'rose';

interface PastelCardProps {
    children: React.ReactNode;
    variant?: PastelVariant;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    action?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    elevated?: boolean;
}

const VARIANT_STYLES: Record<PastelVariant, { container: string; title: string; badge: string }> = {
    sage: {
        container: 'bg-[#F2F7F2] border-[#D4E4D4] text-[#243E26]',
        title: 'text-[#203822]',
        badge: 'bg-[#DEEBDE] text-[#243E26] border-[#C3D8C3]',
    },
    lavender: {
        container: 'bg-[#F6F4FB] border-[#E3DCFA] text-[#3B3058]',
        title: 'text-[#32284C]',
        badge: 'bg-[#EAE4FB] text-[#3B3058] border-[#D4C8F5]',
    },
    peach: {
        container: 'bg-[#FFF6F0] border-[#FCE1D0] text-[#5C3826]',
        title: 'text-[#4A2D1E]',
        badge: 'bg-[#FDE7D8] text-[#5C3826] border-[#F7CDAF]',
    },
    sky: {
        container: 'bg-[#F0F7FF] border-[#D4E6FC] text-[#1C3B5E]',
        title: 'text-[#16304C]',
        badge: 'bg-[#DCEDFE] text-[#1C3B5E] border-[#BFDCFD]',
    },
    cream: {
        container: 'bg-[#FAF8F5] border-[#EAE3D6] text-[#4A4036]',
        title: 'text-[#383028]',
        badge: 'bg-[#EFE8DC] text-[#4A4036] border-[#DDD3C2]',
    },
    rose: {
        container: 'bg-[#FFF2F4] border-[#FCDFE4] text-[#5C242C]',
        title: 'text-[#4A1D23]',
        badge: 'bg-[#FDE3E7] text-[#5C242C] border-[#F7C6CE]',
    },
};

export const PastelCard: React.FC<PastelCardProps> = ({
    children,
    variant = 'cream',
    title,
    subtitle,
    icon,
    badge,
    badgeColor,
    action,
    className = '',
    onClick,
    elevated = false,
}) => {
    const styles = VARIANT_STYLES[variant];

    return (
        <div
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`
                w-full max-w-full min-w-0 box-border overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300
                ${styles.container}
                ${elevated ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md'}
                ${onClick ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : ''}
                ${className}
            `}
        >
            {(title || icon || badge || action) && (
                <div className="flex items-start justify-between mb-3 gap-2 w-full min-w-0">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {icon && <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>}
                        {title && (
                            <div className="min-w-0 flex-1">
                                <h3 className={`font-semibold text-base sm:text-lg leading-snug tracking-tight break-words ${styles.title}`}>
                                    {title}
                                </h3>
                                {subtitle && (
                                    <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed mt-0.5 break-words">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    {(badge || action) && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 ms-2">
                            {badge && (
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium border whitespace-nowrap ${badgeColor || styles.badge}`}
                                >
                                    {badge}
                                </span>
                            )}
                            {action && <div className="flex-shrink-0">{action}</div>}
                        </div>
                    )}
                </div>
            )}
            <div className="w-full min-w-0 box-border">{children}</div>
        </div>
    );
};
