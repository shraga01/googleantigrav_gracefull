import React, { useState } from 'react';
import '../../styles/navigation.css';

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
                {/* Science Icon - 3D Style */}
                <div className="nav-icon-3d small nav-icon-science" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px', color: 'white', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}>
                        <path d="M22.22 17.5l-3.23-7.53c-.34-.79-.87-1.48-1.53-2.02l-1.95-1.95c-.54-.66-1.23-1.19-2.02-1.53L5.95 1.25c-.71-.3-1.5.03-1.8.74l-.94 2.19c-.3.71.03 1.5.74 1.8l7.53 3.23c.79.34 1.48.87 2.02 1.53l1.95 1.95c.66.54 1.19 1.23 1.53 2.02l3.23 7.53c.3.71-.03 1.5-.74 1.8l-2.19.94c-.71.3-1.5-.03-1.8-.74l-3.23-7.53c-.34-.79-.87-1.48-1.53-2.02l-1.95-1.95c-.54-.66-1.23-1.19-2.02-1.53L3.75 6.25c-.71-.3-1.5.03-1.8.74l-.94 2.19c-.3.71.03 1.5.74 1.8l7.53 3.23c.79.34 1.48.87 2.02 1.53l1.95 1.95c.66.54 1.19 1.23 1.53 2.02l3.23 7.53c.3.71-.03 1.5-.74 1.8l-2.19.94c-.71.3-1.5-.03-1.8-.74l-3.23-7.53c-.34-.79-.87-1.48-1.53-2.02l-1.95-1.95c-.54-.66-1.23-1.19-2.02-1.53L1.25 15.5H1v3h8v-3l-.11-.05 7.53 3.23c.79.34 1.48.87 2.02 1.53l1.95 1.95c.66.54 1.19 1.23 1.53 2.02l3.23 7.53c.3.71-.03 1.5-.74 1.8l-2.19.94c-.71.3-1.5-.03-1.8-.74zM7 19h2v1H7v-1zm4.55-9.68l-1.95-1.95c-.34-.34-.34-.89 0-1.23.34-.34.89-.34 1.23 0l1.95 1.95c.34.34.34.89 0 1.23-.34.35-.9.35-1.23 0z" />
                        <path d="M12 22c3.31 0 6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6c0 3.31 2.69 6 6 6z" />
                    </svg>
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
            `}</style>
        </div>
    );
};
