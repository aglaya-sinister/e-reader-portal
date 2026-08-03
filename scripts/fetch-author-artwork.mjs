/**
 * Download one public-domain painting per work, so no two cards share a
 * backdrop. Paintings are matched to the author's period and visual register
 * rather than to the individual book — with roughly a hundred works that is the
 * realistic bar, and it keeps each author's shelf visually coherent.
 *
 * Writes public/artwork/authors/<authorId>-<n>.jpg
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "artwork", "authors");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Broad searches: enough results to give every work a distinct painting.
const SEARCHES = {
  "robert-louis-stevenson": [
    "Scottish highland landscape painting 19th century",
    "Horatio McCulloch painting",
    "William McTaggart painting sea",
  ],
  "mary-shelley": [
    "Caspar David Friedrich painting",
    "John Martin painting apocalyptic",
    "romantic sublime mountain painting 19th century",
  ],
  "oscar-wilde": [
    "Alma-Tadema painting",
    "James Tissot painting",
    "aesthetic movement Victorian painting",
    "Frederic Leighton painting",
    "Albert Moore painting",
  ],
  "herman-melville": [
    "Ivan Aivazovsky seascape painting",
    "19th century marine painting ship",
    "Winslow Homer marine painting",
    "whaling ship painting 19th century",
    "Thomas Moran seascape painting",
    "Fitz Henry Lane marine painting",
    "Hudson River School painting coast",
  ],
  "bram-stoker": [
    "John Atkinson Grimshaw moonlight painting",
    "Arnold Bocklin painting",
    "gothic ruins moonlight painting 19th century",
    "Caspar David Friedrich ruins painting",
    "night landscape painting 19th century moon",
    "Carl Gustav Carus painting",
    "Irish landscape painting 19th century",
    "symbolist painting 19th century landscape",
    "Jacob van Ruisdael landscape painting",
    "Salvator Rosa landscape painting",
    "Hubert Robert ruins painting",
  ],
  "charlotte-bronte": [
    "Victorian genre painting interior scene",
    "John Constable landscape painting",
    "19th century English countryside painting",
    "Richard Redgrave painting",
    "William Powell Frith painting",
    "Yorkshire landscape painting 19th century",
    "Benjamin Williams Leader painting",
    "Myles Birket Foster painting",
    "George Vicat Cole painting",
  ],
  "joseph-conrad": [
    "Frederic Edwin Church landscape painting",
    "19th century seascape storm painting",
    "tropical river landscape painting 19th century",
  ],
  "emily-bronte": [
    "moorland landscape painting 19th century",
    "Peter Graham painting Scotland",
    "John Everett Millais landscape painting",
  ],
  "alexandre-dumas": [
    "Eugene Delacroix painting",
    "French romantic history painting 19th century",
    "Ernest Meissonier painting",
    "Horace Vernet painting battle",
    "Paul Delaroche painting history",
    "French 19th century painting Louvre landscape",
    "Theodore Gericault painting",
    "Eugene Isabey painting marine",
    "Camille Corot landscape painting",
    "Barbizon school landscape painting",
    "Theodore Rousseau painting forest",
    "Charles Francois Daubigny painting",
    "Jean-Leon Gerome painting",
    "Constant Troyon painting",
    "Jules Dupre landscape painting",
    "Narcisse Diaz de la Pena painting",
    "Eugene Fromentin painting",
    "Alexandre-Gabriel Decamps painting",
    "Prosper Marilhat painting",
  ],
};

const EXCLUDE =
  /frame|detail|sketch|study|signature|portrait of|coat of arms|map|plan of|photograph/i;

/** How many works each author has, so each can have its own painting. */
function worksPerAuthor() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts", "manifests", "works.json"), "utf8"),
  );
  const counts = {};
  for (const w of manifest) {
    const authorId = w.id.split("--")[0];
    counts[authorId] = (counts[authorId] ?? 0) + 1;
  }
  return counts;
}

