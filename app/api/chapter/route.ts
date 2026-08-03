import { NextResponse } from "next/server";
import { buildParagraphs } from "@/data/chapters";
import { readableById } from "@/data/library";
import { realChapter } from "@/lib/texts";

/**
 * One chapter's prose. The reader fetches this when the reader changes chapter,
 * so a 200k-word book never has to cross the wire in one go.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const n = Number(searchParams.get("n"));

  if (!readableById(id) || !Number.isInteger(n) || n < 0) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const real = realChapter(id, n);
  if (real) return NextResponse.json({ paragraphs: real, real: true });

  // No ingested text for this work yet — fall back to the placeholder prose.
  return NextResponse.json({
    paragraphs: buildParagraphs(`${id}:${n}`),
    real: false,
  });
}
