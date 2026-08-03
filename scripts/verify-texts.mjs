/**
 * Identity check: for every ingested file, ask Gutenberg what that ID actually
 * is and compare against the work we meant to fetch.
 */
import fs from "node:fs";
import path from "node:path";

const TEXTS = path.join(import.meta.dirname, "..", "content", "texts");
const SCR = path.join(import.meta.dirname, "manifests");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fold = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const expected = new Map();
for (const f of ["books.json", "works.json"]) {
  for (const e of JSON.parse(fs.readFileSync(`${SCR}/${f}`, "utf8"))) {
    expected.set(e.id, e);
  }
}

// Stories extracted from a collection legitimately live in a Gutenberg record
// titled after the volume, not the story — compare against the volume instead.
const fromCollection = new Map();
for (const job of JSON.parse(fs.readFileSync(`${SCR}/collections.json`, "utf8"))) {
  fromCollection.set(job.id, job.collection);
}

const rows = [];
for (const file of fs.readdirSync(TEXTS)) {
  const d = JSON.parse(fs.readFileSync(`${TEXTS}/${file}`, "utf8"));
  const want = expected.get(d.id);
  const words = d.chapters.reduce(
    (n, c) => n + c.paragraphs.join(" ").split(/\s+/).length,
    0,
  );

  await sleep(350);
  let got = null;
  try {
    const res = await fetch(`https://gutendex.com/books/${d.gutenbergId}/`, {
      headers: { "User-Agent": UA },
    });
    if (res.ok) got = await res.json();
  } catch {
    /* leave null */
  }

  const gotTitle = got?.title ?? "";
  const gotAuthors = (got?.authors ?? []).map((a) => a.name).join("; ");

  const wantTitle = fold(fromCollection.get(d.id) ?? want?.title ?? d.id);
  const haveTitle = fold(gotTitle);
  const titleOk =
    haveTitle.includes(wantTitle) ||
    wantTitle.includes(haveTitle.split(" ").slice(0, 6).join(" ")) ||
    haveTitle.startsWith(wantTitle.split(" ").slice(0, 3).join(" "));

  const surname = fold((want?.author ?? "").split(/\s+/).pop());
  const authorOk = !surname || fold(gotAuthors).includes(surname);

  rows.push({
    id: d.id,
    gid: d.gutenbergId,
    want: want?.title ?? "?",
    got: gotTitle,
    gotAuthors,
    chapters: d.chapters.length,
    words,
    titleOk,
    authorOk,
  });
}

const bad = rows.filter((r) => !r.titleOk || !r.authorOk);
const thin = rows.filter((r) => r.titleOk && r.authorOk && r.words < 4000);

console.log(`checked ${rows.length} ingested texts\n`);
console.log(`WRONG WORK (${bad.length}):`);
for (const r of bad) {
  console.log(
    `  ${r.id}\n     wanted: ${r.want}\n     got:    ${r.got} — ${r.gotAuthors} (#${r.gid}) ${r.chapters}ch ${Math.round(r.words / 1000)}k`,
  );
}
console.log(`\nSUSPICIOUSLY SHORT (${thin.length}):`);
for (const r of thin) {
  console.log(`  ${r.id.padEnd(48)} ${r.chapters}ch ${r.words} words  #${r.gid}`);
}

fs.writeFileSync(`${SCR}/verify-report.json`, JSON.stringify(rows, null, 1));
