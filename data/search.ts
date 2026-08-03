import { authors } from "./authors";
import { readables } from "./library";
import { taggedItems } from "./tags";

/**
 * A flat index of everything the site can navigate to. Small enough (~120
 * entries) to hand to the browser whole, so search stays instant and offline.
 */
export type SearchEntry = {
  id: string;
  kind: "book" | "work" | "story" | "author";
  title: string;
  /** Author name, or life dates for an author entry. */
  subtitle: string;
  href: string;
  genres: string[];
  hue: number;
};

// Genres now exist on works and stories too, not just catalog books.
const genresById = new Map(taggedItems.map((i) => [i.id, i.genres]));

export const searchIndex: SearchEntry[] = [
  ...authors.map<SearchEntry>((a) => ({
    id: `author:${a.id}`,
    kind: "author",
    title: a.name,
    subtitle: `${a.nationality} · ${a.lived}`,
    href: `/author/${a.id}`,
    genres: [],
    hue: 0,
  })),
  ...readables.map<SearchEntry>((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    subtitle: r.author,
    href: `/read/${r.id}`,
    genres: genresById.get(r.id) ?? [],
    hue: r.hue,
  })),
];

/** Accent-folded, punctuation-free comparison key. */
export function normalise(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Rank matches: whole-title hits beat prefixes, prefixes beat substrings, and
 * a title match always beats an author or genre match.
 */
export function searchEntries(query: string, limit = 30): SearchEntry[] {
  const q = normalise(query);
  if (q.length === 0) return [];
  const terms = q.split(" ").filter(Boolean);

  const scored = searchIndex
    .map((entry) => {
      const title = normalise(entry.title);
      const subtitle = normalise(entry.subtitle);
      const genres = normalise(entry.genres.join(" "));

      let score = 0;
      for (const term of terms) {
        if (title === q) score += 100;
        else if (title.startsWith(term)) score += 40;
        else if (title.includes(term)) score += 25;
        else if (subtitle.includes(term)) score += 15;
        else if (genres.includes(term)) score += 8;
        else return { entry, score: -1 }; // every term must hit something
      }
      // Prefer the author's own page over their individual works.
      if (entry.kind === "author") score += 6;
      if (entry.kind === "book") score += 4;
      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

  return scored.slice(0, limit).map((s) => s.entry);
}
