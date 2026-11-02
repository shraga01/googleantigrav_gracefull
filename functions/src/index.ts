/**
 * Server-Side AI Authority & Cloud Functions for Daily Appreciation App
 * 
 * Enforces Architectural Laws:
 * 1. Zero-Trust & Server-Side Authority: Authentication required (request.auth.uid).
 * 2. Vertex AI / GenAI Clean Payload Laws:
 *    - location: 'global' (Never us-central1)
 *    - thinking_level: 'medium' (evaluation) | 'high' (clinical letter synthesis)
 *    - Zero sampling parameters (no temperature, top_p, top_k, thinking_budget).
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

type ThinkingLevel = 'medium' | 'high';

interface GenerateContentPayload {
    contents: Array<{
        role: string;
        parts: Array<{ text: string }>;
    }>;
    generationConfig?: {
        thinkingConfig?: {
            thinkingLevel: ThinkingLevel;
        };
    };
}

/**
 * Executes a clean Vertex AI / Gemini API call server-side.
 * Never leaks the API key to the client.
 */
async function callServerGemini(
    promptText: string,
    thinkingLevel: ThinkingLevel = 'medium'
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new HttpsError(
            'failed-precondition',
            'Server AI Configuration Error: GEMINI_API_KEY is missing on the server environment.'
        );
    }

    const model = 'gemini-2.5-flash';
    // Vertex AI / Google Gen AI global endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Clean payload enforcement:
    // Only thinkingConfig.thinkingLevel is permitted.
    // Strictly NO temperature, top_p, top_k, or thinking_budget.
    const payload: GenerateContentPayload = {
        contents: [
            {
                role: 'user',
                parts: [{ text: promptText }],
            },
        ],
        generationConfig: {
            thinkingConfig: {
                thinkingLevel: thinkingLevel,
            },
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend AI generation error (${response.status}):`, errorText);
        throw new HttpsError('internal', `Backend AI Service Failure: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const outputText = candidate?.content?.parts?.[0]?.text;

    if (!outputText) {
        throw new HttpsError('data-loss', 'No generation content received from AI engine.');
    }

    return outputText;
}

/**
 * Callable: Evaluate Three Good Things Item with Empirical Context
 */
export const evaluateGratitudeItem = onCall(
    { cors: true },
    async (request) => {
        // Strict authentication check
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError(
                'unauthenticated',
                'Authentication Required: User must be signed in to evaluate gratitude entries.'
            );
        }

        const { promptText } = request.data as { promptText?: string };

        if (!promptText || typeof promptText !== 'string') {
            throw new HttpsError('invalid-argument', 'Missing or invalid "promptText" parameter.');
        }

        const result = await callServerGemini(promptText, 'medium');
        return { result };
    }
);

/**
 * Callable: Compose Clinical Gratitude Visit Letter (High Thinking Level)
 */
export const composeGratitudeLetter = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError(
                'unauthenticated',
                'Authentication Required: User must be signed in to compose gratitude letters.'
            );
        }

        const { promptText } = request.data as { promptText?: string };

        if (!promptText || typeof promptText !== 'string') {
            throw new HttpsError('invalid-argument', 'Missing or invalid "promptText" parameter.');
        }

        const result = await callServerGemini(promptText, 'high');
        return { result };
    }
);

/**
 * Callable: Generate Mental Subtraction Reflection Prompt
 */
export const generateMentalSubtraction = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError(
                'unauthenticated',
                'Authentication Required: User must be signed in to generate subtraction prompts.'
            );
        }

        const { promptText } = request.data as { promptText?: string };

        if (!promptText || typeof promptText !== 'string') {
            throw new HttpsError('invalid-argument', 'Missing or invalid "promptText" parameter.');
        }

        const result = await callServerGemini(promptText, 'medium');
        return { result };
    }
);
