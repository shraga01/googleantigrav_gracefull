import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface Props {
    onRecordingComplete: (blob: Blob, duration: number) => void;
    onDelete: () => void;
}

export const AudioRecorder: React.FC<Props> = ({ onRecordingComplete, onDelete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                onRecordingComplete(blob, (Date.now() - startTimeRef.current) / 1000);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            startTimeRef.current = Date.now();

            timerRef.current = window.setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleDelete = () => {
        setAudioUrl(null);
        setDuration(0);
        onDelete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (audioUrl) {
        return (
            <div style={{
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <audio src={audioUrl} controls style={{ flex: 1 }} />
                <Button variant="outline" onClick={handleDelete} style={{ padding: '8px' }}>
                    🗑️
                </Button>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                variant={isRecording ? 'secondary' : 'outline'}
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: isRecording ? 'red' : 'var(--color-primary)',
                    border: isRecording ? 'none' : '2px solid var(--color-primary)'
                }}
            >
                {isRecording ? '⏹️' : '🎤'}
            </Button>
            {isRecording && (
                <div style={{ marginTop: '8px', color: 'red', fontWeight: 'bold' }}>
                    {formatTime(duration)}
                </div>
            )}
        </div>
    );
};
