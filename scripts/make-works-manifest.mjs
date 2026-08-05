// Build an ingest manifest from data/authors.ts.
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.join(import.meta.dirname, "..", "data", "authors.ts"), "utf8");

const titleSlug = (t) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Every brace-delimited object in a block, innermost content included, found by
 * matching braces rather than by regex — a work entry may be written on one
 * line or spread over ten, and may contain a `chapterTitles` array of its own.
 * String literals are skipped so a brace inside a note cannot unbalance it.
 */
function* objects(block) {
  for (let i = 0; i < block.length; i++) {
    if (block[i] !== "{") continue;
    let depth = 0;
    let quote = null;
    for (let j = i; j < block.length; j++) {
      const ch = block[j];
      if (quote) {
        if (ch === "\\") j++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          yield block.slice(i + 1, j);
          break;
        }
      }
    }
  }
}

const out = [];
// Split the file into author blocks. The newline is matched as \r?\n: a Windows
// checkout with core.autocrlf=true hands this file over with CRLF endings, and
// an \n-only pattern then finds no authors at all and writes an empty manifest.
const blocks = src.split(/\r?\n {2}\{\r?\n {4}id: "/).slice(1);
for (const block of blocks) {
  const authorId = block.slice(0, block.indexOf('"'));
  const name = block.match(/name: "([^"]+)"/)?.[1];
  if (!name) continue;

  // Work objects are taken whole, so a pinned edition stays attached to its
  // own title. Scanning for bare `title:` strings loses which entry they
  // belong to and picks up chapterTitles besides; scanning line by line drops
  // the entries written across several lines.
  for (const body of objects(block)) {
    const m = body.match(/title: "((?:[^"\\]|\\.)*)",\s*\n?\s*year:/);
    if (!m) continue;
    const title = m[1].replace(/\\"/g, '"');
    if (title === name) continue;
    const line = body;

    const id = `${authorId}--${titleSlug(title)}`;
    if (out.some((o) => o.id === id)) continue;

    const entry = { id, title, author: name };

    // Pinned editions, where the work carries them. Anything without falls
    // through to the ingest's title search, as before.
    const one = line.match(/gutenbergId:\s*(\d+)/);
    const many = line.match(/gutenbergIds:\s*\[([\d,\s]+)\]/);
    const slice = line.match(/slice:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/);
    if (many) entry.gutenbergIds = many[1].split(",").map((n) => Number(n.trim()));
    else if (one) entry.gutenbergId = Number(one[1]);
    if (slice) entry.slice = { from: Number(slice[1]), count: Number(slice[2]) };
    const stopAt = line.match(/stopAt:\s*"((?:[^"\\]|\\.)*)"/);
    if (stopAt) entry.stopAt = stopAt[1].replace(/\\"/g, '"');

    out.push(entry);
  }
}

fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.length} works written to manifest`);
const pinned = out.filter((w) => w.gutenbergId || w.gutenbergIds);
console.log(`${pinned.length} with a pinned edition:`);
console.log(pinned.map((w) => `  ${w.id}`).join("\n"));
