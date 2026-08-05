import { NextResponse } from "next/server";
import { buildParagraphs } from "@/data/chapters";
import { readableById } from "@/data/library";
import { BASE_LANG, isLangCode } from "@/lib/languages";
import { realChapter } from "@/lib/texts";

/**
 * One chapter's prose. The reader fetches this when the reader changes chapter,
 * so a 200k-word book never has to cross the wire in one go.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const n = Number(searchParams.get("n"));
  const lang = searchParams.get("lang") ?? BASE_LANG;

  if (!readableById(id) || !Number.isInteger(n) || n < 0 || !isLangCode(lang)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const real = realChapter(id, n, lang);
  if (real) return NextResponse.json({ paragraphs: real, real: true });

  // A translation that stops short is a missing chapter, not a cue to invent
  // prose — only the base language falls back to the placeholder generator.
  if (lang !== BASE_LANG) {
    return NextResponse.json({ error: "no such chapter" }, { status: 404 });
  }

  // No ingested text for this work yet — fall back to the placeholder prose.
  return NextResponse.json({
    paragraphs: buildParagraphs(`${id}:${n}`),
    real: false,
  });
}
