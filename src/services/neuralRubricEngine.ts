import type { Locale } from '../types';

export type NeuralDimensionKey =
    | 'specificity'
    | 'sensoryEmotionalDetail'
    | 'causalAgency'
    | 'interpersonalWarmth'
    | 'authenticity';

export interface NeuralDimensions {
    specificity: boolean;
    causalAgency: boolean;
    interpersonalWarmth: boolean;
    sensoryEmotionalDetail: boolean;
    authenticity: boolean;
}

export interface NeuralEvaluationResult {
    isGenuineAppreciation: boolean;
    dimensions: NeuralDimensions;
    score: number;
    missingDimensionKey: NeuralDimensionKey | null;
    empoweringFeedback: string;
    upgradePrompt: string;
    upgradeChips: string[];
    whatsappDraft: string;
}

const SPECIFICITY_MARKERS_HE = [
    'היום',
    'בבוקר',
    'בערב',
    'בצהריים',
    'בעבודה',
    'בבית',
    'כש',
    'אחרי',
    'במהלך',
    'אתמול',
    'בדרך',
    'דקות',
];
const SPECIFICITY_MARKERS_EN = [
    'today',
    'morning',
    'evening',
    'afternoon',
    'night',
    'at work',
    'at home',
    'when ',
    'after ',
    'during ',
    'yesterday',
    'on my way',
];

const AGENCY_MARKERS_HE = [
    'החלטתי',
    'בחרתי',
    'הסכמתי',
    'יזמתי',
    'ביקשתי',
    'עשיתי',
    'הצלחתי',
    'הקשבתי',
    'עצרתי',
    'בזכותי',
    'החלק שלי',
    'פניתי',
    'שיתפתי',
];
const AGENCY_MARKERS_EN = [
    'decided',
    'chose',
    'agreed',
    'initiated',
    'asked',
    'did',
    'succeeded',
    'managed',
    'listened',
    'paused',
    'stopped',
    'my part',
    'reached out',
];

const INTERPERSONAL_MARKERS_HE = [
    'עמית',
    'חבר',
    'חברה',
    'חברים',
    'אשתי',
    'בעלי',
    'בן זוג',
    'בת זוג',
    'אמא',
    'אבא',
    'הורים',
    'ילד',
    'ילדים',
    'ילדה',
    'משפחה',
    'צוות',
    'מנהל',
    'מנהלת',
    'שכן',
    'שכנה',
    'לקוח',
    'עזר',
    'עזרה',
    'הוקרה הדדית',
    'תודה ל',
    'שיחה',
    'אחי',
    'אחותי',
    'מורה',
];
const INTERPERSONAL_MARKERS_EN = [
    'colleague',
    'coworker',
    'friend',
    'friends',
    'wife',
    'husband',
    'partner',
    'mom',
    'mother',
    'dad',
    'father',
    'parents',
    'child',
    'children',
    'kids',
    'family',
    'team',
    'manager',
    'neighbor',
    'client',
    'helped',
    'help',
    'mutual appreciation',
    'thanked',
    'conversation',
    'talked',
];

const SENSORY_MARKERS_HE = [
    'הרגשתי',
    'תחושה',
    'הקלה',
    'שמחה',
    'שקט',
    'רוגע',
    'רגוע',
    'חום',
    'לב',
    'נשימה',
    'אנרגיה',
    'חיוך',
    'התרגשות',
    'שלווה',
    'נעים',
    'נעימה',
    'טעים',
    'אור',
    'מוקיר',
];
const SENSORY_MARKERS_EN = [
    'felt',
    'feeling',
    'relief',
    'relieved',
    'joy',
    'quiet',
    'calm',
    'warm',
    'warmth',
    'heart',
    'breath',
    'breathe',
    'energy',
    'smile',
    'excited',
    'peace',
    'peaceful',
    'pleasant',
    'delicious',
    'light',
];

const AUTHENTICITY_MARKERS_HE = [
    'למרות',
    'קשה',
    'מורכב',
    'מורכבת',
    'עמוס',
    'מעייף',
    'סוף סוף',
    'הצלחתי',
    'טעות',
    'פחד',
    'אתגר',
    'חשש',
    'מאמץ',
    'מתוח',
];
const AUTHENTICITY_MARKERS_EN = [
    'despite',
    'even though',
    'hard',
    'difficult',
    'complex',
    'busy',
    'tiring',
    'finally',
    'succeeded',
    'mistake',
    'fear',
    'challenge',
    'effort',
    'tense',
];

const DIMENSION_PRIORITY: NeuralDimensionKey[] = [
    'specificity',
    'sensoryEmotionalDetail',
    'causalAgency',
    'interpersonalWarmth',
    'authenticity',
];

function containsAny(haystack: string, needles: string[]): boolean {
    const lower = haystack.toLowerCase();
    return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}

