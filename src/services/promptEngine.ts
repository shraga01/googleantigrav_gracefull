/**
 * Modular Evidence-Based Gratitude Prompt Engine
 * 
 * Dimensions:
 * - Targets: Self, Close Other, Stranger, Environment, Adversity Relief
 * - Lenses: Somatic/Body, Relational, Competence, Sensory
 * - Angles: Novelty, Depth, Mental Subtraction
 * - Constraints: No generic nouns, Require agency attribution, Active locale natural phrasing
 * 
 * Enforces the Empirical Law by weaving real Firestore historical context
 * (Dosing phase, Streak, GQ-6 score, and prior causal attributions) into generation prompts.
 */

import type {
    UserProfile,
    ThreeGoodThingsItem,
    PromptTarget,
    PromptLens,
    PromptAngle,
    PromptConfig,
    EmpiricalHistoricalContext,
} from '../types';

export const TARGET_DESCRIPTIONS: Record<PromptTarget, { he: string; en: string }> = {
    self: {
        he: 'מעשה או החלטה שלך שהקלו עליך או על אדם אחר',
        en: 'An action or decision of yours that made things easier for you or someone else',
    },
    close_other: {
        he: 'מחווה קונקרטית מאדם קרוב (בן/בת זוג, הורה, חבר)',
        en: 'A concrete gesture from a close one (partner, parent, friend)',
    },
    stranger: {
        he: 'רגע בלתי צפוי של אדיבות מאדם זר או עמית בעבודה',
        en: 'An unexpected moment of kindness from a stranger or colleague',
    },
    environment: {
        he: 'משאב סביבתי או תנאי פיזי שאפשר לך לפעול ברוגע',
        en: 'An environmental resource or physical condition that enabled you to act calmly',
    },
    adversity_relief: {
        he: 'מצב מאתגר שבו מצאת פתרון, תמיכה או שיעור בעל ערך',
        en: 'A challenging moment where you found a solution, support, or valuable lesson',
    },
};

export const LENS_DESCRIPTIONS: Record<PromptLens, { he: string; en: string }> = {
    somatic: {
        he: 'התחושה הגופנית (חום, הקלה בשרירים, שקט נשימתי)',
        en: 'The somatic sensation (warmth, muscle relief, calm breathing)',
    },
    relational: {
        he: 'הקשר והאמון ההדדי שנוצרו באותו הרגע',
        en: 'The interpersonal connection and mutual trust fostered in that moment',
    },
    competence: {
        he: 'תחושת המסוגלות והיכולת שלך להשפיע לטובה',
        en: 'Your sense of agency, capability, and positive influence',
    },
    sensory: {
        he: 'פרט חושי חי (צליל, מראה, ריח או מגע ספציפי)',
        en: 'A vivid sensory detail (sound, visual cue, smell, or specific touch)',
    },
};

