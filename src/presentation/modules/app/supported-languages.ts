export const SUPPORTED_LANGUAGES = ['en', 'pl', 'fr', 'es', 'de', 'zh'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const MATERIAL_DATE_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  zh: 'zh-CN',
};

export function normalizeLanguage(language: string | null | undefined): SupportedLanguage {
  const baseLanguage = language?.toLowerCase().split(/[-_]/)[0];

  return SUPPORTED_LANGUAGES.includes(baseLanguage as SupportedLanguage)
    ? baseLanguage as SupportedLanguage
    : 'en';
}

export function getConfiguredLanguage(
  storedLanguage: string | null | undefined,
  browserLanguage: string | null | undefined
): SupportedLanguage {
  return normalizeLanguage(storedLanguage ?? browserLanguage);
}

export function getMaterialDateLocale(language: string | null | undefined): string {
  return MATERIAL_DATE_LOCALES[normalizeLanguage(language)];
}
