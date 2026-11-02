/**
 * Server-Side Vertex AI Authority & Cloud Functions (v2)
 * Platform: daily-appreciation-app (daily-appreciation-app-275bf)
 * 
 * Enforces Architectural Laws:
 * 1. Zero-Key Architecture (ADC):
 *    - Authenticates automatically via Google Cloud Application Default Credentials (ADC)
 *    - Service Account: firebase-adminsdk-fbsvc@daily-appreciation-app-275bf.iam.gserviceaccount.com
 *    - Zero API keys in client bundles or server files.
 * 2. Vertex AI Payload Purity:
 *    - vertexai: true, project: 'daily-appreciation-app-275bf', location: 'global' (Never us-central1)
 *    - thinking_level: 'medium' (3GT evaluations/prompts) | 'high' (deep clinical letters/empty chair)
 *    - STRICT PROHIBITION: Zero thinking_budget, zero temperature, top_p, top_k.
 * 3. Zero-Trust & Server-Side Authority:
 *    - Strict authentication: request.auth?.uid required.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { GoogleGenAI, ThinkingLevel as GenAiThinkingLevel } from '@google/genai';

if (!admin.apps.length) {
    admin.initializeApp();
}

const PROJECT_ID = 'daily-appreciation-app-275bf';
const LOCATION = 'global';
const MODEL_NAME = 'gemini-2.5-flash';

// Initialize Vertex AI with ADC (Zero-Key architecture)
const ai = new GoogleGenAI({
    vertexai: true,
    project: PROJECT_ID,
    location: LOCATION,
});

export type ClientThinkingLevel = 'medium' | 'high';

export interface OrchestrateGratitudeAiData {
    taskType: 'evaluate_3gt' | 'compose_letter' | 'mental_subtraction' | 'modular_prompt' | 'raw_prompt';
    promptText: string;
    thinkingLevel?: ClientThinkingLevel;
    empiricalContext?: {
        dosingPhase?: string;
        streak?: { currentStreak: number; totalDaysPracticed: number };
        latestGQ6?: { totalScore: number; timepoint: string } | null;
        totalGQ6Count?: number;
        recentEntries?: Array<{ items?: Array<{ causalReflection?: string }> }>;
        latestVisit?: unknown;
        latestStory?: unknown;
    };
    locale?: 'he' | 'en';
}

/**
 * Executes a clean Vertex AI call with ADC authority and pure payload.
 */
async function executeVertexAiGeneration(
    promptText: string,
    thinkingLevel: ClientThinkingLevel
): Promise<string> {
    try {
        const mappedLevel =
            thinkingLevel === 'high' ? GenAiThinkingLevel.HIGH : GenAiThinkingLevel.MEDIUM;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: promptText,
            config: {
                thinkingConfig: {
                    thinkingLevel: mappedLevel,
                },
            },
        });

        const textOutput = response.text;
        if (!textOutput) {
            throw new HttpsError('data-loss', 'No text content returned from Vertex AI engine.');
        }

        return textOutput;
    } catch (error: unknown) {
        console.error('Vertex AI Execution Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown Vertex AI error';
        throw new HttpsError('internal', `Vertex AI execution failure: ${message}`);
    }
}

/**
 * Primary Authenticated Cloud Function: orchestrateGratitudeAi
 */
export const orchestrateGratitudeAi = onCall(
    { cors: true },
    async (request) => {
        // Enforce Zero-Trust authentication
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError(
                'unauthenticated',
                'Authentication Required: User must be signed in to invoke Vertex AI services.'
            );
        }

        const data = request.data as OrchestrateGratitudeAiData;

        if (!data || !data.promptText || typeof data.promptText !== 'string') {
            throw new HttpsError(
                'invalid-argument',
                'Missing or invalid "promptText" parameter in request payload.'
            );
        }

        // Determine thinking level based on clinical protocol
        const thinkingLevel: ClientThinkingLevel =
            data.thinkingLevel ||
            (data.taskType === 'compose_letter' ? 'high' : 'medium');

        const result = await executeVertexAiGeneration(data.promptText, thinkingLevel);
        return { result, taskType: data.taskType, thinkingLevel };
    }
);

