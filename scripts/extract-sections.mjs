/**
 * Extract individual stories from a Gutenberg collection.
 *
 * Rather than guessing where each story ends, split the whole volume with the
 * normal chapter splitter — which already drops the table of contents and finds
 * section boundaries — then pick the section whose heading matches the story.
 */
import fs from "node:fs";
import path from "node:path";
import { splitChapters, stripBoilerplate } from "./split.mjs";

const OUT = path.resolve(import.meta.dirname, "..", "content", "texts");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ACCENTS = "àáâãäåèéêëìíîïòóôõöùúûüñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÇ";
const PLAIN = "aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC";
/** Comparable key: letters only, accents folded, lower case. */
const key = (s) =>
  (s || "")
    .replace(/./g, (ch) => {
      const i = ACCENTS.indexOf(ch);
      return i === -1 ? ch : PLAIN[i];
    })
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const cache = new Map();

async function getCollection(title, author) {
  const ck = `${title}|${author}`;
  if (cache.has(ck)) return cache.get(ck);

  const res = await fetch(
    `https://gutendex.com/books/?search=${encodeURIComponent(title + " " + author)}`,
    { headers: { "User-Agent": UA } },
  );
  let out = null;
  if (res.ok) {
    const { results = [] } = await res.json();
    const surname = key(author.split(/\s+/).pop());
    for (const b of results) {
      if (!b.authors.some((a) => key(a.name).includes(surname))) continue;
      const fk = Object.keys(b.formats).find(
        (k) => k.startsWith("text/plain") && !k.includes("zip"),
      );
      if (!fk) continue;
      await sleep(300);
      const r = await fetch(b.formats[fk], { headers: { "User-Agent": UA } });
      if (!r.ok) continue;
      const text = stripBoilerplate(await r.text());
      if (text.length < 30000) continue;
      const split = splitChapters(text);
      out = { id: b.id, title: b.title, chapters: split ? split.chapters : [] };
      break;
    }
  }
  cache.set(ck, out);
  return out;
}

const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const results = [];

for (const job of jobs) {
  await sleep(500);
  const coll = await getCollection(job.collection, job.author);
  if (!coll) {
    results.push({ id: job.id, status: "COLLECTION NOT FOUND" });
    continue;
  }

  const wanted = job.stories.map(key);
  const picked = [];
  for (const w of wanted) {
    // Match against the section heading, or the label when the splitter used
    // the title as the label itself.
    const hit = coll.chapters.find(
      (c) => key(c.title) === w || key(c.label) === w,
    );
    if (hit) picked.push(hit);
  }

  if (picked.length !== job.stories.length) {
    const found = coll.chapters.map((c) => c.title || c.label).slice(0, 40);
    results.push({
      id: job.id,
      status: `NO SECTION (#${coll.id}, ${coll.chapters.length} sections)`,
      sample: found,
    });
    continue;
  }

  const chapters = picked.map((c, i) => ({
    label: job.stories.length > 1 ? `${job.unit ?? "Part"} ${i + 1}` : "Text",
    title: job.stories.length > 1 ? job.stories[i] : undefined,
    paragraphs: c.paragraphs,
  }));

  const words = chapters.reduce(
    (n, c) => n + c.paragraphs.join(" ").split(/\s+/).length,
    0,
  );

  fs.writeFileSync(
    path.join(OUT, `${job.id}.json`),
    JSON.stringify({
      id: job.id,
      gutenbergId: coll.id,
      source: `https://www.gutenberg.org/ebooks/${coll.id}`,
      chapters,
    }),
  );
  results.push({ id: job.id, status: "OK", words, gid: coll.id, parts: chapters.length });
}

for (const r of results) {
  if (r.status === "OK") {
    console.log(`OK   ${r.id.padEnd(46)} ${r.parts}p ${String(r.words).padStart(6)} words  #${r.gid}`);
  } else {
    console.log(`FAIL ${r.id.padEnd(46)} ${r.status}`);
    if (r.sample) console.log(`       sections: ${r.sample.slice(0, 12).join(" | ")}`);
  }
}
