export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', label: 'Português' },
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'pt-BR';

export const isSupportedLanguage = (value: string): value is LanguageCode =>
  SUPPORTED_LANGUAGES.some((l) => l.code === value);