export const PromptEngine = {
    /**
     * Builds a structured prompt configuration tailored to empirical user context
     */
    getDailyConfig: (
        stepIndex: number,
        user?: UserProfile,
        context?: EmpiricalHistoricalContext
    ): PromptConfig => {
        const isMaintenance = context?.dosingPhase === 'maintenance_variety' || user?.dosingSchedule?.phase === 'maintenance_variety';
        
        const defaultTargets: PromptTarget[] = ['close_other', 'self', 'environment'];
        const targets: PromptTarget[] = user?.challenges
            ? ['adversity_relief', ...defaultTargets]
            : defaultTargets;

        // In maintenance phase, rotate lenses and angles to prevent hedonic adaptation
        const lenses: PromptLens[] = isMaintenance
            ? ['somatic', 'relational', 'competence', 'sensory']
            : ['relational', 'competence', 'somatic'];

        const angles: PromptAngle[] = isMaintenance
            ? ['novelty', 'subtraction', 'depth']
            : ['depth', 'novelty', 'subtraction'];

        return {
            target: targets[stepIndex % targets.length],
            lens: lenses[stepIndex % lenses.length],
            angle: angles[stepIndex % angles.length],
            constraints: ['no_generic_nouns', 'require_agency', 'under_40_words'],
        };
    },

    /**
     * Builds the system context enforcing evidence-based gratitude guidelines
     * and injecting verified Firestore empirical context.
     */
    buildSystemContext: (user: UserProfile, context?: EmpiricalHistoricalContext): string => {
        const isHeb = user.language === 'hebrew' || user.locale === 'he';

        const empiricalSection = context
            ? `
EMPIRICAL CLINICAL RECORD (VERIFIED FIRESTORE DATA):
- Dosing Phase: ${context.dosingPhase}
- Active Practice Streak: ${context.streak?.currentStreak ?? 0} days (Total: ${context.streak?.totalDaysPracticed ?? 0} days)
- Longitudinal GQ-6 Score: ${context.latestGQ6 ? `${context.latestGQ6.totalScore}/42 (${context.latestGQ6.timepoint})` : 'Pending initial baseline'}
- Recent Verified Agency Themes: ${context.recentEntries?.flatMap(e => e.items?.map(i => i.causalReflection) || []).filter(Boolean).slice(0, 3).join('; ') || 'None recorded yet'}
- Virtual Gratitude Visit Completed: ${context.latestVisit ? 'Yes (Embodied in empty chair)' : 'No'}
- Huberman Narrative Stored: ${context.latestStory ? 'Yes' : 'No'}
`
            : '';

        return `
You are the Clinical Guide for an evidence-based gratitude application rooted in neurobiology (mPFC activation, vagal tone regulation, and dopamine-serotonin pathways).
${empiricalSection}
CORE PRINCIPLES (Seligman 3GT & Huberman Protocols):
1. SPECIFICITY: Generic nouns (e.g., "family", "health", "sunshine") provide zero neurological rewiring. Concrete actions are required.
2. CAUSAL REFLECTION / AGENCY ATTRIBUTION (ייחוס סיבתי וסוכנות אישית): The user must explicitly identify why the good event occurred and what role they played or what condition made it possible. Without personal agency or causal clarity, gratitude does not build resilience.
3. LANGUAGE: ${isHeb ? 'Hebrew (עברית) ONLY' : 'English ONLY'}.
4. FORMAT: Crisp, dignified, compassionate. No toxic positivity. No flattery.
`;
    },

    /**
     * Prompt for evaluating and grading gratitude items with agency attribution and empirical context
     */
    buildEvaluationPrompt: (
        item: ThreeGoodThingsItem,
        user: UserProfile,
        context?: EmpiricalHistoricalContext
    ): string => {
        const isHeb = user.language === 'hebrew' || user.locale === 'he';
        return `
${PromptEngine.buildSystemContext(user, context)}

TASK: Evaluate this gratitude practice item.

ACT (What happened): "${item.act}"
PERSON / BENEFACTOR: "${item.benefactor || 'Self'}"
BENEFIT (Concrete value): "${item.benefit}"
CAUSAL REFLECTION / AGENCY (Why it happened / user role): "${item.causalReflection}"
AFFECT RATING: ${item.affectRating || 5}/7
${item.mentalSubtraction ? `COUNTERFACTUAL (Mental subtraction): "${item.mentalSubtraction}"` : ''}

EVALUATION RUBRIC:
- Specificity (0-40 pts): Is there a concrete, non-generic incident?
- Impact Clarity (0-30 pts): Is the emotional or practical benefit clearly stated?
- Agency Attribution (0-30 pts): Did the user identify the causality or their own active role/receptivity?

RESPOND STRICTLY IN JSON FORMAT:
{
  "totalScore": <number 0-100>,
  "hasAgencyAttribution": <boolean>,
  "feedback": "<concise actionable clinical feedback in ${isHeb ? 'Hebrew' : 'English'}>",
  "recommendedEnhancement": "<optional suggested refinement if score < 85>"
}
`;
    },

    /**
     * Prompt for the Gratitude Letter & Empty Chair protocol
     */
    buildLetterPrompt: (
        recipient: string,
        relationship: string,
        impact: string,
        user: UserProfile,
        context?: EmpiricalHistoricalContext
    ): string => {
        const isHeb = user.language === 'hebrew' || user.locale === 'he';
        return `
${PromptEngine.buildSystemContext(user, context)}

TASK: Assist the user in structuring a Gratitude Visit Letter (~300 words) according to Martin Seligman's protocol.
RECIPIENT: ${recipient} (${relationship})
SPECIFIC LIFE IMPACT: ${impact}

GUIDELINES FOR THE LETTER:
- Address the recipient directly in second-person ("You / אתה/את").
- Describe the specific past event and what the recipient sacrificed or provided.
- Describe how it changed the user's trajectory or perspective.
- Formatted for reading aloud in person or in a Virtual Empty-Chair exercise.
- Keep the draft heartfelt, authentic, and around 250-300 words.
- Language: ${isHeb ? 'Hebrew' : 'English'}.

Output ONLY the draft text of the letter.
`;
    },

    /**
     * Prompt for Mental Subtraction (George Bailey effect)
     */
    buildMentalSubtractionPrompt: (
        blessing: string,
        user: UserProfile,
        context?: EmpiricalHistoricalContext
    ): string => {
        const isHeb = user.language === 'hebrew' || user.locale === 'he';
        return `
${PromptEngine.buildSystemContext(user, context)}

TASK: Guide the user through a Mental Subtraction exercise (counterfactual reflection).
BLESSING IDENTIFIED: "${blessing}"

Prompt the user to imagine a chain of events where this person, opportunity, or blessing NEVER entered their life.
Help them visualize the absence, feel the contrast, and return to reality with renewed appreciation.
Keep the prompt concise, evocative, and under 50 words in ${isHeb ? 'Hebrew' : 'English'}.
`;
    },
};
