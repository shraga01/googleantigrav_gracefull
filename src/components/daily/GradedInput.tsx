import React from 'react';
import { useApp } from '../../context/AppContext';
import '../../styles/navigation.css';

interface GradeResult {
    score: number;
    feedback: string;
    improvedVersion?: string;
}

interface GradedInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    exampleAnswer?: string;
    index: number;
    gradeResult: GradeResult | null;
    isLoading: boolean;
}

export const GradedInput: React.FC<GradedInputProps> = ({
    value,
    onChange,
    placeholder,
    exampleAnswer,
    index,
    gradeResult,
    isLoading
}) => {
    const { userProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    // Get color based on score (0-100)
    const getColor = (score: number): string => {
        if (score < 34) return '#ef4444'; // Red
        if (score < 67) return '#f97316'; // Orange
        return '#22c55e'; // Green
    };

    const scoreColor = gradeResult ? getColor(gradeResult.score) : 'transparent';
    const scoreWidth = gradeResult ? `${gradeResult.score}%` : '0%';

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Suggested Answer / AI Prompt */}
            {exampleAnswer && !value && !gradeResult && (
                <div style={{
                    marginBottom: '12px',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <div className="nav-icon-3d small nav-icon-bolt" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '14px', height: '14px', color: 'white', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>
                            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                        </svg>
                    </div>
                    <span>{exampleAnswer}</span>
                </div>
            )}

            {/* Input container with progress bar */}
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-card-bg)',
                transition: 'border-color 0.3s ease',
                borderColor: gradeResult ? scoreColor : 'var(--color-border)',
                minHeight: '140px'
            }}>
                {/* Progress bar background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: scoreWidth,
                    backgroundColor: scoreColor,
                    opacity: 0.1,
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 0,
                    borderRadius: 'var(--radius-md)'
                }} />

                {/* Score badge */}
                {gradeResult && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: isHebrew ? 'auto' : '8px',
                        left: isHebrew ? '8px' : 'auto',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: scoreColor,
                        backgroundColor: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        zIndex: 2
                    }}>
                        {gradeResult.score}%
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || (isHebrew ? `דבר ${index + 1}...` : `Thing ${index + 1}...`)}
                    rows={3}
                    disabled={isLoading || !!gradeResult}
                    style={{
                        width: '100%',
                        padding: '16px',
                        paddingBottom: exampleAnswer && !value && !gradeResult ? '40px' : '16px',
                        paddingRight: gradeResult ? '60px' : '16px',
                        border: 'none',
                        outline: 'none',
                        fontSize: 'var(--font-size-lg)',
                        fontFamily: 'inherit',
                        resize: 'none',
                        background: 'transparent',
                        position: 'relative',
                        zIndex: 1,
                        minHeight: '100px'
                    }}
                />

                {/* Example answer inside box - light gray text */}

            </div>

            {/* Feedback area */}
            {isLoading && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '12px',
                    animation: 'pulse 1.5s infinite'
                }}>
                    {isHebrew ? '✨ בודק וחושב...' : '✨ Analyzing thoughtful response...'}
                </div>
            )}

            {gradeResult && !isLoading && (
                <div className="animate-scaleIn" style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    padding: '16px',
                    backgroundColor: `${scoreColor}10`, // 10% opacity hex
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${scoreColor}`
                }}>
                    <p style={{ margin: 0, color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                        {gradeResult.feedback}
                    </p>

                    {gradeResult.improvedVersion && gradeResult.score < 100 && (
                        <div style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                margin: 0,
                                fontSize: '12px',
                                color: 'var(--color-text-muted)',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div className="nav-icon-3d small nav-icon-bolt" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px', color: 'white', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>
                                        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                                    </svg>
                                </div>
                                <span>{isHebrew ? 'כדאי לנסות:' : 'Try this:'}</span>
                            </div>
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: '14px',
                                fontStyle: 'italic',
                                color: 'var(--color-text-primary)'
                            }}>
                                "{gradeResult.improvedVersion}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


