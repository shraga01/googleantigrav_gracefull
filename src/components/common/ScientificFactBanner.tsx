import React from 'react';

interface ScientificFactBannerProps {
    statement: string;
    citation: string;
    onDismiss: () => void;
    isHebrew?: boolean;
}

export const ScientificFactBanner: React.FC<ScientificFactBannerProps> = ({
    statement,
    citation,
    onDismiss,
    isHebrew = false
}) => {
    return (
        <div
            className="scientific-fact-banner"
            dir={isHebrew ? 'rtl' : 'ltr'}
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'black',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
            }}
        >
            {/* Science Icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>
                    🔬
                </div>

                <div style={{ flex: 1 }}>
                    {/* Label */}
                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px',
                            opacity: 0.9,
                        }}
                    >
                        {isHebrew ? 'עובדה מדעית' : 'Scientific Fact'}
                    </div>

                    {/* Statement */}
                    <p
                        className="scientific-fact-content"
                        style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '8px',
                            fontWeight: 400,
                        }}
                    >
                        {statement}
                    </p>

                    {/* Citation */}
                    <div
                        style={{
                            fontSize: '12px',
                            opacity: 0.85,
                            fontStyle: 'italic',
                        }}
                    >
                        — {citation}
                    </div>
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'black',
                        fontSize: '18px',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    aria-label={isHebrew ? 'סגור' : 'Dismiss'}
                >
                    ×
                </button>
            </div>
        </div>
    );
};
