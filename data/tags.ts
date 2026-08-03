import { authors, type AuthorWork } from "./authors";
import { allBooks, type Tag } from "./books";
import { workId } from "./library";

/**
 * Genres span the whole library, not just the catalog books — every author
 * work and short story carries them too, so a tag page shows everything.
 */
export type TaggedItem = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  href: string;
  hue: number;
  kind: "book" | "work" | "story";
  genres: string[];
  year: string;
  /** Blurb for a catalog book, one-line note for a work. */
  note: string;
  rating?: number;
};

export function tagSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fromWork(
  author: { id: string; name: string },
  work: AuthorWork,
  kind: "work" | "story",
): TaggedItem {
  return {
    id: workId(author.id, work.title),
    title: work.title,
    author: author.name,
    authorId: author.id,
    href: `/read/${workId(author.id, work.title)}`,
    hue: work.hue,
    kind,
    genres: work.genres ?? [],
    year: work.year,
    note: work.note,
  };
}

export const taggedItems: TaggedItem[] = [
  ...allBooks.map<TaggedItem>((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    authorId: "",
    href: `/read/${b.id}`,
    hue: b.hue,
    kind: "book",
    genres: b.genres,
    year: String(b.year),
    note: b.blurb,
    rating: b.rating,
  })),
  ...authors.flatMap<TaggedItem>((a) => [
    ...a.works.map((w) => fromWork(a, w, "work")),
    ...(a.stories ?? []).map((s) => fromWork(a, s, "story")),
  ]),
];

/** Every genre in use, with real counts across the whole library. */
export const tags: Tag[] = (() => {
  const counts = new Map<string, number>();
  for (const item of taggedItems) {
    for (const g of item.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
})();

export const tagBySlug = (slug: string) =>
  tags.find((t) => tagSlug(t.label) === slug);

export const itemsByGenre = (label: string) =>
  taggedItems
    .filter((i) => i.genres.some((g) => tagSlug(g) === tagSlug(label)))
    // Catalog books first, then works, then short stories.
    .sort((a, b) => {
      const rank = { book: 0, work: 1, story: 2 } as const;
      return rank[a.kind] - rank[b.kind] || a.title.localeCompare(b.title);
    });
