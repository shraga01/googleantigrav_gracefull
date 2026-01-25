import type { UserProfile, DailyEntry } from '../types';

// ==========================================
// GEMINI AI CONFIGURATION
// ==========================================

// API Configuration - Using Gemini 2.5 Flash
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash'; // Gemini 2.5 Flash (stable)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Model Settings - Standard (fast responses)
const MODEL_CONFIG = {
    temperature: 0.8,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 400,
    candidateCount: 1
};

// Model Settings - With Thinking (for complex reasoning tasks)
const MODEL_CONFIG_WITH_THINKING = {
    ...MODEL_CONFIG,
    thinkingConfig: {
        thinkingBudget: 1024  // tokens for internal reasoning
    }
};

// Safety Settings
const SAFETY_SETTINGS = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
];

// ==========================================
// EVIDENCE-BASED GRATITUDE METHODOLOGY
// ==========================================

const GRATITUDE_METHODOLOGY = `
SCIENTIFIC GRATITUDE PRACTICE PRINCIPLES:

1. SPECIFICITY IS REQUIRED - This is the #1 rule!
   - Generic gratitude like "family", "health", "job" does NOT work
   - Each entry must be CONCRETE and SPECIFIC
   - Bad: "I'm grateful for my family"
   - Good: "My sister called to check on me during my stressful week"

2. THE FORMULA FOR EFFECTIVE GRATITUDE:
   Each entry should include:
   - ONE CONCRETE ACT (what specifically happened)
   - ONE PERSON (who was involved, even if it's yourself)
   - HOW IT MADE LIFE EASIER (the specific benefit)
   
   Example: "My colleague Sarah stayed late to help me finish the presentation, 
   which saved me from working all weekend and let me rest."

3. TIMING: Night practice (reflecting on the day)
   - 3 entries per evening
   - Focus on TODAY's specific events

4. SUSTAINED PRACTICE:
   - Minimum 4 weeks for behavioral change
   - 6 weeks for biomarker benefits plateau
   - Consistency matters more than quantity
`;

// ==========================================
// USER PROFILE CONTEXT BUILDER
// ==========================================

function buildUserContext(user: UserProfile): string {
    const parts: string[] = [];

    if (user.name) parts.push(`Name: ${user.name}`);
    if (user.gender) parts.push(`Gender: ${user.gender}`);
    if (user.familyStatus) parts.push(`Family Status: ${user.familyStatus}`);
    if (user.career) parts.push(`Career/Work: ${user.career}`);
    if (user.livingSituation) parts.push(`Living Situation: ${user.livingSituation}`);
    if (user.joys) parts.push(`What brings them joy: ${user.joys}`);
    if (user.challenges) parts.push(`Current challenges: ${user.challenges}`);
    if (user.dreams) parts.push(`Dreams and aspirations: ${user.dreams}`);
    if (user.goals) parts.push(`Current goals: ${user.goals}`);

    return parts.length > 0 ? parts.join('\n') : 'No additional profile information available.';
}

// ==========================================
// SYSTEM PROMPTS
// ==========================================

const SYSTEM_CONTEXT = `
You are a compassionate guide for an evidence-based gratitude practice app.

${GRATITUDE_METHODOLOGY}

STRICT CONTENT RESTRICTIONS:
- NEVER discuss politics, religion, or controversial topics
- NEVER give medical, legal, or financial advice
- NEVER mention violence, death, illness, or disturbing content
- NEVER use profanity
- ALWAYS stay focused on gratitude and appreciation
- ALWAYS be positive and uplifting

LANGUAGE RULES:
- Generate content ONLY in the specified language
- For Hebrew: Use modern, clear Hebrew (עברית)
`;

// ==========================================
// PROMPT TEMPLATES
// ==========================================

