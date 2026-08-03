// Build an ingest manifest from data/authors.ts.
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.join(import.meta.dirname, "..", "data", "authors.ts"), "utf8");

const titleSlug = (t) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const out = [];
// Split the file into author blocks.
const blocks = src.split(/\n  \{\n    id: "/).slice(1);
for (const block of blocks) {
  const authorId = block.slice(0, block.indexOf('"'));
  const name = block.match(/name: "([^"]+)"/)?.[1];
  if (!name) continue;

  for (const m of block.matchAll(/title: "((?:[^"\\]|\\.)*)"/g)) {
    const title = m[1].replace(/\\"/g, '"');
    // Skip the author's own `name:` line and chapterTitles entries.
    if (title === name) continue;
    const id = `${authorId}--${titleSlug(title)}`;
    if (out.some((o) => o.id === id)) continue;
    out.push({ id, title, author: name });
  }
}

// chapterTitles arrays contain quoted strings too; drop obvious tale titles by
// keeping only entries that appear as `{ title: "…", year:` pairs.
const valid = new Set(
  [...src.matchAll(/\{\s*\n?\s*title: "((?:[^"\\]|\\.)*)",\s*\n?\s*year:/g)].map(
    (m) => m[1].replace(/\\"/g, '"'),
  ),
);
const filtered = out.filter((o) => valid.has(o.title));

fs.writeFileSync(process.argv[2], JSON.stringify(filtered, null, 1));
console.log(`${filtered.length} works written to manifest`);
console.log(filtered.filter(w => w.id.startsWith("robert-louis")).map(w => "  " + w.title).join("\n"));
