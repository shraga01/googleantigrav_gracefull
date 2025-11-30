import type { UserProfile, DailyEntry } from '../types';

// Placeholder for API Key - in a real app, this should be an env var or secure config
const API_KEY = 'YOUR_GEMINI_API_KEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

interface LLMResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

const FALLBACK_SENTENCES = {
    english: [
        "Today is a new chance to notice grace.",
        "You woke up breathing. That's no small thing.",
        "Before you look for what's wrong, pause. What's right?",
        "Today, someone will smile at you. Will you notice?",
    ],
    hebrew: [
        "היום הוא הזדמנות חדשה להבחין בחסד.",
        "התעוררת נושם. זה לא דבר של מה בכך.",
        "לפני שאתה מחפש מה לא בסדר, עצור. מה כן בסדר?",
        "היום, מישהו יחייך אליך. האם תשים לב?",
    ]
};

const FALLBACK_SUGGESTIONS = {
    english: [
        "A warm cup of coffee or tea",
        "The ability to walk",
        "A stranger's kindness",
        "Running water",
        "A comfortable place to sit"
    ],
    hebrew: [
        "כוס קפה או תה חמה",
        "היכולת ללכת",
        "אדיבות של זר",
        "מים זורמים",
        "מקום נוח לשבת בו"
    ]
};

export const LLMService = {
    generateOpeningSentence: async (user: UserProfile, recentEntries: DailyEntry[]): Promise<string> => {
        try {
            if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') throw new Error('No API Key');

            const prompt = `
        You are a wise, compassionate guide helping someone practice daily appreciation.
        Core philosophy: Self-focus creates suffering. Appreciation is the antidote.
        
        Generate ONE unique opening sentence (1-3 sentences max) for today's gratitude practice.
        Requirements:
        1. Make the user feel seen and not forgotten
        2. Gently redirect from self-focus
        3. Remind them to appreciate
        
        User Profile: Name: ${user.name || 'Friend'}, Language: ${user.language}
        Date: ${new Date().toLocaleDateString()}
        
        Generate in ${user.language} only.
      `;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data: LLMResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error('Invalid API response');
            return text.trim();

        } catch (error) {
            console.warn('LLM Generation failed, using fallback', error);
            const fallbacks = user.language === 'hebrew' ? FALLBACK_SENTENCES.hebrew : FALLBACK_SENTENCES.english;
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    },

    generateSuggestions: async (user: UserProfile, recentEntries: DailyEntry[]): Promise<string[]> => {
        try {
            if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') throw new Error('No API Key');

            const prompt = `
        Generate THREE specific appreciation suggestions for today.
        User Profile: Name: ${user.name || 'Friend'}, Language: ${user.language}
        
        Requirements:
        - Vary between personal and universal graces
        - Specific and concrete
        - Short phrases
        - Generate in ${user.language} only
        - Return as a simple JSON array of strings, e.g. ["suggestion 1", "suggestion 2", "suggestion 3"]
      `;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data: LLMResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error('Invalid API response');

            // Try to parse JSON from the text (it might be wrapped in markdown code blocks)
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback parsing if not JSON
            return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);

        } catch (error) {
            console.warn('LLM Suggestion generation failed, using fallback', error);
            const fallbacks = user.language === 'hebrew' ? FALLBACK_SUGGESTIONS.hebrew : FALLBACK_SUGGESTIONS.english;
            // Shuffle and pick 3
            return [...fallbacks].sort(() => 0.5 - Math.random()).slice(0, 3);
        }
    },

    generateAffirmation: async (user: UserProfile): Promise<string> => {
        try {
            if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') throw new Error('No API Key');

            const prompt = `
        User just completed today's appreciation practice. Generate ONE short, affirming response (1 sentence).
        Celebrate their action. Remind them they chose appreciation over suffering.
        Language: ${user.language}
       `;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data: LLMResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return text ? text.trim() : (user.language === 'hebrew' ? "יפה מאוד. בחרת בהוקרת תודה." : "Beautiful. You chose appreciation today.");

        } catch (error) {
            return user.language === 'hebrew' ? "יפה מאוד. בחרת בהוקרת תודה." : "Beautiful. You chose appreciation today.";
        }
    }
};