const PROMPTS = {
    openingSentence: (user: UserProfile, recentEntries: DailyEntry[]) => `
${SYSTEM_CONTEXT}

TASK: Generate ONE evening greeting (1-2 sentences) to start tonight's gratitude practice.

REQUIREMENTS:
- This is an EVENING practice - user is reflecting on their day
- Gently guide them toward SPECIFIC gratitude (not generic)
- Warm and inviting tone
- No questions - make statements

USER PROFILE:
${buildUserContext(user)}

LANGUAGE: ${user.language === 'hebrew' ? 'Hebrew (עברית) ONLY' : 'English ONLY'}
DAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} evening
STREAK: ${recentEntries.length} day${recentEntries.length !== 1 ? 's' : ''} of practice

Examples of good openings:
- "Take a moment to reflect on today's small kindnesses."
- "Tonight, let's find the specific moments that made today meaningful."
- "Before sleep, recall three concrete ways someone made your day easier."

GENERATE in ${user.language === 'hebrew' ? 'HEBREW ONLY' : 'ENGLISH ONLY'}.
Return ONLY the greeting, no quotes.
`,

    suggestions: (user: UserProfile, _recentEntries: DailyEntry[]) => `
${SYSTEM_CONTEXT}

TASK: Generate 3 SPECIFIC gratitude suggestions as examples for tonight.

CRITICAL: These must follow the evidence-based formula:
- ONE CONCRETE ACT (what happened)
- ONE PERSON (who was involved)
- HOW IT MADE LIFE EASIER (the benefit)

BAD EXAMPLES (too generic - NEVER generate these):
❌ "Family"
❌ "My health"
❌ "Having a job"
❌ "Good weather"
❌ "My friends"

GOOD EXAMPLES (specific and concrete):
✅ "My partner made morning coffee so I could sleep 10 more minutes"
✅ "The bus driver waited for me even though I was running late"
✅ "My coworker covered my mistake without telling anyone"
✅ "Mom sent a voice message that made me smile during a tough meeting"

USER PROFILE (use this for personalized suggestions):
${buildUserContext(user)}

${user.career ? `PERSONALIZATION: Include something related to their work: ${user.career}` : ''}
${user.familyStatus ? `PERSONALIZATION: Include something about their family situation: ${user.familyStatus}` : ''}
${user.joys ? `PERSONALIZATION: Reference their joys: ${user.joys}` : ''}

LANGUAGE: ${user.language === 'hebrew' ? 'Hebrew (עברית) ONLY' : 'English ONLY'}

GENERATE in ${user.language === 'hebrew' ? 'HEBREW ONLY' : 'ENGLISH ONLY'}.
Return as JSON array: ["specific_suggestion_1", "specific_suggestion_2", "specific_suggestion_3"]
`,

    affirmation: (user: UserProfile, streak: number) => `
${SYSTEM_CONTEXT}

TASK: User just completed their evening gratitude practice. Generate ONE short affirmation.

REQUIREMENTS:
- Celebrate their SPECIFIC practice (not generic praise)
- Mention the value of specificity if appropriate
- Keep under 20 words
- If streak >= 7, acknowledge consistency (4 weeks = real change!)

USER: ${user.name || 'Friend'}
STREAK: ${streak} day${streak !== 1 ? 's' : ''}
LANGUAGE: ${user.language === 'hebrew' ? 'Hebrew (עברית) ONLY' : 'English ONLY'}

${streak >= 28 ? 'CELEBRATE: They reached 4 weeks - real behavioral change happens now!' : ''}
${streak >= 42 ? 'CELEBRATE: 6 weeks - biomarker benefits are peaking!' : ''}

GENERATE in ${user.language === 'hebrew' ? 'HEBREW ONLY' : 'ENGLISH ONLY'}.
Return ONLY the message.
`,

    // NEW: Grade user entries for specificity
    gradeEntry: (entry: string, user: UserProfile) => `
${SYSTEM_CONTEXT}

TASK: Evaluate if this gratitude entry is SPECIFIC enough to be effective.

ENTRY TO EVALUATE: "${entry}"

SCORING CRITERIA:
1. Is there a CONCRETE ACT described? (not just a noun like "family")
2. Is there a PERSON mentioned? (even if it's themselves)
3. Is there a BENEFIT explained? (how it made life easier/better)

SCORE:
- 3/3 = Excellent - truly specific and effective
- 2/3 = Good - somewhat specific, could be more detailed
- 1/3 = Needs work - too generic, won't trigger neural benefits
- 0/3 = Too vague - just a word or generic concept

EXAMPLES:
- "My health" = 0/3 (just a word)
- "I'm grateful for my sister" = 1/3 (has person but no act)
- "My sister called me" = 2/3 (has person and act, no benefit)
- "My sister called to cheer me up when I was stressed about work" = 3/3

LANGUAGE: ${user.language === 'hebrew' ? 'Hebrew' : 'English'}

RESPOND with JSON:
{
  "score": <0-3>,
  "feedback": "<brief encouraging feedback to help them be more specific>",
  "improvedVersion": "<if score < 3, suggest a more specific version>"
}
`
};

// ==========================================
// FALLBACK CONTENT (All specific, following the formula)
// ==========================================

const FALLBACK = {
    sentences: {
        english: [
            "Tonight, recall three specific moments someone made your day a little easier.",
            "Before you rest, think of the concrete acts of kindness you witnessed today.",
            "Let's find the small, specific blessings hidden in your day.",
            "Reflect on who helped you today and exactly how they did it."
        ],
        hebrew: [
            "הערב, נזכר בשלושה רגעים ספציפיים שמישהו הקל על יומך.",
            "לפני השינה, חשוב על מעשי החסד הקונקרטיים שחווית היום.",
            "בואו נמצא את הברכות הקטנות והספציפיות שמוסתרות ביומך.",
            "חשוב על מי עזר לך היום ובדיוק איך הוא עשה את זה."
        ]
    },
    suggestions: {
        english: [
            "A colleague answered my question quickly so I could finish on time",
            "The barista smiled and wished me a good day",
            "My partner handled dinner so I could rest after a long day",
            "A stranger held the door open when my hands were full",
            "My friend texted to check if I made it home safely",
            "Someone let me go ahead in line when I was in a rush"
        ],
        hebrew: [
            "עמית ענה על השאלה שלי במהירות כדי שאוכל לסיים בזמן",
            "הבריסטה חייך ואיחל לי יום טוב",
            "בן/בת הזוג שלי הכין ארוחת ערב כדי שאוכל לנוח",
            "זר החזיק לי את הדלת כשהידיים שלי היו תפוסות",
            "חבר שלח הודעה לבדוק שהגעתי הביתה בשלום",
            "מישהו נתן לי לעבור לפניו בתור כשהייתי ממהר"
        ]
    },
    affirmations: {
        english: [
            "Specific gratitude rewires your brain. Well done tonight.",
            "You're building real neural pathways with each concrete memory.",
            "This practice compounds. Each specific entry matters.",
            "Tonight's reflections are tomorrow's resilience."
        ],
        hebrew: [
            "הכרת תודה ספציפית משנה את המוח שלך. כל הכבוד.",
            "אתה בונה מסלולים עצביים אמיתיים עם כל זיכרון קונקרטי.",
            "התרגול הזה מצטבר. כל רשומה ספציפית חשובה.",
            "ההרהורים של הלילה הם החוסן של מחר."
        ]
    }
};

