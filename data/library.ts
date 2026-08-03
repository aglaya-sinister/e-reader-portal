import { authors, authorSlug, type AuthorWork } from "./authors";
import { allBooks } from "./books";

/**
 * Everything the reader can open: the catalog books, plus every work and short
 * story listed on an author page. One id space, one route.
 */
export type Readable = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  hue: number;
  kind: "book" | "work" | "story";
  /** Divisions, for anything without a hand-written structure. */
  chapters: number;
  chapterTitles?: string[];
  chapterUnit?: string;
};

export function titleSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Author works share an id space with books, namespaced by author. */
export function workId(authorId: string, title: string) {
  return `${authorId}--${titleSlug(title)}`;
}

function fromAuthorWork(
  authorId: string,
  authorName: string,
  work: AuthorWork,
  kind: "work" | "story",
): Readable {
  return {
    id: workId(authorId, work.title),
    title: work.title,
    author: authorName,
    authorId,
    hue: work.hue,
    kind,
    // A short story is one unbroken text unless it is a linked cycle.
    chapters: work.chapters ?? (kind === "story" ? 1 : 12),
    chapterTitles: work.chapterTitles,
    chapterUnit: work.chapterUnit,
  };
}

export const readables: Readable[] = [
  ...allBooks.map<Readable>((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    authorId: authorSlug(book.author),
    hue: book.hue,
    kind: "book",
    // Catalog books have real structures in chapters.ts; this is unused.
    chapters: 0,
  })),
  ...authors.flatMap<Readable>((author) => [
    ...author.works.map((w) => fromAuthorWork(author.id, author.name, w, "work")),
    ...(author.stories ?? []).map((s) =>
      fromAuthorWork(author.id, author.name, s, "story"),
    ),
  ]),
];

export const readableById = (id: string) => readables.find((r) => r.id === id);