function isRepeatedGarbage(text: string): boolean {
    const compact = text.replace(/\s+/g, '');
    if (compact.length < 6) return true;
    const uniqueChars = new Set(compact);
    return uniqueChars.size < 3 || /^(.)\1+$/u.test(compact);
}

function buildSnippet(q1: string): string {
    const clean = q1.trim().replace(/\s+/g, ' ');
    if (clean.length <= 85) return clean;
    const slice = clean.slice(0, 82);
    const lastSpace = slice.lastIndexOf(' ');
    return `${lastSpace > 40 ? slice.slice(0, lastSpace) : slice}...`;
}

function getUpgradeData(
    missing: NeuralDimensionKey | null,
    locale: Locale
): { prompt: string; chips: string[] } {
    const isHe = locale === 'he';

    if (!missing) {
        return {
            prompt: isHe
                ? 'חמשת צירי ההטמעה פעילים! רגע זה מעוגן היטב בזיכרון הרגשי והגופני.'
                : 'All 5 neural pillars are active! This moment is richly anchored in memory.',
            chips: [],
        };
    }

    switch (missing) {
        case 'specificity':
            return {
                prompt: isHe
                    ? 'כדי לקבע את הזיכרון: מתי או באיזה הקשר מדויק הרגע הזה קרה?'
                    : 'To sharpen memory encoding: when or where specifically did this happen today?',
                chips: isHe
                    ? ['זה קרה היום במהלך העבודה', 'זה קרה בבוקר לפני ההמולה', 'ברגע של הפסקה שקטה בבית']
                    : ['It happened today during work', 'This morning before the rush', 'During a quiet pause at home'],
            };
        case 'sensoryEmotionalDetail':
            return {
                prompt: isHe
                    ? 'כדי להגיע לעומק הטמעה מרבי: איזו תחושה או רגש הרגשת בגוף ברגע הזה?'
                    : 'For maximum neural depth: what physical sensation or feeling did you notice in that moment?',
                chips: isHe
                    ? ['הרגשתי הקלה ושקט בלב', 'עלה לי חיוך ורוגע נעים', 'נשימה עמוקה ותחושת חום']
                    : ['I felt relief and quiet warmth', 'A calm smile and light heart', 'A deep breath and warm peace'],
            };
        case 'causalAgency':
            return {
                prompt: isHe
                    ? 'כדי שהמוח יזכור את המסוגלות שלך: איזו בחירה קטנה שלך איפשרה לזה לקרות?'
                    : 'To anchor self-agency: what small choice or step of yours helped make this happen?',
                chips: isHe
                    ? ['בחרתי לעצור ולהיעזר בפתיחות', 'הסכמתי לפנות מקום ולהקשיב', 'יזמתי צעד קטן שעשה הבדל']
                    : ['I chose to ask openly for support', 'I paused and decided to listen closely', 'I initiated a small helpful step'],
            };
        case 'interpersonalWarmth':
            return {
                prompt: isHe
                    ? 'להעצמת החיבור האנושי: האם היה אדם נוסף שחלק איתך את הרגע או ראוי לתודה?'
                    : 'To deepen social connection: who shared this moment with you or contributed to it?',
                chips: isHe
                    ? ['עמית או חבר שהיו שם בשבילי', 'הוקרה הדדית שחיזקה את הקשר', 'שיחה טובה עם מישהו קרוב']
                    : ['A colleague or friend who was there', 'Mutual appreciation that strengthened our bond', 'A warm conversation with someone close'],
            };
        case 'authenticity':
            return {
                prompt: isHe
                    ? 'להטמעה אותנטית יותר: איזה עומס, מאמץ או קושי קטן הרגע הזה ריכך?'
                    : 'For deeper authenticity: what effort, stress, or challenge did this moment soften?',
                chips: isHe
                    ? ['למרות שהיום היה עמוס ומורכב', 'אחרי מאמץ וחשש סוף סוף זה הסתדר', 'הרגע הביא אור בתוך יום מאתגר']
                    : ['Even though today felt busy and complex', 'Finally came through after steady effort', 'Brought warmth during a challenging day'],
            };
    }
}

