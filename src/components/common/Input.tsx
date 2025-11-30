import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, style, ...props }) => {
    return (
        <div style={{ width: '100%', marginBottom: '16px' }}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 500,
                    color: 'var(--color-text-main)'
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    ...style,
                }}
                {...props}
            />
        </div>
    );
};
