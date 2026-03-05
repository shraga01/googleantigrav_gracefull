import React from 'react';
import { useApp } from '../../context/AppContext';
import '../../styles/navigation.css';

interface GradeResult {
    score: number;
    status: string;
    feedback: string;
    met_criteria: string[];
    missing_criteria: string[];
    coaching_question: string | null;
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

    // Get color based on status
    const getColor = (status: string): string => {
        if (status === 'RETRY' || status === 'BLOCKED') return '#ef4444'; // Red
        if (status === 'IMPROVE') return '#f97316'; // Orange
        return '#22c55e'; // Green (VALIDATED)
    };

    const scoreColor = gradeResult ? getColor(gradeResult.status) : 'transparent';

    // Status label
    const getStatusLabel = (status: string): string => {
        if (status === 'BLOCKED') return isHebrew ? '🚫 חסום' : '🚫 BLOCKED';
        if (status === 'RETRY') return isHebrew ? '🔄 נסה שוב' : '🔄 RETRY';
        if (status === 'IMPROVE') return isHebrew ? '⚠️ לשפר' : '⚠️ IMPROVE';
        return isHebrew ? '✅ אושר' : '✅ VALIDATED';
    };

    // Criteria label translation
    const getCriteriaLabel = (criteria: string): string => {
        const labels: Record<string, { en: string; he: string }> = {
            'SPECIFICITY': { en: 'Specificity', he: 'מעשה ספציפי' },
            'PERSON': { en: 'Person', he: 'אדם' },
            'CAUSALITY': { en: 'Causality', he: 'איך זה עזר לך' },
            'SENSORY': { en: 'Sensory', he: 'חושי' },
            'AUTHENTICITY': { en: 'Authenticity', he: 'אותנטיות' },
        };
        return labels[criteria] ? (isHebrew ? labels[criteria].he : labels[criteria].en) : criteria;
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Input container with glassmorphism */}
            <div
                className="w-full max-w-md mx-auto glass-card rounded-xl p-6 shadow-2xl min-h-[250px] flex flex-col relative transition-colors duration-300"
                style={{
                    borderColor: gradeResult ? scoreColor : 'rgba(255, 255, 255, 0.5)'
                }}
            >
                {/* Status badge */}
                {gradeResult && (
                    <div className={gradeResult.status === 'VALIDATED' ? 'animate-successBounce' : 'animate-scaleIn'} style={{
                        position: 'absolute',
                        top: '12px',
                        right: isHebrew ? 'auto' : '12px',
                        left: isHebrew ? '12px' : 'auto',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: scoreColor,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 2
                    }}>
                        {getStatusLabel(gradeResult.status)} {gradeResult.score}/5
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

                    {/* Coaching question */}
                    {gradeResult.coaching_question && (
                        <p style={{
                            margin: '10px 0 0 0',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#fbbf24',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            💡 {gradeResult.coaching_question}
                        </p>
                    )}

                    {/* Met criteria (green tags) + Missing criteria (red/orange tags) */}
                    {(gradeResult.met_criteria?.length > 0 || gradeResult.missing_criteria?.length > 0) && (
                        <div style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px'
                        }}>
                            {gradeResult.met_criteria?.map((item, i) => (
                                <span key={`met-${i}`} style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#22c55e',
                                    backgroundColor: 'rgba(34,197,94,0.15)',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(34,197,94,0.4)'
                                }}>
                                    ✓ {getCriteriaLabel(item)}
                                </span>
                            ))}
                            {gradeResult.missing_criteria?.map((item, i) => (
                                <span key={`miss-${i}`} style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: scoreColor,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${scoreColor}40`
                                }}>
                                    ✗ {getCriteriaLabel(item)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
