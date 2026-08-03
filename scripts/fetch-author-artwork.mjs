/**
 * Download a small pool of public-domain paintings per author, used as card
 * backdrops for every work and short story that has no painting of its own.
 *
 * Writes public/artwork/authors/<authorId>-<n>.jpg
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(import.meta.dirname, "..", "public", "artwork", "authors");
const UA = "book-catalog-dev/0.1 (local demo)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Chosen for period, nationality and mood rather than for a specific book.
const POOLS = {
  "robert-louis-stevenson": [
    "Horatio McCulloch Glencoe painting",
    "William McTaggart The Storm painting",
    "Ivan Aivazovsky Moonlit Night sea",
  ],
  "mary-shelley": [
    "Caspar David Friedrich Monk by the Sea",
    "John Martin The Great Day of His Wrath",
    "Turner Snow Storm Steam-Boat off a Harbour's Mouth",
  ],
  "oscar-wilde": [
    "Alma-Tadema The Roses of Heliogabalus",
    "Whistler Nocturne Blue and Silver Chelsea 1871",
    "James Tissot The Ball on Shipboard",
  ],
  "herman-melville": [
    "Aivazovsky The Ninth Wave",
    "Winslow Homer The Gulf Stream",
    "Turner The Slave Ship",
  ],
  "bram-stoker": [
    "Arnold Bocklin Die Toteninsel Berlin",
    "Caspar David Friedrich Abbey in the Oakwood",
    "John Atkinson Grimshaw Liverpool Quay by Moonlight",
  ],
  "charlotte-bronte": [
    "John Atkinson Grimshaw Knostrop Hall Early Morning",
    "John Constable Hadleigh Castle",
    "Richard Redgrave The Poor Teacher painting",
  ],
  "joseph-conrad": [
    "Frederic Edwin Church El Rio de Luz",
    "Aivazovsky ship in stormy sea",
    "Claude Monet Impression soleil levant",
  ],
  "emily-bronte": [
    "Peter Graham Wandering Shadows",
    "John Everett Millais Chill October 1870",
    "Caspar David Friedrich Landscape with Rainbow",
  ],
  "alexandre-dumas": [
    "Eugene Delacroix Liberty Leading the People",
    "Eugene Delacroix The Barque of Dante",
    "Ernest Meissonier 1814 Campagne de France",
  ],
};

fs.mkdirSync(OUT, { recursive: true });

const report = [];

for (const [authorId, queries] of Object.entries(POOLS)) {
  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const file = path.join(OUT, `${authorId}-${i + 1}.jpg`);
    // Already downloaded — re-running should only fill the gaps.
    if (fs.existsSync(file)) {
      report.push(`SKIP  ${authorId}-${i + 1}  (already present)`);
      continue;
    }
    await sleep(2500);

    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
      `&gsrsearch=${encodeURIComponent(q)}` +
      "&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|extmetadata" +
      "&iiurlwidth=1400&format=json";

    let best = null;
    try {
      const json = await (await fetch(url, { headers: { "User-Agent": UA } })).json();
      best = Object.values(json?.query?.pages ?? {})
        .filter(
          (p) =>
            /\.(jpe?g|png)$/i.test(p.title) &&
            !/frame|detail|sketch|study|signature/i.test(p.title),
        )
        .map((p) => ({ p, i: p.imageinfo?.[0] }))
        .filter((x) => x.i && x.i.width >= 700)
        // Backdrops sit behind wide cards, so prefer landscape.
        .map((x) => ({ ...x, ratio: x.i.width / x.i.height }))
        .filter((x) => x.ratio >= 1.15)
        // Public domain or CC0 only. Preferring them is not enough — a
        // share-alike licence such as GFDL would otherwise slip through and be
        // republished without the attribution it requires.
        .filter((x) =>
          /^(public domain|pd|cc0)/i.test(
            (x.i.extmetadata?.LicenseShortName?.value ?? "").trim(),
          ),
        )
        .sort((a, b) => (a.p.index ?? 9) - (b.p.index ?? 9))[0];
    } catch {
      best = null;
    }

    if (!best) {
      report.push(`MISS  ${authorId}-${i + 1}  ${q}`);
      continue;
    }

    await sleep(400);
    const res = await fetch(best.i.thumburl, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      report.push(`HTTP${res.status}  ${authorId}-${i + 1}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(file, buf);
    report.push(
      `OK    ${authorId}-${i + 1}  ${(buf.length / 1024).toFixed(0)}KB r${best.ratio.toFixed(2)}  ` +
        `[${best.i.extmetadata?.LicenseShortName?.value}]  ${best.p.title.slice(5, 58)}`,
    );
  }
}

report.forEach((r) => console.log(r));
