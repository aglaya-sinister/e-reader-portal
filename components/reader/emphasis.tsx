import type { ReactNode } from "react";

/**
 * Clean up Project Gutenberg's plain-text conventions at render time, so the
 * stored text stays faithful to the source and every work benefits at once.
 *
 * Brackets carry three different things, and they are not equivalent:
 *   [Illustration: …]  a picture we do not have          -> drop entirely
 *   [12] [A] [*]       footnote markers with no footnote -> drop entirely
 *   [Enter Lord Goring] stage directions, editorial gloss -> keep, unbracket
 */
export function cleanSourceMarkup(text: string): string {
  return (
    text
      // Whole blocks that refer to something absent.
      .replace(/\[\s*(illustration|transcriber(?:'s)? note)[^\]]*\]/gi, "")
      // Footnote references: a number, a single letter, or a symbol.
      .replace(/\[\s*(?:\d{1,3}|[A-Za-z]|[*†‡])\s*\]/g, "")
      // Anything else keeps its words but loses the brackets.
      .replace(/[[\]]/g, "")
      // Tidy the spacing the removals leave behind.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim()
  );
}

/**
 * Gutenberg marks italics with underscores: _like this_. In a play, where every
 * stage direction is italicised, that leaves the text littered with them — so
 * render the emphasis instead of showing the markup. Unpaired underscores are
 * dropped rather than displayed.
 */
export function withEmphasis(raw: string): ReactNode[] {
  const text = cleanSourceMarkup(raw);
  const out: ReactNode[] = [];
  const re = /_([^_\n]{1,400})_/g;

  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(strip(text.slice(last, m.index)));
    out.push(<em key={key++}>{m[1]}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(strip(text.slice(last)));

  return out;
}

const strip = (s: string) => s.replace(/_/g, "");
