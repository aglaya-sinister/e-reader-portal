import type { ReactNode } from "react";

/**
 * Render Project Gutenberg's plain-text conventions as formatting, at display
 * time — the stored text stays faithful to the source and every work benefits
 * without re-ingesting.
 *
 * Two conventions mark the same thing, and editions differ on which they use:
 *   _like this_   italics (An Ideal Husband, Lady Windermere's Fan)
 *   [like this]   italics (The Importance of Being Earnest)
 *
 * In a play both carry the stage directions, so both must render as emphasis.
 * Flattening either one to plain text loses the distinction between what a
 * character says and what they do.
 *
 * Brackets that point at something absent are the exception — those are
 * dropped outright rather than emphasised.
 */
function dropAbsentMarkers(text: string): string {
  return (
    text
      // A picture the text file does not contain.
      .replace(/\[\s*(illustration|transcriber(?:'s)? note)[^\]]*\]/gi, "")
      // Footnote markers with no footnote to reach.
      .replace(/\[\s*(?:\d{1,3}|[A-Za-z]|[*†‡])\s*\]/g, "")
      // Tidy the gaps the removals leave behind.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim()
  );
}

/** Remove any leftover markup characters from a plain run. */
const strip = (s: string) => s.replace(/[_[\]]/g, "");

export function withEmphasis(raw: string): ReactNode[] {
  const text = dropAbsentMarkers(raw);
  const out: ReactNode[] = [];

  // Either convention, whichever comes first. Some editions nest them —
  // [_Goes out._] — so the captured run is stripped before rendering.
  const re = /_([^_\n]{1,400})_|\[([^\]\n]{1,400})\]/g;

  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(strip(text.slice(last, m.index)));
    const inner = strip(m[1] ?? m[2] ?? "");
    if (inner) out.push(<em key={key++}>{inner}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(strip(text.slice(last)));

  return out;
}
