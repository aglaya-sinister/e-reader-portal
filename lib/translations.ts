import fs from "node:fs";
import path from "node:path";

/**
 * Fresh translations made from the original language, offered alongside the
 * historical English translation rather than replacing it.
 *
 * Only works whose original is public domain belong here, and the translation
 * must be made from that original — reworking an existing English translation
 * produces a derivative of the translator's choices, not a translation.
 *
 * Translations may be partial: any chapter present here gets a toggle, the
 * rest fall back to the historical text.
 */

export type TranslatedChapter = {
  title?: string;
  paragraphs: string[];
};

type StoredTranslation = {
  id: string;
  translator: string;
  sourceLanguage: string;
  source: { gutenbergId?: number; title: string };
  /** Keyed by chapter index, as a string. */
  chapters: Record<string, TranslatedChapter>;
};

const DIR = path.join(process.cwd(), "content", "translations");

const cache = new Map<string, { mtimeMs: number; data: StoredTranslation }>();

function load(id: string): StoredTranslation | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const file = path.join(DIR, `${id}.json`);

  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }

  const hit = cache.get(id);
  if (hit && hit.mtimeMs === mtimeMs) return hit.data;

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as StoredTranslation;
    cache.set(id, { mtimeMs, data });
    return data;
  } catch {
    return null;
  }
}

export type TranslationInfo = {
  translator: string;
  sourceLanguage: string;
  sourceTitle: string;
  /** Chapter indices that have been translated. */
  chapters: number[];
};

export function translationInfo(id: string): TranslationInfo | null {
  const t = load(id);
  if (!t) return null;
  return {
    translator: t.translator,
    sourceLanguage: t.sourceLanguage,
    sourceTitle: t.source.title,
    chapters: Object.keys(t.chapters)
      .map(Number)
      .filter((n) => Number.isInteger(n))
      .sort((a, b) => a - b),
  };
}

export function translatedChapter(
  id: string,
  index: number,
): TranslatedChapter | null {
  return load(id)?.chapters[String(index)] ?? null;
}
