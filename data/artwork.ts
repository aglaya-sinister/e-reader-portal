import { authorSlug } from "./authors";
import { allBooks } from "./books";

/**
 * Every book and story shows a painting behind its card.
 *
 * The ten catalog books have a painting chosen for that book. Everything else
 * draws from a small pool per author — period- and mood-appropriate rather than
 * book-specific — picked by a hash of the work id so a given work always shows
 * the same painting.
 */

const POOL_SIZE = 3;

const ownArtwork = new Map(
  allBooks.filter((b) => b.artwork.src).map((b) => [b.id, b.artwork.src!]),
);

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function backdropFor({
  id,
  author,
  authorId,
}: {
  id: string;
  author: string;
  authorId?: string;
}): string {
  const own = ownArtwork.get(id);
  if (own) return own;

  const slug = authorId && authorId.length > 0 ? authorId : authorSlug(author);
  return `/artwork/authors/${slug}-${(hash(id) % POOL_SIZE) + 1}.jpg`;
}
