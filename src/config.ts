import process from 'node:process';


export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];