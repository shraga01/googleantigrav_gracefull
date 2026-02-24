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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'black',
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
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
                {/* Science Orb - 3D CSS Badge Style */}
                <div style={{
                    animation: 'floatIcon 3s ease-in-out infinite',
                    marginRight: isHebrew ? '0' : '8px',
                    marginLeft: isHebrew ? '8px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="badge-icon badge-icon-science badge-unlocked" style={{ transform: 'scale(0.65)', flexShrink: 0, margin: '-12px' }}>
                        <FluentIcon name="LightBulb" size={40} />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {/* Label */}
                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            opacity: 0.9,
                        }}
                    >
                        {isHebrew ? 'עובדה מדעית' : 'Scientific Fact'}
                    </div>
                </div>

                {/* Collapse/Expand Button */}
                <button
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
                        fontSize: '14px',
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
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
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
