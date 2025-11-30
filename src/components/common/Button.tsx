import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
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
        borderRadius: 'var(--radius-full)',
        border: 'none',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.1s ease, opacity 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        ...style,
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
        },
        secondary: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-main)',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-primary)',
        },
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
