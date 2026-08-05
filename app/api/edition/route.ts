import { NextResponse } from "next/server";
import { readableById } from "@/data/library";
import { isLangCode } from "@/lib/languages";
import { realChapter, realChapterMeta, textSource } from "@/lib/texts";

/**
 * A whole edition's shape in one call: the chapter list, plus the prose of the
 * chapter being landed on.
 *
 * Switching language is not the same as switching chapter — a French original
 * and its English translation divide differently, so the reader cannot keep the
 * chapter list it already has. Returning both together means the swap happens
 * in a single round trip rather than flashing an empty page between two.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const lang = searchParams.get("lang") ?? "";
  const n = Number(searchParams.get("n") ?? 0);

  if (!readableById(id) || !isLangCode(lang) || !Number.isInteger(n) || n < 0) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const chapters = realChapterMeta(id, lang);
  if (!chapters) {
    return NextResponse.json({ error: "no such edition" }, { status: 404 });
  }

  // Editions differ in length, so the chapter the reader was on may not exist
  // here. Land on the last one rather than failing the switch.
  const index = Math.min(n, chapters.length - 1);

  return NextResponse.json({
    chapters,
    index,
    paragraphs: realChapter(id, index, lang) ?? [],
    source: textSource(id, lang),
  });
}
