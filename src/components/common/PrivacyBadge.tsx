import React from 'react';

interface PrivacyBadgeProps {
    showTooltip?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ showTooltip = true }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: '6px 12px',
                backgroundColor: 'var(--color-secondary-dark)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-text-main)',
                cursor: showTooltip ? 'help' : 'default',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span>🔒</span>
            <span>Your entries are encrypted</span>

            {/* Tooltip */}
            {showTooltip && isHovered && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: 'var(--spacing-sm)',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--color-text-main)',
                        color: 'black',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        whiteSpace: 'nowrap',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                    }}
                >
                    <div style={{ marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                        End-to-End Encryption
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
                        Your journal entries are encrypted on your device.
                        <br />
                        The server cannot read your content.
                    </div>
                    {/* Arrow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid var(--color-text-main)`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};
