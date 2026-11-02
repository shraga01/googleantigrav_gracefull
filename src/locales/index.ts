import { he } from './he';
import { en } from './en';
import type { Locale } from '../types';

export const dictionaries = {
    he,
    en,
};

export type Dictionary = typeof he;

export function getDictionary(locale: Locale): Dictionary {
    return dictionaries[locale] || dictionaries.en;
}
