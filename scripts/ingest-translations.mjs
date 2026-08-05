/**
 * Download a work in a language other than English and store it beside the
 * base text as `content/texts/<id>.<lang>.json`.
 *
 *   node ingest-translations.mjs manifests/dumas-fr.json
 *
 * Manifest entries pin their Gutenberg IDs rather than searching, because a
 * title search in another language matches far too loosely — "Murat" alone
 * returns a dozen unrelated histories. Several works are only published in
 * volumes; list them all in `gutenbergIds` and they are joined, in order, into
 * one continuous book with its chapters renumbered from one.
 */
import fs from "node:fs";
import path from "node:path";
import { splitChapters, stripBoilerplate, toParagraphs } from "./split.mjs";

const OUT = path.resolve(import.meta.dirname, "..", "content", "texts");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

// Several works are cut from the same joined source (all four Bragelonne
// volumes back a quartet of English titles), so each volume is downloaded once.
const downloads = new Map();

async function fetchText(gid) {
  if (downloads.has(gid)) return downloads.get(gid);
  const result = await download(gid);
  downloads.set(gid, result);
  return result;
}

async function download(gid) {
  for (const url of [
    `https://www.gutenberg.org/cache/epub/${gid}/pg${gid}.txt`,
    `https://www.gutenberg.org/files/${gid}/${gid}-0.txt`,
    `https://www.gutenberg.org/files/${gid}/${gid}.txt`,
  ]) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch {
      res = null;
    }
    if (res?.ok) return { text: await res.text(), url };
    await sleep(300);
  }
  return null;
}

/**
 * Guard against quietly ingesting the English edition under a French filename —
 * Gutenberg IDs are easy to mistype and the result would be invisible until a
 * reader hit the switch. Function words are the cheap reliable signal.
 */
const MARKERS = {
  fr: [/\bqu'il\b/i, /\bc'est\b/i, /\bdans\b/i, /\bétait\b/i, /\bcette\b/i],
  ru: [/[а-яё]{4,}/i],
};

/** What a chapter is called, so the rail is not in English over French prose. */
const CHAPTER_WORD = { fr: "Chapitre", ru: "Глава" };

/**
 * Nineteenth-century French volumes close with the publisher's catalogue — the
 * Monte-Cristo fourth volume carries 231 paragraphs listing everything Dumas
 * wrote. Gutenberg's own markers do not cover it, but the text itself says
 * where the novel stops.
 */
function trimBackMatter(body) {
  const re = /^[ \t]*(FIN|КОНЕЦ)[ \t]*\.?[ \t]*$/gm;
  let last = null;
  let m;
  while ((m = re.exec(body)) !== null) last = m;
  if (!last) return body;

  // Only trust it near the end; "FIN DE LA PREMIÈRE PARTIE" style breaks are
  // excluded by the anchors above, but a stray match should not lose a volume.
  const cut = last.index + last[0].length;
  if (cut < body.length * 0.5) return body;
  return body.slice(0, last.index).trimEnd();
}

function looksLike(text, lang) {
  const markers = MARKERS[lang];
  if (!markers) return true; // unknown language: trust the manifest
  const sample = text.slice(0, 200000);
  return markers.filter((re) => re.test(sample)).length >= Math.min(3, markers.length);
}

const manifest = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const report = [];

for (const entry of manifest) {
  const { id, lang, title, expect } = entry;
  const ids = entry.gutenbergIds ?? [entry.gutenbergId];
  process.stderr.write(`… ${id}.${lang}\n`); // the report prints at the end

  try {
    const volumes = [];
    let failed = null;

    for (const gid of ids) {
      await sleep(400);
      const got = await fetchText(gid);
      if (!got) {
        failed = `NO TEXT #${gid}`;
        break;
      }
      const body = trimBackMatter(stripBoilerplate(got.text));
      if (body.length < 15000) {
        failed = `TOO SHORT #${gid}`;
        break;
      }
      if (!looksLike(body, lang)) {
        failed = `NOT ${lang.toUpperCase()} #${gid}`;
        break;
      }
      volumes.push({ gid, url: got.url, body });
    }

    if (failed) {
      report.push({ id, lang, status: failed });
      continue;
    }

    // Each volume is split on its own; a single split across the join would
    // treat the second title page as prose.
    const opts = {
      numberedTitles: true,
      titleMayEndWithPeriod: true,
      unitLabel: CHAPTER_WORD[lang] ?? "Chapter",
    };
    let chapters = [];
    for (const v of volumes) {
      const picked = splitChapters(
        v.body,
        volumes.length === 1 ? expect : undefined,
        opts,
      );
      chapters.push(
        ...(picked
          ? picked.chapters
          : [{ label: title, paragraphs: toParagraphs(v.body) }]),
      );
    }

    /**
     * Take this work's share of the joined text.
     *
     * The English catalogue publishes Le Vicomte de Bragelonne as four titles,
     * and the French volumes divide in different places, so the boundaries are
     * given here as chapter offsets into the joined novel. They were fixed by
     * matching the opening sentence of each English work against the French —
     * not guessed from the volume breaks, which do not line up. Note the
     * English titles overlap: two of them start from chapter one.
     */
    if (entry.slice) {
      const { from, count } = entry.slice;
      if (from + count > chapters.length) {
        report.push({
          id,
          lang,
          status: `SLICE OVERRUN (${chapters.length} ch)`,
          chapters: chapters.length,
        });
        continue;
      }
      chapters = chapters.slice(from, from + count);
    }

    // Volumes restart their numbering at one, and a slice starts partway
    // through, so either way the labels have to be redone or the rail reads
    // 1,2,3…,1,2,3… — or starts at 140.
    if (volumes.length > 1 || entry.slice) {
      let n = 0;
      chapters = chapters.map((c) => {
        n += 1;
        return { ...c, label: `${opts.unitLabel} ${n}` };
      });
    }

    if (chapters.length === 0) {
      report.push({ id, lang, status: "NO CHAPTERS" });
      continue;
    }

    const words = chapters.reduce(
      (n, c) => n + c.paragraphs.join(" ").split(/\s+/).length,
      0,
    );

    fs.writeFileSync(
      path.join(OUT, `${id}.${lang}.json`),
      JSON.stringify({
        id,
        lang,
        gutenbergId: volumes[0].gid,
        source: volumes[0].url,
        sources: volumes.map((v) => ({ gutenbergId: v.gid, url: v.url })),
        chapters,
      }),
    );

    report.push({
      id,
      lang,
      status: expect && chapters.length !== expect ? "MISMATCH" : "OK",
      chapters: chapters.length,
      expect,
      words,
      vols: volumes.length,
    });
  } catch (e) {
    report.push({ id, lang, status: "ERROR " + e.message });
  }
}

for (const r of report) {
  console.log(
    [
      (r.status || "").padEnd(16),
      `${r.id}.${r.lang}`.padEnd(44),
      (r.chapters != null ? `${r.chapters} ch` : "").padEnd(8),
      (r.expect ? `want ${r.expect}` : "").padEnd(9),
      (r.words ? `${(r.words / 1000).toFixed(0)}k w` : "").padEnd(9),
      r.vols > 1 ? `${r.vols} vols` : "",
    ].join(" "),
  );
}
