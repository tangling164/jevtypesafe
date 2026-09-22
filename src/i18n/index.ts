import { en } from './en';
import { zh } from './zh';
export type Locale = 'en' | 'zh';
export const dictionary = (locale: Locale) => locale === 'zh' ? zh : en;
