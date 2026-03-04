import type { UserProfile, DailyEntry } from '../types';
import { getTimeInfo, getTimeDescription, type TimeOfDay } from '../utils/timeUtils';

// ==========================================
// GEMINI AI CONFIGURATION
// ==========================================

// API Configuration - Using Gemini 2.5 Flash
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash'; // Gemini 2.5 Flash (stable)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Model Settings - Standard (fast responses)
const MODEL_CONFIG = {
    temperature: 0.1,
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
    openingSentence: (user: UserProfile, recentEntries: DailyEntry[], timeOfDay: TimeOfDay = 'evening') => {
        const timeInfo = getTimeInfo();
        const timeDesc = getTimeDescription(timeOfDay, user.language === 'hebrew');
        const isHebrew = user.language === 'hebrew';

        // Time-specific context for the AI
        const timeContext = {
            morning: isHebrew
                ? 'זהו בוקר - המשתמש מתחיל את היום שלו. עודד אותו לשים לב לדברים טובים שיקרו היום.'
                : 'This is morning - user is starting their day. Encourage them to notice good things that will happen today.',
            afternoon: isHebrew
                ? 'זהו אחר הצהריים - המשתמש באמצע היום. עודד אותו לחשוב על דברים טובים שכבר קרו היום.'
                : 'This is afternoon - user is mid-day. Encourage them to think about good things that already happened today.',
            evening: isHebrew
                ? 'זהו ערב - הזמן האידיאלי. המשתמש מסיים את היום ויכול להרהר על כל מה שקרה.'
                : 'This is evening - the ideal time. User is ending their day and can reflect on everything that happened.',
            night: isHebrew
                ? 'זהו לילה מאוחר - המשתמש לפני השינה. עודד אותו לסיים את היום בהכרת תודה.'
                : 'This is late night - user is before sleep. Encourage them to end the day with gratitude.'
        };

        return `
${SYSTEM_CONTEXT}

TASK: Generate ONE ${timeDesc} greeting (1-2 sentences) to start the gratitude practice.

REQUIREMENTS:
- ${timeContext[timeOfDay]}
- Gently guide them toward SPECIFIC gratitude (not generic)
- Warm and inviting tone
- No questions - make statements
- Include appropriate ${timeDesc} greeting (${isHebrew ? timeInfo.greeting.hebrew : timeInfo.greeting.english})

USER PROFILE:
${buildUserContext(user)}

LANGUAGE: ${isHebrew ? 'Hebrew (עברית) ONLY' : 'English ONLY'}
DAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })} ${timeDesc}
STREAK: ${recentEntries.length} day${recentEntries.length !== 1 ? 's' : ''} of practice

Examples of good ${timeDesc} openings:
${timeOfDay === 'morning' ? `
- "${isHebrew ? 'בוקר טוב! היום מזמין אותך לשים לב לרגעים הקטנים של חסד.' : 'Good morning! Today invites you to notice small moments of kindness.'}"
- "${isHebrew ? 'בוקר של הזדמנויות חדשות. שים לב למי שיעזור לך היום.' : 'A morning of new opportunities. Notice who helps you today.'}"
` : timeOfDay === 'afternoon' ? `
- "${isHebrew ? 'צהריים טובים! עצור לרגע וחשוב על משהו טוב שכבר קרה היום.' : 'Good afternoon! Pause and think of something good that already happened today.'}"
- "${isHebrew ? 'אמצע היום - הזדמנות להעריך את מה שכבר התרחש.' : 'Mid-day - an opportunity to appreciate what has already unfolded.'}"
` : timeOfDay === 'evening' ? `
- "${isHebrew ? 'ערב טוב! הגיע הזמן להרהר בחסדי היום.' : 'Good evening! Time to reflect on the kindnesses of today.'}"
- "${isHebrew ? 'לפני שהיום נגמר, בוא נמצא שלושה רגעים ספציפיים של טוב.' : 'Before the day ends, find three specific moments of good.'}"
` : `
- "${isHebrew ? 'לילה טוב! לפני השינה, נזכר במי שהקל עליך היום.' : 'Good night! Before sleep, recall who made your day easier.'}"
- "${isHebrew ? 'סוף יום מושלם להודות על הדברים הקטנים.' : 'A perfect end of day to be thankful for the small things.'}"
`}

GENERATE in ${isHebrew ? 'HEBREW ONLY' : 'ENGLISH ONLY'}.
Return ONLY the greeting, no quotes.
`;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Compassionate Guide - Neuro-Scoring
    gradeEntry: (entry: string, user: UserProfile) => `
# ROLE
You are the "Compassionate Guide", an evidence-based gratitude app. Your goal is to help users encode positive memories using Affective Neuroscience.

# LOGIC GATES (CRITICAL)
1. **CONTENT FILTER**: If the entry contains hate speech, politics, or medical advice, set status to "BLOCKED".
2. **APPRECIATION CHECK**: If the entry is a complaint, neutral statement, or lacks any appreciation, set status to "RETRY" and ignore the scoring rubric.

# NEURO-SCORING RUBRIC (0-5)
Award 1 point for each:
1. [SPECIFICITY]: Concrete event/act (not a general concept).
2. [PERSON]: Explicit mention of a person or relationship.
3. [CAUSALITY]: The "Why" or the specific benefit explained.
4. [SENSORY]: Emotional or physical sensory details included.
5. [AUTHENTICITY]: Acknowledgment of a challenge or a novel/surprising moment.

# RESPONSE PROTOCOL
- If Score < 4: Use "IMPROVE" status. Provide 1 sentence of praise and 1 targeted coaching question to help them reach a 5/5.
- If Score >= 4: Use "VALIDATED" status. Provide a warm, reinforcing reflection.

LANGUAGE: ${user.language === 'hebrew' ? 'Hebrew (עברית) ONLY' : 'English ONLY'}

# OUTPUT FORMAT (STRICT JSON)
{
  "status": "VALIDATED" | "IMPROVE" | "RETRY" | "BLOCKED",
  "score": number,
  "met_criteria": ["SPECIFICITY", "PERSON", "CAUSALITY", "SENSORY", "AUTHENTICITY"],
  "missing_criteria": ["..."],
  "feedback": "string",
  "coaching_question": "string | null"
}

# INPUT
User Entry: "${entry}"
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
                generationConfig: {
                    ...config,
                    responseMimeType: 'application/json'
                },
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
        const timeInfo = getTimeInfo();
        const apiResult = await callGeminiAPI(PROMPTS.openingSentence(user, recentEntries, timeInfo.timeOfDay));

        if (apiResult) {
            console.log(`✅ AI generated ${timeInfo.timeOfDay} opening sentence`);
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
            } catch {
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
     * Grade a user's entry using Neuro-Scoring Rubric (0-5)
     * Returns met/missing criteria and coaching feedback
     */
    gradeEntry: async (entry: string, user: UserProfile): Promise<{
        score: number;
        status: string;
        feedback: string;
        met_criteria: string[];
        missing_criteria: string[];
        coaching_question: string | null;
    }> => {
        const apiResult = await callGeminiAPI(PROMPTS.gradeEntry(entry, user), true);

        if (apiResult) {
            try {
                const jsonMatch = apiResult.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch {
                console.warn('Failed to parse grading');
            }
        }

        // Fallback: simple word count heuristic
        const words = entry.trim().split(/\s+/).length;
        const isHebrew = user.language === 'hebrew';

        if (words < 3) {
            return {
                score: 0,
                status: 'RETRY',
                feedback: isHebrew
                    ? 'זו לא נראית כרשומת הוקרה. נסה לזהות דבר קטן אחד שהלך טוב היום.'
                    : 'This doesn\'t appear to be a gratitude entry. Try identifying one small thing that went well today.',
                met_criteria: [],
                missing_criteria: ['SPECIFICITY', 'PERSON', 'CAUSALITY', 'SENSORY', 'AUTHENTICITY'],
                coaching_question: isHebrew
                    ? 'מה הדבר הכי קטן שמישהו עשה בשבילך היום?'
                    : 'What is the smallest thing someone did for you today?'
            };
        } else if (words < 10) {
            return {
                score: 2,
                status: 'IMPROVE',
                feedback: isHebrew
                    ? 'התחלה טובה! אבל חסרים פרטים חשובים שיהפכו את ההוקרה ליעילה יותר.'
                    : 'Good start! But key details are missing that would make this appreciation more effective.',
                met_criteria: ['SPECIFICITY'],
                missing_criteria: ['PERSON', 'CAUSALITY', 'SENSORY', 'AUTHENTICITY'],
                coaching_question: isHebrew
                    ? 'מי היה מעורב ברגע הזה, ואיך זה גרם לך להרגיש?'
                    : 'Who was involved in this moment, and how did it make you feel?'
            };
        }
        return {
            score: 5,
            status: 'VALIDATED',
            feedback: isHebrew
                ? 'ספציפי, אישי ומשמעותי – ההוקרה הזו מקודדת זיכרונות חיוביים במוח.'
                : 'Specific, personal, and meaningful – this appreciation encodes positive memories in the brain.',
            met_criteria: ['SPECIFICITY', 'PERSON', 'CAUSALITY', 'SENSORY', 'AUTHENTICITY'],
            missing_criteria: [],
            coaching_question: null
        };
    },

    isConfigured: (): boolean => !!API_KEY,
    getModelName: (): string => MODEL
};
