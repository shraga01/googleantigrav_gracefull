import React, { useState, useCallback } from 'react';
import { LLMService } from '../../services/llm';
import { useApp } from '../../context/AppContext';

interface GradedInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    index: number;
}

interface GradeResult {
    score: number;
    feedback: string;
    improvedVersion?: string;
}

export const GradedInput: React.FC<GradedInputProps> = ({
    value,
    onChange,
    placeholder,
    index
}) => {
    const { userProfile } = useApp();
    const [grade, setGrade] = useState<GradeResult | null>(null);
    const [isGrading, setIsGrading] = useState(false);

    const isHebrew = userProfile?.language === 'hebrew';

    // Get color based on score (0-100)
    const getColor = (score: number): string => {
        if (score < 34) return '#ef4444'; // Red
        if (score < 67) return '#f97316'; // Orange
        return '#22c55e'; // Green
    };

    // Grade the entry when user stops typing (on blur)
    const handleBlur = useCallback(async () => {
        if (!value.trim() || !userProfile) return;

        setIsGrading(true);
        try {
            const result = await LLMService.gradeEntry(value, userProfile);
            // Convert 0-3 score to 0-100%
            const percentScore = Math.round((result.score / 3) * 100);
            setGrade({
                score: percentScore,
                feedback: result.feedback,
                improvedVersion: result.improvedVersion
            });
        } catch (error) {
            console.error('Grading failed:', error);
        } finally {
            setIsGrading(false);
        }
    }, [value, userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        // Clear grade when user starts typing again
        if (grade) setGrade(null);
    };

    const scoreColor = grade ? getColor(grade.score) : 'transparent';
    const scoreWidth = grade ? `${grade.score}%` : '0%';

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Input container with progress bar */}
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                background: 'var(--color-card-bg)'
            }}>
                {/* Progress bar background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: scoreWidth,
                    backgroundColor: scoreColor,
                    opacity: 0.15,
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Score badge */}
                {grade && (
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
                        {grade.score}%
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder || (isHebrew ? `דבר ${index + 1}...` : `Thing ${index + 1}...`)}
                    rows={2}
                    style={{
                        width: '100%',
                        padding: '16px',
                        paddingRight: grade ? '60px' : '16px',
                        border: 'none',
                        outline: 'none',
                        fontSize: 'var(--font-size-md)',
                        fontFamily: 'inherit',
                        resize: 'none',
                        background: 'transparent',
                        position: 'relative',
                        zIndex: 1
                    }}
                />
            </div>

            {/* Feedback area */}
            {isGrading && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic'
                }}>
                    {isHebrew ? 'בודק...' : 'Evaluating...'}
                </div>
            )}

            {grade && !isGrading && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    padding: '12px',
                    backgroundColor: `${scoreColor}10`,
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${scoreColor}`
                }}>
                    <p style={{ margin: 0, color: 'var(--color-text-main)' }}>
                        {grade.feedback}
                    </p>
                    {grade.improvedVersion && grade.score < 100 && (
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '12px',
                            color: 'var(--color-text-muted)'
                        }}>
                            💡 {isHebrew ? 'דוגמה לשיפור:' : 'Example improvement:'}{' '}
                            <em>{grade.improvedVersion}</em>
                        </p>
                    )}
                    {grade.score < 50 && (
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '12px',
                            color: 'var(--color-text-muted)'
                        }}>
                            {isHebrew
                                ? '💪 הנוסחה מבוססת מחקר מדעי. המשך לתרגל!'
                                : '💪 This formula is science-based. Keep practicing!'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
