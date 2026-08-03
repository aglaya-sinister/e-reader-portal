import fs from "node:fs";
import path from "node:path";
import type { ChapterMeta } from "@/data/chapters";

/**
 * Real public-domain texts ingested from Project Gutenberg into content/texts.
 * Server-only: these files are megabytes and must never reach the client whole.
 */

export type StoredChapter = {
  label: string;
  title?: string;
  paragraphs: string[];
};

type StoredText = {
  id: string;
  gutenbergId: number;
  source: string;
  chapters: StoredChapter[];
};

const DIR = path.join(process.cwd(), "content", "texts");

const cache = new Map<string, { mtimeMs: number; text: StoredText }>();

function load(id: string): StoredText | null {
  // `id` reaches this from a route param, so keep it to a plain slug.
  if (!/^[a-z0-9-]+$/.test(id)) return null;

  const file = path.join(DIR, `${id}.json`);

  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return null; // no text for this work
  }

  // Key the cache on the file's mtime, so a corrected text is picked up without
  // restarting. Caching the parse indefinitely means re-ingesting has no effect
  // on a running server; caching misses would hide newly added texts entirely.
  const hit = cache.get(id);
  if (hit && hit.mtimeMs === mtimeMs) return hit.text;

  try {
    const text = JSON.parse(fs.readFileSync(file, "utf8")) as StoredText;
    cache.set(id, { mtimeMs, text });
    return text;
  } catch {
    return null;
  }
}

export function hasRealText(id: string) {
  return load(id) !== null;
}

export function textSource(id: string) {
  const t = load(id);
  return t ? { gutenbergId: t.gutenbergId, url: t.source } : null;
}

/** Chapter list without the prose — safe to send to the client. */
export function realChapterMeta(id: string): ChapterMeta[] | null {
  const t = load(id);
  if (!t) return null;
  return t.chapters.map((c, index) => ({
    index,
    label: c.label,
    title: c.title,
    wordCount: c.paragraphs.reduce((n, p) => n + p.split(/\s+/).length, 0),
  }));
}

/** One chapter's prose. */
export function realChapter(id: string, index: number): string[] | null {
  const t = load(id);
  if (!t) return null;
  return t.chapters[index]?.paragraphs ?? null;
}
