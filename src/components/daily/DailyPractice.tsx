import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LLMService } from '../../services/llm';
import { StorageService } from '../../services/storage';
import { encryptEntry } from '../../services/encryption';
import type { DailyEntry } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { AudioRecorder } from '../common/AudioRecorder';
import { RandomProfileQuestion } from './RandomProfileQuestion';
import { v4 as uuidv4 } from 'uuid';

export const DailyPractice: React.FC = () => {
    const { userProfile, googleId, isAuthenticated } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [openingSentence, setOpeningSentence] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [entryText, setEntryText] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [inputType, setInputType] = useState<'text' | 'audio'>('text');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [showRandomQuestion, setShowRandomQuestion] = useState(false);

    useEffect(() => {
        loadDailyContent();
    }, [userProfile]);

    const loadDailyContent = async () => {
        if (!userProfile) return;

        const today = new Date().toLocaleDateString('en-CA');
        const existingEntry = StorageService.getEntryByDate(today);

        if (existingEntry) {
            setOpeningSentence(existingEntry.openingSentence);
            setSuggestions(existingEntry.suggestions);
            setIsCompleted(true);
            setEntryText(existingEntry.userContent.content as string);
            setIsLoading(false);
            return;
        }

        // 30% chance to show a random profile question before daily practice
        if (Math.random() < 0.3) {
            setShowRandomQuestion(true);
        }

        try {
            const [sentence, suggs] = await Promise.all([
                LLMService.generateOpeningSentence(userProfile, []),
                LLMService.generateSuggestions(userProfile, [])
            ]);
            setOpeningSentence(sentence);
            setSuggestions(suggs);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userProfile) return;

        if (inputType === 'text') {
            const items = entryText.split('\n').filter(line => line.trim().length > 0);
            if (items.length < 3) {
                alert(userProfile.language === 'hebrew' ? 'אנא כתוב לפחות 3 דברים' : 'Please write at least 3 things');
                return;
            }
        } else {
            if (!audioBlob) {
                alert('Please record something');
                return;
            }
        }

        let contentToSave = entryText;
        if (inputType === 'audio' && audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            await new Promise(resolve => {
                reader.onloadend = () => {
                    contentToSave = reader.result as string;
                    resolve(null);
                };
            });
        }

        // Encrypt content if user is authenticated with Google
        if (isAuthenticated && googleId) {
            try {
                contentToSave = await encryptEntry(contentToSave, googleId);
                console.log('✅ Entry encrypted before saving');
            } catch (error) {
                console.error('❌ Encryption failed:', error);
                alert('Failed to encrypt entry. Please try again.');
                return;
            }
        }

        const today = new Date().toLocaleDateString('en-CA');
        const streak = StorageService.getStreak();
        const newStreak = { ...streak, currentStreak: streak.currentStreak + 1, totalDaysPracticed: streak.totalDaysPracticed + 1, lastPracticeDate: today };
        StorageService.updateStreak(newStreak);

        const newEntry: DailyEntry = {
            entryId: uuidv4(),
            date: today,
            openingSentence,
            suggestions,
            userContent: {
                type: inputType,
                content: contentToSave, // Now encrypted if authenticated
                duration: audioDuration
            },
            completedAt: Date.now(),
            streakDay: newStreak.currentStreak
        };
        StorageService.saveEntry(newEntry);

        const affirm = await LLMService.generateAffirmation(userProfile);
        setAffirmation(affirm);
        setIsCompleted(true);
    };

    if (isLoading) return <LoadingSpinner />;

    if (isCompleted) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '32px' }}>🔥 {StorageService.getStreak().currentStreak}</h1>
                <h2 style={{ marginBottom: '20px' }}>{affirmation || (userProfile?.language === 'hebrew' ? 'כל הכבוד' : 'Well done')}</h2>
                <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
                    {userProfile?.language === 'hebrew' ? 'נתראה מחר' : 'See you tomorrow'}
                </p>
            </div>
        );
    }

    return (
        <>
            {showRandomQuestion && (
                <RandomProfileQuestion
                    onComplete={() => setShowRandomQuestion(false)}
                    onSkip={() => setShowRandomQuestion(false)}
                />
            )}

            <div style={{ padding: 'var(--spacing-lg)', maxWidth: '600px', margin: '0 auto', color: 'var(--color-text-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'var(--font-size-xl)' }}>Daily Appreciation</div>
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-primary-light)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--color-primary)',
                        fontWeight: 600
                    }}>
                        🔥 {StorageService.getStreak().currentStreak}
                    </div>
                </div>

                <div style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 600,
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-xl)',
                    lineHeight: '1.4',
                    color: 'var(--color-text-main)'
                }}>
                    {openingSentence}
                </div>

                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {userProfile?.language === 'hebrew' ? 'הנה שלושה דברים להעריך:' : 'Here are three things to appreciate:'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {suggestions.map((s, i) => (
                            <div key={i} style={{
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'white',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-md)',
                                boxShadow: 'var(--shadow-sm)',
                                borderLeft: '4px solid var(--color-secondary)'
                            }}>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Button
                        variant={inputType === 'text' ? 'primary' : 'outline'}
                        onClick={() => setInputType('text')}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                        ✍️ Text
                    </Button>
                    <Button
                        variant={inputType === 'audio' ? 'primary' : 'outline'}
                        onClick={() => setInputType('audio')}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                        🎤 Audio
                    </Button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    {inputType === 'text' ? (
                        <>
                            <textarea
                                value={entryText}
                                onChange={(e) => setEntryText(e.target.value)}
                                placeholder={userProfile?.language === 'hebrew' ? 'על מה אתה אסיר תודה היום?' : 'What are you grateful for today?'}
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '16px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {userProfile?.language === 'hebrew' ? 'כתוב לפחות 3 דברים' : 'Write at least 3 things'}
                            </div>
                        </>
                    ) : (
                        <AudioRecorder
                            onRecordingComplete={(blob, duration) => {
                                setAudioBlob(blob);
                                setAudioDuration(duration);
                            }}
                            onDelete={() => {
                                setAudioBlob(null);
                                setAudioDuration(0);
                            }}
                        />
                    )}
                </div>

                <Button fullWidth onClick={handleSave}>
                    {userProfile?.language === 'hebrew' ? 'סיים תרגול' : 'Complete Practice'}
                </Button>
            </div>
        </>
    );
};