// Backwards-compatible aliases
export const evaluateGratitudeItem = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError('unauthenticated', 'Authentication Required.');
        }
        const { promptText } = request.data as { promptText?: string };
        if (!promptText) throw new HttpsError('invalid-argument', 'Missing promptText.');
        const result = await executeVertexAiGeneration(promptText, 'medium');
        return { result };
    }
);

export const composeGratitudeLetter = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError('unauthenticated', 'Authentication Required.');
        }
        const { promptText } = request.data as { promptText?: string };
        if (!promptText) throw new HttpsError('invalid-argument', 'Missing promptText.');
        const result = await executeVertexAiGeneration(promptText, 'high');
        return { result };
    }
);

export const generateMentalSubtraction = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError('unauthenticated', 'Authentication Required.');
        }
        const { promptText } = request.data as { promptText?: string };
        if (!promptText) throw new HttpsError('invalid-argument', 'Missing promptText.');
        const result = await executeVertexAiGeneration(promptText, 'medium');
        return { result };
    }
);


/**
 * Test Trigger Callable for Clinical Evening Reminder
 * Validates authentication, queries Firestore profile & today's entries,
 * and if FCM token is present, sends the notification.
 */
export const triggerTestEveningReminder = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError('unauthenticated', 'User must be signed in.');
        }
        const userId = request.auth.uid;
        const db = admin.firestore();

        // 1. Fetch user profile
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new HttpsError('not-found', 'User profile not found in Firestore.');
        }
        const userData = userDoc.data() || {};
        const reminderSettings = userData.reminderSettings || {};
        const fcmToken = reminderSettings.fcmToken;

        // 2. Check today completion (Suppression check)
        const todayStr = new Date().toLocaleDateString('en-CA');
        const entriesSnap = await db.collection('users').doc(userId).collection('entries')
            .where('date', '==', todayStr).limit(1).get();
        const isCompletedToday = !entriesSnap.empty || userData.dosingSchedule?.lastPracticeDate === todayStr;

        const isMaintenance = userData.dosingSchedule?.phase === 'maintenance_variety';
        const locale = userData.locale || (userData.language === 'hebrew' ? 'he' : 'en');

        const title = locale === 'he'
            ? 'טקס הכרת תודה לפני השינה 🌙'
            : 'Evening Gratitude Ritual 🌙';
        const body = locale === 'he'
            ? '10 דקות של 3 דברים טובים וייחוס סוכנות אישית לוויסות וגאלי והרגעת מחשבות לפני השינה.'
            : '10-minute Seligman 3GT with causal agency reflection for pre-sleep vagal regulation.';

        let pushSent = false;
        let pushError: string | null = null;

        if (fcmToken) {
            try {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: {
                        title,
                        body,
                    },
                    data: {
                        url: '/?mode=evening_ritual&source=fcm_test',
                    },
                    webpush: {
                        fcmOptions: {
                            link: 'https://daily-appreciation-app-275bf.web.app/?mode=evening_ritual',
                        },
                    },
                });
                pushSent = true;
            } catch (err: unknown) {
                pushError = err instanceof Error ? err.message : 'FCM send failed';
            }
        }

        return {
            success: true,
            userId,
            isCompletedToday,
            isMaintenance,
            pushSent,
            hasFcmToken: !!fcmToken,
            pushError,
            message: isCompletedToday
                ? 'Clinical suppression: Practice already completed today.'
                : 'Reminder is active and clinically indicated.',
        };
    }
);

export const sendEveningGratitudeReminders = onCall(
    { cors: true },
    async (request) => {
        if (!request.auth || !request.auth.uid) {
            throw new HttpsError('unauthenticated', 'User must be signed in.');
        }
        return { status: 'acknowledged', timestamp: Date.now() };
    }
);
