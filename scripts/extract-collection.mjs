/**
 * Extract individual stories out of a Gutenberg collection.
 *
 * Short fiction usually has no standalone Gutenberg entry — it lives inside the
 * volume it was published in. This finds each story's heading in the collection
 * and slices the text between headings.
 */
import fs from "node:fs";
import path from "node:path";
import { stripBoilerplate, toParagraphs } from "./split.mjs";

const OUT = path.resolve(import.meta.dirname, "..", "content", "texts");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

async function findCollection(title, author) {
  const res = await fetch(
    `https://gutendex.com/books/?search=${encodeURIComponent(title + " " + author)}`,
    { headers: { "User-Agent": UA } },
  );
  if (!res.ok) return null;
  const { results = [] } = await res.json();
  const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const surname = fold(author.split(/\s+/).pop());

  for (const b of results) {
    if (!b.authors.some((a) => fold(a.name).includes(surname))) continue;
    const key = Object.keys(b.formats).find(
      (k) => k.startsWith("text/plain") && !k.includes("zip"),
    );
    if (!key) continue;
    const r = await fetch(b.formats[key], { headers: { "User-Agent": UA } });
    if (!r.ok) continue;
    const text = stripBoilerplate(await r.text());
    if (text.length > 40000) return { id: b.id, title: b.title, text };
    await sleep(400);
  }
  return null;
}

// Length-preserving accent fold, so indices into the folded copy still line up
// with the original text. NFD+strip would shift them.
const ACCENTS = "àáâãäåèéêëìíîïòóôõöùúûüñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÇ";
const PLAIN = "aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC";
const foldKeepLength = (s) =>
  s.replace(/./g, (ch) => {
    const i = ACCENTS.indexOf(ch);
    return i === -1 ? ch : PLAIN[i];
  });

/**
 * Locate a heading by its letters, tolerating case, punctuation and accents.
 * Split on letter runs rather than whitespace so hyphens, apostrophes and
 * colons inside a title ("The Lightning-Rod Man") do not break the match.
 */
function headingIndex(foldedText, title, from = 0) {
  const parts = foldKeepLength(title).match(/[A-Za-z]+/g);
  if (!parts || parts.length === 0) return null;
  const pattern = parts.join("[^A-Za-z\\n]+");
  const re = new RegExp(`^[^A-Za-z\\n]*${pattern}[^A-Za-z\\n]*$`, "gim");
  re.lastIndex = from;
  const m = re.exec(foldedText);
  return m ? { start: m.index, end: m.index + m[0].length } : null;
}

for (const job of jobs) {
  await sleep(600);
  const found = await findCollection(job.collection, job.author);
  if (!found) {
    console.log(`${job.id}: COLLECTION NOT FOUND (${job.collection})`);
    continue;
  }

  // Every story heading in the volume, in document order, so each story can be
  // cut at the next heading rather than running into the following one.
  const siblings = jobs.filter((j) => j.collection === job.collection);
  const allTitles = [
    ...siblings.flatMap((j) => j.stories),
    // Other pieces in the volume, used only as end boundaries. Without them a
    // slice runs to the end of the file and swallows everything after it.
    ...siblings.flatMap((j) => j.boundaries ?? []),
    ...(job.endsBefore ? [job.endsBefore] : []),
  ];

  // Search a folded copy; it is the same length, so offsets map to the original.
  const folded = foldKeepLength(found.text);

  const marks = [];
  const missing = [];
  for (const t of allTitles) {
    const hits = [];
    let cursor = 0;
    for (;;) {
      const hit = headingIndex(folded, t, cursor);
      if (!hit) break;
      hits.push(hit);
      cursor = hit.end;
    }
    if (hits.length === 0) {
      missing.push(t);
      continue;
    }
    // The first hit is usually the contents listing, so prefer the last — but
    // fall back if that leaves nothing worth reading after it.
    const chosen =
      hits.length > 1 && found.text.length - hits[hits.length - 1].end < 400
        ? hits[hits.length - 2]
        : hits[hits.length - 1];
    marks.push({ title: t, ...chosen });
  }
  marks.sort((a, b) => a.start - b.start);

  if (missing.length && job.stories.some((s) => missing.includes(s))) {
    console.log(
      `${job.id}: in #${found.id} "${found.title.slice(0, 40)}" — no heading for ${missing
        .filter((m) => job.stories.includes(m))
        .join(", ")}`,
    );
  }

  const chapters = [];
  for (const story of job.stories) {
    const i = marks.findIndex((m) => m.title === story);
    if (i === -1) {
      console.log(`${job.id}: heading not found — ${story}`);
      continue;
    }
    const end = i + 1 < marks.length ? marks[i + 1].start : found.text.length;
    const body = found.text.slice(marks[i].end, end).trim();
    chapters.push({
      label: `${job.unit ?? "Tale"} ${chapters.length + 1}`,
      title: story,
      paragraphs: toParagraphs(body),
    });
  }

  if (chapters.length !== job.stories.length) {
    console.log(`${job.id}: INCOMPLETE ${chapters.length}/${job.stories.length}`);
    continue;
  }

  fs.writeFileSync(
    path.join(OUT, `${job.id}.json`),
    JSON.stringify({
      id: job.id,
      gutenbergId: found.id,
      source: `https://www.gutenberg.org/ebooks/${found.id}`,
      chapters,
    }),
  );

  const counts = chapters.map((c) => c.paragraphs.join(" ").split(/\s+/).length);
  const words = counts.reduce((a, b) => a + b, 0);

  // A slice that ran past its end boundary shows up as an outlier — this is
  // exactly how the Rajah's Diamond overrun was caught.
  const runaway = chapters
    .map((c, i) => ({ title: c.title, w: counts[i] }))
    .filter((c) => c.w > 25000);

  console.log(
    `OK ${job.id.padEnd(46)} ${chapters.length} parts  ${Math.round(words / 1000)}k words  from #${found.id} (${found.title.slice(0, 34)})`,
  );
  for (const r of runaway) {
    console.log(`   ⚠ ${r.w} words — "${r.title}" probably overran its boundary`);
  }
}