async function search(query, limit = 50) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo` +
    "&iiprop=url|size|extmetadata&iiurlwidth=1400&format=json";
  try {
    const json = await (await fetch(url, { headers: { "User-Agent": UA } })).json();
    return Object.values(json?.query?.pages ?? {});
  } catch {
    return [];
  }
}

fs.mkdirSync(OUT, { recursive: true });
const needed = worksPerAuthor();
const report = [];

// Which Commons file ended up in which slot. Kept so a re-run resumes rather
// than restarts, and never reuses a painting already placed elsewhere.
const LEDGER = path.join(OUT, "_sources.json");
const ledger = fs.existsSync(LEDGER)
  ? JSON.parse(fs.readFileSync(LEDGER, "utf8"))
  : {};
const alreadyUsed = new Set(Object.values(ledger));

/**
 * Every painting already on disk, by content hash — catalog images included, so
 * a pool painting can never repeat one a catalog book already uses.
 *
 * Hashing the bytes rather than trusting the ledger is the point: the ledger
 * only records what this script downloaded, and any file it did not write is
 * invisible to it. That gap is what let the same painting land twice.
 */
function existingHashes() {
  const seen = new Set();
  const dirs = [path.join(ROOT, "public", "artwork"), OUT];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".jpg")) continue;
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) continue;
      seen.add(crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex"));
    }
  }
  return seen;
}

const hashes = existingHashes();

/**
 * Download with a retry, since Commons rate-limits bursts with a 429.
 * Rejects an image whose bytes already exist elsewhere.
 */
async function download(url, file) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const h = crypto.createHash("sha256").update(buf).digest("hex");
      if (hashes.has(h)) return false; // already used — try the next candidate
      hashes.add(h);
      fs.writeFileSync(file, buf);
      return true;
    }
    if (res.status !== 429) return false;
    await sleep(4000 * (attempt + 1));
  }
  return false;
}

for (const [authorId, queries] of Object.entries(SEARCHES)) {
  const want = needed[authorId] ?? 0;

  // Slots still to fill.
  const missing = [];
  for (let i = 1; i <= want; i++) {
    if (!fs.existsSync(path.join(OUT, `${authorId}-${i}.jpg`))) missing.push(i);
  }
  if (missing.length === 0) {
    report.push(`${authorId}: complete (${want})`);
    continue;
  }

  const picked = [];
  const seen = new Set(alreadyUsed);

  for (const q of queries) {
    if (picked.length >= missing.length) break;
    await sleep(2200);
    const pages = await search(q);

    const usable = pages
      .filter((p) => /\.(jpe?g|png)$/i.test(p.title) && !EXCLUDE.test(p.title))
      .map((p) => ({ p, i: p.imageinfo?.[0] }))
      .filter((x) => x.i && x.i.width >= 700)
      .map((x) => ({ ...x, ratio: x.i.width / x.i.height }))
      .filter((x) => x.ratio >= 1.15)
      // Public domain or CC0 only — a share-alike licence such as GFDL carries
      // attribution terms this use would not meet.
      .filter((x) =>
        /^(public domain|pd|cc0)/i.test(
          (x.i.extmetadata?.LicenseShortName?.value ?? "").trim(),
        ),
      )
      .sort((a, b) => (a.p.index ?? 99) - (b.p.index ?? 99));

    for (const u of usable) {
      if (picked.length >= missing.length) break;
      if (seen.has(u.p.title)) continue;
      seen.add(u.p.title);
      picked.push(u);
    }
  }

  // Walk the candidate list, moving on whenever one is rejected as a duplicate
  // so a repeat does not simply leave the slot empty.
  let filled = 0;
  let next = 0;
  for (const slot of missing) {
    let placed = false;
    while (!placed && next < picked.length) {
      const choice = picked[next++];
      const name = `${authorId}-${slot}.jpg`;
      await sleep(1200);
      if (await download(choice.i.thumburl, path.join(OUT, name))) {
        ledger[name] = choice.p.title;
        alreadyUsed.add(choice.p.title);
        fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1));
        filled++;
        placed = true;
      }
    }
    if (!placed) break;
  }

  report.push(
    `${authorId}: filled ${filled} of ${missing.length} missing (target ${want})`,
  );
}

report.forEach((r) => console.log(r));
