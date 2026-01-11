import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    style,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        padding: '12px 24px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        fontSize: 'var(--font-size-md)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        ...style,
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            boxShadow: 'var(--shadow-sm)',
        },
        secondary: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-main)',
            boxShadow: 'none',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-primary)',
            boxShadow: 'none',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            boxShadow: 'none',
            padding: '8px',
        }
    };

    return (
        <button
            style={{ ...baseStyle, ...variants[variant] }}
            {...props}
        >
            {children}
        </button>
    );
};