// ==========================================
// API FUNCTIONS
// ==========================================

interface LLMResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
    error?: { message?: string };
}

async function callGeminiAPI(prompt: string, useThinking: boolean = false): Promise<string | null> {
    if (!API_KEY) {
        console.warn('⚠️ Gemini API key not configured');
        return null;
    }

    try {
        const config = useThinking ? MODEL_CONFIG_WITH_THINKING : MODEL_CONFIG;
        console.log(`🤖 Calling Gemini 2.5 Flash API${useThinking ? ' (with thinking)' : ''}...`);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: config,
                safetySettings: SAFETY_SETTINGS
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: LLMResponse = await response.json();
        if (data.error) throw new Error(data.error.message);

        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (error) {
        console.error('❌ Gemini API call failed:', error);
        return null;
    }
}

function getRandomFallback<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => 0.5 - Math.random());
}

// ==========================================
// EXPORTED SERVICE
// ==========================================

export const LLMService = {
    generateOpeningSentence: async (user: UserProfile, recentEntries: DailyEntry[]): Promise<string> => {
        const apiResult = await callGeminiAPI(PROMPTS.openingSentence(user, recentEntries));

        if (apiResult) {
            console.log('✅ AI generated opening sentence');
            return apiResult;
        }

        const fallbacks = user.language === 'hebrew' ? FALLBACK.sentences.hebrew : FALLBACK.sentences.english;
        return getRandomFallback(fallbacks);
    },

    generateSuggestions: async (user: UserProfile, recentEntries: DailyEntry[]): Promise<string[]> => {
        const apiResult = await callGeminiAPI(PROMPTS.suggestions(user, recentEntries));

        if (apiResult) {
            try {
                const jsonMatch = apiResult.match(/\[.*\]/s);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(parsed) && parsed.length >= 3) {
                        console.log('✅ AI generated specific suggestions');
                        return parsed.slice(0, 3);
                    }
                }
            } catch (e) {
                console.warn('Failed to parse suggestions');
            }
        }

        const fallbacks = user.language === 'hebrew' ? FALLBACK.suggestions.hebrew : FALLBACK.suggestions.english;
        return shuffleArray(fallbacks).slice(0, 3);
    },

    generateAffirmation: async (user: UserProfile, streak?: number): Promise<string> => {
        const apiResult = await callGeminiAPI(PROMPTS.affirmation(user, streak || 1));

        if (apiResult) {
            console.log('✅ AI generated affirmation');
            return apiResult;
        }

        const fallbacks = user.language === 'hebrew' ? FALLBACK.affirmations.hebrew : FALLBACK.affirmations.english;
        return getRandomFallback(fallbacks);
    },

    /**
     * Grade a user's entry for specificity (0-3 score)
     * Returns feedback to help them be more specific
     */
    gradeEntry: async (entry: string, user: UserProfile): Promise<{
        score: number;
        feedback: string;
        improvedVersion?: string;
    }> => {
        const apiResult = await callGeminiAPI(PROMPTS.gradeEntry(entry, user), true); // Use thinking for better analysis

        if (apiResult) {
            try {
                const jsonMatch = apiResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('Failed to parse grading');
            }
        }

        // Fallback: simple word count heuristic
        const words = entry.trim().split(/\s+/).length;
        if (words < 3) {
            return {
                score: 0,
                feedback: user.language === 'hebrew'
                    ? 'נסה להיות ספציפי יותר - מה קרה? מי היה מעורב?'
                    : 'Try to be more specific - what happened? Who was involved?',
                improvedVersion: undefined
            };
        } else if (words < 8) {
            return {
                score: 1,
                feedback: user.language === 'hebrew'
                    ? 'טוב! אבל איך זה הקל על החיים שלך?'
                    : 'Good! But how did it make your life easier?',
                improvedVersion: undefined
            };
        }
        return {
            score: 3,
            feedback: user.language === 'hebrew' ? 'מצויין! ספציפי ומשמעותי.' : 'Excellent! Specific and meaningful.',
            improvedVersion: undefined
        };
    },

    isConfigured: (): boolean => !!API_KEY,
    getModelName: (): string => MODEL
};
