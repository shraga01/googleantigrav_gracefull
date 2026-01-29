/**
 * Scientific Facts Service
 * Curated scientific facts about gratitude from research literature
 * All facts include citations and are available in English and Hebrew
 */

export interface ScientificFact {
    id: string;
    statement: {
        en: string;
        he: string;
    };
    citation: string;
    category: 'neural' | 'health' | 'mental' | 'practice' | 'physiology';
}

const SCIENTIFIC_FACTS: ScientificFact[] = [
    {
        id: 'amygdala-reactivity',
        statement: {
            en: 'Gratitude practice measurably reduces amygdala reactivity to negative stimuli, lowering your baseline fight-or-flight response.',
            he: 'תרגול הכרת תודה מפחית באופן מדיד את התגובתיות של האמיגדלה לגירויים שליליים, ומוריד את רמת ההיענות הבסיסית של תגובת הלחימה או הבריחה.'
        },
        citation: 'Hazlett et al., 2021',
        category: 'neural'
    },
    {
        id: 'gray-matter',
        statement: {
            en: 'Long-term gratitude practice increases gray matter density in brain regions linked to emotional resilience and empathy.',
            he: 'תרגול ארוך טווח של הכרת תודה מגדיל את צפיפות החומר האפור באזורי המוח הקשורים לחוסן רגשי ואמפתיה.'
        },
        citation: 'Fox et al., 2015',
        category: 'neural'
    },
    {
        id: 'heart-rate-variability',
        statement: {
            en: 'Gratitude journaling enhances Heart Rate Variability (HRV), reducing mechanical strain on the heart and lowering mortality risk in cardiac patients.',
            he: 'כתיבת יומן הכרת תודה משפרת את שונות קצב הלב (HRV), מפחיתה את העומס המכני על הלב ומורידה את סיכון התמותה בחולי לב.'
        },
        citation: 'Redwine et al., 2016',
        category: 'health'
    },
    {
        id: 'burnout-reduction',
        statement: {
            en: 'The "Three Good Things" protocol results in a 22% reduction in burnout and a 40% drop in depression symptoms.',
            he: 'פרוטוקול "שלושה דברים טובים" מביא להפחתה של 22% בשחיקה ולירידה של 40% בתסמיני דיכאון.'
        },
        citation: 'Seligman et al., 2005',
        category: 'mental'
    },
    {
        id: 'dopamine-serotonin',
        statement: {
            en: 'Gratitude activates natural reward pathways, releasing dopamine and serotonin—your brain\'s built-in mood stabilizers.',
            he: 'הכרת תודה מפעילה מסלולי תגמול טבעיים, ומשחררת דופמין וסרוטונין - מייצבי מצב הרוח המובנים במוח שלך.'
        },
        citation: 'Karns et al., 2017',
        category: 'neural'
    },
    {
        id: 'optimal-frequency',
        statement: {
            en: 'Research shows 1–3 times per week is optimal for gratitude practice. Daily practice can lead to "gratitude fatigue" or emotional numbness.',
            he: 'מחקרים מראים כי 1-3 פעמים בשבוע הוא התדירות האופטימלית לתרגול הכרת תודה. תרגול יומיומי עלול להוביל ל"עייפות מהכרת תודה" או קהות רגשית.'
        },
        citation: 'Lyubomirsky et al., 2005',
        category: 'practice'
    },
    {
        id: 'inflammation-reduction',
        statement: {
            en: 'Consistent gratitude practice lowers inflammatory markers (IL-6, CRP) in the bloodstream, reducing chronic inflammation.',
            he: 'תרגול עקבי של הכרת תודה מפחית את סמני הדלקת (IL-6, CRP) במחזור הדם, ומפחית דלקת כרונית.'
        },
        citation: 'Hazlett et al., 2021',
        category: 'physiology'
    },
    {
        id: 'sleep-improvement',
        statement: {
            en: 'Gratitude reduces pre-sleep worry and rumination, helping you fall asleep faster and improving sleep depth.',
            he: 'הכרת תודה מפחיתה דאגה והרהורים לפני השינה, עוזרת לך להירדם מהר יותר ומשפרת את עומק השינה.'
        },
        citation: 'Jackowska et al., 2016',
        category: 'health'
    },
    {
        id: 'neural-pure-altruism',
        statement: {
            en: 'Gratitude practice increases the brain\'s reward response when witnessing gains for others, cultivating "neural pure altruism."',
            he: 'תרגול הכרת תודה מגביר את תגובת התגמול של המוח כאשר אתה עד להישגים של אחרים, ומטפח "אלטרואיזם נוירלי טהור".'
        },
        citation: 'Karns et al., 2017',
        category: 'neural'
    },
    {
        id: 'anxiety-depression-meta',
        statement: {
            en: 'Meta-analyses show gratitude interventions result in a 7.76% reduction in anxiety and 6.89% reduction in depression scores.',
            he: 'מטה-אנליזות מראות כי התערבויות של הכרת תודה מביאות להפחתה של 7.76% בחרדה ו-6.89% בציוני דיכאון.'
        },
        citation: 'Diniz et al., 2023',
        category: 'mental'
    },
    {
        id: 'neuroplasticity',
        statement: {
            en: 'Just three weeks of gratitude practice strengthens connections between the prefrontal cortex and limbic system, enhancing emotional regulation.',
            he: 'רק שלושה שבועות של תרגול הכרת תודה מחזקים את הקשרים בין הקורטקס הפרה-פרונטלי למערכת הלימבית, ומשפרים את הוויסות הרגשי.'
        },
        citation: 'Fox et al., 2015',
        category: 'neural'
    },
    {
        id: 'specificity-matters',
        statement: {
            en: 'Specific gratitude (e.g., "mom drove 40 minutes to bring me soup") triggers stronger neural activation than generic gratitude (e.g., "I\'m grateful for my mom").',
            he: 'הכרת תודה ספציפית (לדוגמה, "אמא נסעה 40 דקות כדי להביא לי מרק") מעוררת הפעלה נוירלית חזקה יותר מהכרת תודה כללית (לדוגמה, "אני אסיר תודה על אמא שלי").'
        },
        citation: 'Greater Good Science Center',
        category: 'practice'
    },
    {
        id: 'persistent-sensitivity',
        statement: {
            en: 'Brain changes from gratitude practice can persist for up to 3 months after stopping, creating a "muscle memory" for positivity.',
            he: 'שינויים במוח מתרגול הכרת תודה יכולים להימשך עד 3 חודשים לאחר ההפסקה, ויוצרים "זיכרון שרירי" לחיוביות.'
        },
        citation: 'Kini et al., 2016',
        category: 'neural'
    },
    {
        id: 'cortisol-regulation',
        statement: {
            en: 'Gratitude actively downregulates the stress response system (HPA axis), significantly reducing cortisol levels in the bloodstream.',
            he: 'הכרת תודה מפחיתה באופן פעיל את מערכת התגובה ללחץ (ציר HPA), ומורידה משמעותית את רמות הקורטיזול במחזור הדם.'
        },
        citation: 'Hazlett et al., 2021',
        category: 'physiology'
    },
    {
        id: 'gratitude-visit',
        statement: {
            en: 'Writing a gratitude letter and reading it aloud to someone produces the single largest "happiness spike" in positive psychology research.',
            he: 'כתיבת מכתב הכרת תודה וקריאתו בקול רם למישהו מייצרת את "קפיצת האושר" הגדולה ביותר במחקר הפסיכולוגיה החיובית.'
        },
        citation: 'Seligman et al., 2005',
        category: 'practice'
    }
];

/**
 * Get a random scientific fact
 * @param language - User's preferred language ('english' or 'hebrew')
 * @returns A random scientific fact with statement and citation
 */
export function getRandomScientificFact(language: 'english' | 'hebrew' = 'english'): {
    statement: string;
    citation: string;
    category: string;
} {
    const randomIndex = Math.floor(Math.random() * SCIENTIFIC_FACTS.length);
    const fact = SCIENTIFIC_FACTS[randomIndex];

    return {
        statement: language === 'hebrew' ? fact.statement.he : fact.statement.en,
        citation: fact.citation,
        category: fact.category
    };
}

/**
 * Get all facts for a specific category
 */
export function getFactsByCategory(
    category: ScientificFact['category'],
    language: 'english' | 'hebrew' = 'english'
): Array<{ statement: string; citation: string }> {
    return SCIENTIFIC_FACTS
        .filter(fact => fact.category === category)
        .map(fact => ({
            statement: language === 'hebrew' ? fact.statement.he : fact.statement.en,
            citation: fact.citation
        }));
}

/**
 * Get total number of available facts
 */
export function getFactCount(): number {
    return SCIENTIFIC_FACTS.length;
}
