/**
 * Server-Side AI API Routes
 * 
 * Enforces:
 * 1. Firebase Authentication (Bearer token verification via Firebase Admin)
 * 2. Vertex AI / Gemini Payload Cleanliness (location: 'global', thinking_level: 'medium'|'high', 0 sampling params)
 * 3. Zero-Leak: process.env.GEMINI_API_KEY used exclusively server-side.
 */

import express from 'express';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.js';

const router = express.Router();

async function callServerGemini(promptText, thinkingLevel = 'medium') {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in server environment.');
    }

    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
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
        console.error(`AI API error (${response.status}):`, errorText);
        throw new Error(`AI generation error: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const outputText = candidate?.content?.parts?.[0]?.text;

    if (!outputText) {
        throw new Error('No output content from Gemini engine.');
    }

    return outputText;
}

// POST /api/ai/evaluate
router.post('/evaluate', verifyFirebaseToken, async (req, res) => {
    try {
        const { promptText } = req.body;
        if (!promptText) {
            return res.status(400).json({ error: 'promptText is required' });
        }

        const result = await callServerGemini(promptText, 'medium');
        res.json({ result });
    } catch (error) {
        console.error('AI evaluation route error:', error);
        res.status(500).json({ error: error.message || 'AI evaluation failed' });
    }
});

// POST /api/ai/letter
router.post('/letter', verifyFirebaseToken, async (req, res) => {
    try {
        const { promptText } = req.body;
        if (!promptText) {
            return res.status(400).json({ error: 'promptText is required' });
        }

        const result = await callServerGemini(promptText, 'high');
        res.json({ result });
    } catch (error) {
        console.error('AI letter route error:', error);
        res.status(500).json({ error: error.message || 'AI letter generation failed' });
    }
});

// POST /api/ai/subtraction
router.post('/subtraction', verifyFirebaseToken, async (req, res) => {
    try {
        const { promptText } = req.body;
        if (!promptText) {
            return res.status(400).json({ error: 'promptText is required' });
        }

        const result = await callServerGemini(promptText, 'medium');
        res.json({ result });
    } catch (error) {
        console.error('AI subtraction route error:', error);
        res.status(500).json({ error: error.message || 'AI subtraction prompt generation failed' });
    }
});

export default router;