function buildEmpoweringFeedback(
    dims: NeuralDimensions,
    score: number,
    isGenuine: boolean,
    locale: Locale
): string {
    const isHe = locale === 'he';
    if (!isGenuine) {
        return isHe
            ? 'שתף/י עוד כמה מילים על הרגע כדי שנוכל לדייק משוב מעצים עבורך.'
            : 'Share a few more words about the moment so we can reflect back tailored encouragement.';
    }

    const highlightsHe: string[] = [];
    const highlightsEn: string[] = [];

    if (dims.interpersonalWarmth) {
        highlightsHe.push('חיבור אנושי');
        highlightsEn.push('human warmth');
    }
    if (dims.causalAgency) {
        highlightsHe.push('סוכנות אישית ובחירה מודעת');
        highlightsEn.push('personal agency');
    }
    if (dims.sensoryEmotionalDetail) {
        highlightsHe.push('נוכחות רגשית וגופנית');
        highlightsEn.push('emotional and somatic awareness');
    }
    if (dims.specificity) {
        highlightsHe.push('הקשר קונקרטי וברור');
        highlightsEn.push('concrete detail');
    }
    if (dims.authenticity) {
        highlightsHe.push('עומק ואותנטיות');
        highlightsEn.push('grounded authenticity');
    }

    if (isHe) {
        if (score === 5) {
            return 'תיעוד עוצמתי במיוחד! הפעלת את כל 5 מסלולי ההטמעה (ספציפיות, סוכנות, רגש, חיבור אנושי ואותנטיות) — כך נוצרת נוירופלסטיות חיובית עמוקה.';
        }
        const activeStr = highlightsHe.slice(0, 2).join(' ו');
        return activeStr
            ? `רגע נהדר שמפעיל יפה ${activeStr}. עצם העצירה לתעד אותו מחזקת את מסלולי הרוגע והביטחון שלך.`
            : 'תיעוד אמיתי ומבורך. העצירה לשים לב למה שעבד טוב היום כבר מתחילה לווסת מתח ולהעמיק שקט פנימי.';
    }

    if (score === 5) {
        return 'Exceptional depth! All 5 neural encoding dimensions are active — building durable positive neuroplasticity.';
    }
    const activeEn = highlightsEn.slice(0, 2).join(' and ');
    return activeEn
        ? `A meaningful entry activating ${activeEn}. Pausing to capture this reinforces calm and self-efficacy.`
        : 'Genuine moment noted. Taking a quiet pause to name what went well already begins shifting stress downward.';
}

export const NeuralRubricEngine = {
    evaluate(q1: string, q2: string, locale: Locale = 'he'): NeuralEvaluationResult {
        const cleanQ1 = (q1 || '').trim();
        const cleanQ2 = (q2 || '').trim();
        const combined = `${cleanQ1} ${cleanQ2}`.trim();

        const genuine = !isRepeatedGarbage(cleanQ1);
        const wordsQ1 = countWords(cleanQ1);

        const specificity =
            genuine &&
            (wordsQ1 >= 7 ||
                containsAny(cleanQ1, SPECIFICITY_MARKERS_HE) ||
                containsAny(cleanQ1, SPECIFICITY_MARKERS_EN));

        const causalAgency =
            genuine &&
            (cleanQ2.length > 0 ||
                containsAny(cleanQ1, AGENCY_MARKERS_HE) ||
                containsAny(cleanQ1, AGENCY_MARKERS_EN));

        const interpersonalWarmth =
            genuine &&
            (containsAny(combined, INTERPERSONAL_MARKERS_HE) ||
                containsAny(combined, INTERPERSONAL_MARKERS_EN));

        const sensoryEmotionalDetail =
            genuine &&
            (containsAny(combined, SENSORY_MARKERS_HE) ||
                containsAny(combined, SENSORY_MARKERS_EN));

        const authenticity =
            genuine &&
            (wordsQ1 >= 12 ||
                containsAny(cleanQ1, AUTHENTICITY_MARKERS_HE) ||
                containsAny(cleanQ1, AUTHENTICITY_MARKERS_EN));

        const dimensions: NeuralDimensions = {
            specificity,
            causalAgency,
            interpersonalWarmth,
            sensoryEmotionalDetail,
            authenticity,
        };

        const rawScore = Object.values(dimensions).filter(Boolean).length;
        const score = genuine ? Math.max(1, rawScore) : 0;

        const missingDimensionKey =
            DIMENSION_PRIORITY.find((key) => !dimensions[key]) || null;

        const { prompt: upgradePrompt, chips: upgradeChips } = getUpgradeData(
            missingDimensionKey,
            locale
        );

        const empoweringFeedback = buildEmpoweringFeedback(
            dimensions,
            score,
            genuine,
            locale
        );

        const snippet = buildSnippet(cleanQ1);
        const whatsappDraft =
            locale === 'he'
                ? `היי 🙏 בדיוק עצרתי לסכם לעצמי רגעים טובים מהיום ביומן ההודיה שלי, ועלה לי חיוך כשחשבתי על הרגע הזה איתך: "${snippet}". רציתי פשוט להגיד תודה מעומק הלב! ✨`
                : `Hey 🙏 I just paused to journal good moments from today, and smiled thinking about this moment with you: "${snippet}". Just wanted to say a heartfelt thank you! ✨`;

        return {
            isGenuineAppreciation: genuine,
            dimensions,
            score,
            missingDimensionKey,
            empoweringFeedback,
            upgradePrompt,
            upgradeChips,
            whatsappDraft,
        };
    },
};
