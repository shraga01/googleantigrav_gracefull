export interface ProfileQuestion {
    id: string;
    key: string;
    en: string;
    he: string;
}

// Only 3 basic questions for onboarding
export const ONBOARDING_QUESTIONS: ProfileQuestion[] = [
    { id: 'name', key: 'name', en: 'What is your name?', he: 'מה שמך?' },
    { id: 'gender', key: 'gender', en: 'Gender (optional)', he: 'מגדר (אופציונלי)' },
    { id: 'familyStatus', key: 'familyStatus', en: 'What is your family status?', he: 'מה מצב המשפחה שלך?' },
];

// Additional questions that will appear randomly during daily practice
export const ADDITIONAL_PROFILE_QUESTIONS: ProfileQuestion[] = [
    { id: 'career', key: 'career', en: 'What do you do for work?', he: 'במה אתה עוסק?' },
    { id: 'living', key: 'livingSituation', en: 'What is your living situation?', he: 'מה מצב המגורים שלך?' },
    { id: 'joys', key: 'joys', en: 'What brings you joy?', he: 'מה משמח אותך?' },
    { id: 'challenges', key: 'challenges', en: 'What challenges are you facing?', he: 'עם אילו אתגרים אתה מתמודד?' },
    { id: 'dreams', key: 'dreams', en: 'What are your dreams and aspirations?', he: 'מה החלומות והשאיפות שלך?' },
    { id: 'goals', key: 'goals', en: 'What are your current goals?', he: 'מה המטרות הנוכחיות שלך?' },
];
