// Resolve each book's backdrop painting to a Wikimedia Commons file.
// Pass --download to actually write files into public/artwork/.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UA = "book-catalog-dev/0.1 (local demo; contact: local)";
const OUT = path.resolve(import.meta.dirname, "..", "public", "artwork");

const targets = [
  { id: "frankenstein", q: "Caspar David Friedrich Das Eismeer Hamburger Kunsthalle" },
  { id: "dorian-gray", q: "Whistler Nocturne Blue and Silver Chelsea 1871" },
  { id: "moby-dick", q: "Turner Whalers Metropolitan Museum painting" },
  { id: "dracula", q: "Arnold Böcklin Die Toteninsel Isle of the Dead" },
  { id: "jekyll-hyde", q: "John Atkinson Grimshaw Nightfall down the Thames" },
  { id: "time-machine", q: "John Martin The Last Man painting" },
  { id: "jane-eyre", q: "John Atkinson Grimshaw Knostrop Hall Early Morning" },
  { id: "heart-of-darkness", q: "Frederic Edwin Church Morning in the Tropics" },
  { id: "turn-of-the-screw", q: "Corot Ville d'Avray painting" },
  { id: "wuthering-heights", q: "Peter Graham Wandering Shadows Google Art Project" },
];

async function resolveOne({ id, q }) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(q)}` +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo" +
    "&iiprop=url|size|extmetadata&iiurlwidth=1600&format=json";

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {});
  if (!pages.length) return { id, error: "no results" };

  // Reject crops, framed shots and unrelated media that share a search term.
  const EXCLUDE = /frame|detail|diagonale|poster|movie|film|stamp|book cover/i;

  // Prefer landscape, reasonably large, and an image file (not SVG/PDF).
  const scored = pages
    .filter((p) => /\.(jpe?g|png)$/i.test(p.title) && !EXCLUDE.test(p.title))
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const ratio = ii.width / ii.height;
      const meta = ii.extmetadata ?? {};
      const license = meta.LicenseShortName?.value ?? "?";
      return {
        title: p.title,
        w: ii.width,
        h: ii.height,
        ratio: +ratio.toFixed(2),
        license,
        thumb: ii.thumburl,
        page: ii.descriptionurl,
        index: p.index ?? 99,
      };
    })
    .filter(Boolean)
    // Landscape first (the card is wide), then by the search engine's ranking.
    .sort((a, b) => {
      const land = (x) => (x.ratio >= 1.25 ? 0 : 1);
      return land(a) - land(b) || a.index - b.index;
    });

  return { id, q, candidates: scored };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
for (const t of targets) {
  await sleep(1500); // Commons rate-limits bursts
  const r = await resolveOne(t);
  results.push(r);
  const top = r.candidates?.[0];
  console.log(
    `\n${r.id}\n  query: ${t.q}\n  top:   ${top ? `${top.title} [${top.w}x${top.h} ratio ${top.ratio}] ${top.license}` : "NONE"}`,
  );
  for (const c of (r.candidates ?? []).slice(1, 4)) {
    console.log(`  alt:   ${c.title} [${c.w}x${c.h} ratio ${c.ratio}]`);
  }
}

if (process.argv.includes("--download")) {
  await mkdir(OUT, { recursive: true });
  console.log("\n--- downloading ---");
  for (const r of results) {
    const top = r.candidates?.[0];
    if (!top) {
      console.log(`${r.id}: SKIPPED (unresolved)`);
      continue;
    }
    const res = await fetch(top.thumb, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.log(`${r.id}: HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const file = path.join(OUT, `${r.id}.jpg`);
    await writeFile(file, buf);
    console.log(`${r.id}.jpg  ${(buf.length / 1024).toFixed(0)} KB  <- ${top.title}`);
  }
}
