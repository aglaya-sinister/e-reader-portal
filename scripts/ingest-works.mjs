/**
 * Download public-domain texts from Project Gutenberg and split into chapters.
 *   node ingest2.mjs <manifest.json>
 */
import fs from "node:fs";
import path from "node:path";
import { fold, splitChapters, stripBoilerplate, toParagraphs } from "./split.mjs";

const OUT = path.resolve(import.meta.dirname, "..", "content", "texts");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

async function search(query, tries = 2) {
  for (let i = 0; i < tries; i++) {
    // Trailing slash matters: /books 301-redirects, doubling every request.
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch {
      res = null;
    }
    if (res?.ok) {
      const json = await res.json();
      // An empty result is usually a real absence, not throttling — only a
      // transport failure is worth retrying.
      return json.results || [];
    }
    await sleep(1200 * (i + 1));
  }
  return [];
}

async function findBook(title, author) {
  let results = await search(`${title} ${author}`);
  if (results.length === 0) {
    await sleep(400);
    results = await search(title);
  }

  const surname = fold(author.split(/\s+/).pop());
  const wanted = fold(title).replace(/[^a-z0-9]+/g, " ").trim();

  const scored = results
    // Gutendex also returns audio and alternate-format records; without a
    // plain-text file there is nothing to ingest.
    .filter((b) =>
      Object.keys(b.formats || {}).some((k) => k.startsWith("text/plain")),
    )
    .map((b) => {
      const t = fold(b.title).replace(/[^a-z0-9]+/g, " ").trim();
      // Fold the author too — "Brontë" must match "Bronte".
      const byAuthor = b.authors.some((a) => fold(a.name).includes(surname));
      let score = byAuthor ? 0 : -100;
      if (t === wanted) score += 50;
      else if (t.startsWith(wanted)) score += 30;
      else if (t.includes(wanted)) score += 20;
      if (/\bvol\b|\bvolume\b|complete works|in \d+ volumes/i.test(b.title)) score -= 25;
      score += Math.min(10, (b.download_count || 0) / 5000);
      return { b, score };
    })
    .sort((x, y) => y.score - x.score);

  // Return the ranked shortlist; the caller validates what actually downloads.
  return scored.filter((s) => s.score > -50).slice(0, 4).map((s) => s.b);
}

async function fetchText(gid) {
  for (const url of [
    `https://www.gutenberg.org/cache/epub/${gid}/pg${gid}.txt`,
    `https://www.gutenberg.org/files/${gid}/${gid}-0.txt`,
    `https://www.gutenberg.org/files/${gid}/${gid}.txt`,
  ]) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return { text: await res.text(), url };
    await sleep(300);
  }
  return null;
}

const manifest = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const report = [];

for (const entry of manifest) {
  const { id, title, author, expect } = entry;
  await sleep(250);
  process.stderr.write(`… ${id}\n`); // progress, since the report prints at the end
  try {
    // Minimum plausible size — catalogue records for audio editions expose a
    // stub text file, which downloads fine and contains nothing to read.
    const MIN_CHARS = entry.minChars ?? 15000;

    let gid = entry.gutenbergId;
    let got = null;

    if (gid) {
      got = await fetchText(gid);
    } else {
      const candidates = await findBook(title, author);
      if (candidates.length === 0) {
        report.push({ id, status: "NO MATCH" });
        continue;
      }
      for (const book of candidates) {
        await sleep(400);
        const key = Object.keys(book.formats).find(
          (k) => k.startsWith("text/plain") && !k.includes("zip"),
        );
        let attempt = null;
        if (key) {
          const r = await fetch(book.formats[key], { headers: { "User-Agent": UA } });
          if (r.ok) attempt = { text: await r.text(), url: book.formats[key] };
        }
        if (!attempt) attempt = await fetchText(book.id);
        if (attempt && stripBoilerplate(attempt.text).length >= MIN_CHARS) {
          got = attempt;
          gid = book.id;
          break;
        }
      }
    }

    if (!got) {
      report.push({ id, status: "NO USABLE TEXT", gid });
      continue;
    }

    const text = stripBoilerplate(got.text);
    const picked = splitChapters(text, expect);

    const chapters = picked
      ? picked.chapters
      : [{ label: "Text", paragraphs: toParagraphs(text) }];

    const words = chapters.reduce(
      (n, c) => n + c.paragraphs.join(" ").split(/\s+/).length,
      0,
    );

    fs.writeFileSync(
      path.join(OUT, `${id}.json`),
      JSON.stringify({ id, gutenbergId: gid, source: got.url, chapters }),
    );

    report.push({
      id,
      status:
        expect && chapters.length !== expect
          ? `MISMATCH (${picked?.name ?? "none"})`
          : `OK (${picked?.name ?? "single"})`,
      gid,
      chapters: chapters.length,
      expect,
      words,
    });
  } catch (e) {
    report.push({ id, status: "ERROR " + e.message });
  }
}

for (const r of report) {
  console.log(
    [
      (r.status || "").padEnd(18),
      String(r.id).padEnd(36),
      (r.chapters != null ? `${r.chapters} ch` : "").padEnd(8),
      (r.expect ? `want ${r.expect}` : "").padEnd(9),
      (r.words ? `${(r.words / 1000).toFixed(0)}k w` : "").padEnd(9),
      r.gid ? `#${r.gid}` : "",
    ].join(" "),
  );
}
