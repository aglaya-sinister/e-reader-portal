import fs from "node:fs";
import path from "node:path";
import type { ChapterMeta } from "@/data/chapters";
import { BASE_LANG, isLangCode, langCodes, sortLangs, type LangCode } from "./languages";

/**
 * Real public-domain texts ingested from Project Gutenberg into content/texts.
 * Server-only: these files are megabytes and must never reach the client whole.
 *
 * English is `{id}.json`; other languages are `{id}.{lang}.json`. Editions are
 * independent — a French original and its English translation rarely divide
 * into the same chapters — so chapter lists are always read per language.
 */

export type StoredChapter = {
  label: string;
  title?: string;
  paragraphs: string[];
};

type StoredText = {
  id: string;
  lang?: LangCode;
  gutenbergId: number;
  source: string;
  /** Set when the edition was assembled from several Gutenberg volumes. */
  sources?: { gutenbergId: number; url: string }[];
  chapters: StoredChapter[];
};

const DIR = path.join(process.cwd(), "content", "texts");

const cache = new Map<string, { mtimeMs: number; text: StoredText }>();

function fileFor(id: string, lang: LangCode) {
  return path.join(DIR, lang === BASE_LANG ? `${id}.json` : `${id}.${lang}.json`);
}

function load(id: string, lang: LangCode = BASE_LANG): StoredText | null {
  // `id` reaches this from a route param, so keep it to a plain slug. `lang` is
  // checked too, since it also lands in a filename.
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  if (!isLangCode(lang)) return null;

  const file = fileFor(id, lang);

  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return null; // no text for this work in this language
  }

  // Key the cache on the file's mtime, so a corrected text is picked up without
  // restarting. Caching the parse indefinitely means re-ingesting has no effect
  // on a running server; caching misses would hide newly added texts entirely.
  const key = `${id}:${lang}`;
  const hit = cache.get(key);
  if (hit && hit.mtimeMs === mtimeMs) return hit.text;

  try {
    const text = JSON.parse(fs.readFileSync(file, "utf8")) as StoredText;
    cache.set(key, { mtimeMs, text });
    return text;
  } catch {
    return null;
  }
}

export function hasRealText(id: string, lang: LangCode = BASE_LANG) {
  return load(id, lang) !== null;
}

/**
 * Whether an edition exists, without reading it.
 *
 * Deliberately not `load()`: that parses the file and holds it in the cache,
 * and the build asks this question for every language of every work. Going
 * through the parser meant tens of megabytes of JSON read and retained just to
 * decide whether to draw a two-button switcher, which killed the worker
 * generating the reader's static paths.
 */
function hasEdition(id: string, lang: LangCode) {
  if (!/^[a-z0-9-]+$/.test(id) || !isLangCode(lang)) return false;
  return fs.existsSync(fileFor(id, lang));
}

/**
 * Every language this work can actually be read in. A work with only the base
 * text returns `["en"]`, and the reader hides the switcher for those.
 */
export function availableLanguages(id: string): LangCode[] {
  const found = (langCodes as LangCode[]).filter((lang) => hasEdition(id, lang));
  return sortLangs(found);
}

export function textSource(id: string, lang: LangCode = BASE_LANG) {
  const t = load(id, lang);
  if (!t) return null;
  return {
    gutenbergId: t.gutenbergId,
    url: t.source,
    // Multi-volume editions credit every volume they were built from.
    volumes: t.sources?.map((s) => s.gutenbergId) ?? null,
  };
}

/** Chapter list without the prose — safe to send to the client. */
export function realChapterMeta(
  id: string,
  lang: LangCode = BASE_LANG,
): ChapterMeta[] | null {
  const t = load(id, lang);
  if (!t) return null;
  return t.chapters.map((c, index) => ({
    index,
    label: c.label,
    title: c.title,
    wordCount: c.paragraphs.reduce((n, p) => n + p.split(/\s+/).length, 0),
  }));
}

/** One chapter's prose. */
export function realChapter(
  id: string,
  index: number,
  lang: LangCode = BASE_LANG,
): string[] | null {
  const t = load(id, lang);
  if (!t) return null;
  return t.chapters[index]?.paragraphs ?? null;
}
