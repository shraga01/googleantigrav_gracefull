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
    placeholder: _placeholder,
    exampleAnswer,
    index: _index,
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

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Input container with glassmorphism */}
            <div
                className="w-full max-w-md mx-auto glass-card rounded-xl p-6 shadow-2xl min-h-[250px] flex flex-col relative transition-colors duration-300"
                style={{
                    borderColor: gradeResult ? scoreColor : 'rgba(255, 255, 255, 0.5)'
                }}
            >
                {/* Score badge */}
                {gradeResult && (
                    <div className={gradeResult.score === 100 ? 'animate-successBounce' : 'animate-scaleIn'} style={{
                        position: 'absolute',
                        top: '12px',
                        right: isHebrew ? 'auto' : '12px',
                        left: isHebrew ? '12px' : 'auto',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: scoreColor,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 2
                    }}>
                        {gradeResult.score}%
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 text-lg resize-none leading-relaxed outline-none"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={exampleAnswer && !value && !gradeResult ? "" : (_placeholder || "")}
                    disabled={isLoading || !!gradeResult}
                    style={{
                        paddingBottom: exampleAnswer && !value && !gradeResult ? '40px' : '0'
                    }}
                />

                {/* Example answer inside box - light text */}
                {exampleAnswer && !value && !gradeResult && (
                    <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        right: '24px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        zIndex: 0
                    }}>
                        <span style={{ fontStyle: 'italic' }}>"{exampleAnswer}"</span>
                    </div>
                )}
            </div>

            {/* Feedback area */}
            {isLoading && (
                <div style={{
                    marginTop: '12px',
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.8)',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '12px',
                    animation: 'pulse 1.5s infinite',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {isHebrew ? '✨ בודק וחושב...' : '✨ Analyzing thoughtful response...'}
                </div>
            )}

            {gradeResult && !isLoading && (
                <div className="animate-scaleIn glass-card mt-4 p-4 rounded-xl" style={{
                    borderLeft: `4px solid ${scoreColor}`
                }}>
                    <p style={{ margin: 0, color: 'white', lineHeight: 1.5, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                        {gradeResult.feedback}
                    </p>

                    {gradeResult.improvedVersion && gradeResult.score < 100 && (
                        <div style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{
                                margin: 0,
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>{isHebrew ? 'כדאי לנסות:' : 'Try this:'}</span>
                            </div>
                            <p style={{
                                margin: '6px 0 0 0',
                                fontSize: '15px',
                                fontStyle: 'italic',
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
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


