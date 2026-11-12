import React, { useState } from 'react';
import '../../styles/navigation.css';
import '../../styles/badges.css';
import { FluentIcon } from './FluentIcon';

interface ScientificFactBannerProps {
    statement: string;
    citation: string;
    isHebrew?: boolean;
}

export const ScientificFactBanner: React.FC<ScientificFactBannerProps> = ({
    statement,
    citation,
    isHebrew = false
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div
            className="scientific-fact-banner"
            dir={isHebrew ? 'rtl' : 'ltr'}
            style={{
                background: 'linear-gradient(135deg, #5b4bb7 0%, #6d3b96 100%)',
                color: '#FFFFFF',
                padding: '16px 20px',
                borderRadius: '16px',
                marginBottom: '20px',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Header Row (Always Visible) */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}
            >
                {/* Science Orb */}
                <div style={{
                    animation: 'floatIcon 3s ease-in-out infinite',
                    marginInlineEnd: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="badge-icon badge-icon-science badge-unlocked" style={{ transform: 'scale(0.65)', flexShrink: 0, margin: '-12px' }}>
                        <FluentIcon name="LightBulb" size={40} />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: '#F3E8FF',
                        }}
                    >
                        {isHebrew ? 'עובדה מדעית' : 'Scientific Fact'}
                    </div>
                </div>

                {/* Collapse/Expand Button */}
                <button
                    type="button"
                    aria-label={isExpanded ? 'Collapse fact' : 'Expand fact'}
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
                        color: '#FFFFFF',
                        fontSize: '12px',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                >
                    ▼
                </button>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <p
                        className="scientific-fact-content"
                        style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '8px',
                            fontWeight: 400,
                            color: '#FFFFFF',
                        }}
                    >
                        {statement}
                    </p>

                    <div
                        style={{
                            fontSize: '12px',
                            color: '#E9D5FF',
                            fontStyle: 'italic',
                        }}
                    >
                        — {citation}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatIcon {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-4px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
            `}</style>
        </div>
    );
};
