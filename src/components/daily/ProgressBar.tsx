import React from 'react';

interface GradeResult {
    score: number;
    feedback: string;
    improvedVersion?: string;
}

interface ProgressBarProps {
    currentStep: number;
    grades: (GradeResult | null)[];
    totalSteps?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    currentStep,
    grades,
    totalSteps = 3
}) => {
    // Get color based on score
    const getSegmentColor = (grade: GradeResult | null, index: number) => {
        // Future/Current steps (no grade yet)
        if (!grade) {
            return index <= currentStep ? 'var(--color-primary)' : '#e5e7eb'; // Active/Pending
        }

        // Graded steps
        if (grade.score < 34) return '#ef4444'; // Red
        if (grade.score < 67) return '#f97316'; // Orange
        return '#22c55e'; // Green
    };

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            padding: '0 8px'
        }}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const grade = grades[index];
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const color = getSegmentColor(grade, index);

                return (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            height: '8px',
                            backgroundColor: (isCompleted || isActive) ? color : '#e5e7eb',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease',
                            opacity: isActive ? 1 : 0.6,
                            position: 'relative',
                            boxShadow: isActive ? `0 0 10px ${color}40` : 'none'
                        }}
                    >
                        {/* Current step indicator dot */}
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translate(50%, -50%)',
                                width: '12px',
                                height: '12px',
                                background: '#fff',
                                border: `3px solid ${color}`,
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
