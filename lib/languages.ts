/**
 * The languages a work can be read in. Safe to import from client components —
 * unlike lib/texts.ts, there is nothing here but labels.
 *
 * English is the base: it lives in `content/texts/{id}.json`. Every other
 * language is a sibling file, `content/texts/{id}.{code}.json`.
 */

export const LANGUAGES = [
  { code: "en", short: "EN", label: "English", endonym: "English" },
  { code: "fr", short: "FR", label: "French", endonym: "Français" },
  { code: "ru", short: "RU", label: "Russian", endonym: "Русский" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export const BASE_LANG: LangCode = "en";

export const langCodes = LANGUAGES.map((l) => l.code);

export function isLangCode(value: string): value is LangCode {
  return (langCodes as string[]).includes(value);
}

export function languageLabel(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code)!;
}

/** Order a set of codes the way LANGUAGES lists them, so EN always comes first. */
export function sortLangs(codes: LangCode[]): LangCode[] {
  return langCodes.filter((c) => codes.includes(c));
}
