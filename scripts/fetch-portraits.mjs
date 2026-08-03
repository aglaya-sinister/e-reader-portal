import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UA = "book-catalog-dev/0.1 (local demo; contact: local)";
const OUT = path.resolve(import.meta.dirname, "..", "public", "authors");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = [
  ["robert-louis-stevenson", "Robert Louis Stevenson portrait painting Nerli"],
  ["mary-shelley", "Mary Shelley Rothwell portrait"],
  ["oscar-wilde", "Oscar Wilde Napoleon Sarony 1882"],
  ["herman-melville", "Herman Melville Joseph Oriel Eaton portrait"],
  ["bram-stoker", "Bram Stoker portrait photograph"],
  ["alexandre-dumas", "Alexandre Dumas pere portrait Nadar photograph"],
  ["charlotte-bronte", "Charlotte Bronte George Richmond portrait"],
  ["joseph-conrad", "Joseph Conrad portrait photograph"],
  ["emily-bronte", "Emily Bronte Branwell Bronte portrait"],
];

const EXCLUDE = /signature|grave|plaque|house|stamp|book|cover|memorial|statue|museum exterior|logo/i;

await mkdir(OUT, { recursive: true });

for (const [id, q] of targets) {
  await sleep(1600);
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(q)}` +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=900&format=json";

  let json;
  try {
    json = await (await fetch(url, { headers: { "User-Agent": UA } })).json();
  } catch (e) {
    console.log(`${id}: search failed ${e.message}`);
    continue;
  }

  const cands = Object.values(json?.query?.pages ?? {})
    .filter((p) => /\.(jpe?g|png)$/i.test(p.title) && !EXCLUDE.test(p.title))
    .map((p) => ({ p, i: p.imageinfo?.[0] }))
    .filter((x) => x.i && x.i.width >= 400)
    .map((x) => ({ ...x, ratio: x.i.width / x.i.height }))
    // Head-and-shoulders crop well from portrait or square sources.
    .filter((x) => x.ratio >= 0.55 && x.ratio <= 1.25)
    .sort((a, b) => {
      const pd = (x) =>
        /public domain|^pd|cc0/i.test(x.i.extmetadata?.LicenseShortName?.value ?? "") ? 0 : 1;
      return pd(a) - pd(b) || (a.p.index ?? 9) - (b.p.index ?? 9);
    });

  const best = cands[0];
  if (!best) {
    console.log(`${id}: UNRESOLVED`);
    continue;
  }

  await sleep(700);
  const res = await fetch(best.i.thumburl, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    console.log(`${id}: HTTP ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(OUT, `${id}.jpg`), buf);

  const artist = (best.i.extmetadata?.Artist?.value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 60);
  console.log(
    `${id}.jpg  ${(buf.length / 1024).toFixed(0)}KB  r${best.ratio.toFixed(2)}  [${best.i.extmetadata?.LicenseShortName?.value}]\n    artist: ${artist || "—"}\n    file:   ${best.p.title}`,
  );
}
