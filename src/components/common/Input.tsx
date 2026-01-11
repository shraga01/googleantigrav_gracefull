import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, style, ...props }) => {
    return (
        <div style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontWeight: 500,
                    color: 'var(--color-text-main)',
                    fontSize: 'var(--font-size-sm)'
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-md)',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    transition: 'border-color var(--transition-fast)',
                    color: 'var(--color-text-main)',
                    ...style,
                }}
                {...props}
            />
        </div>
    );
};
