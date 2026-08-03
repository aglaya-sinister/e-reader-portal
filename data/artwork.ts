import pools from "./artwork-pools.json";
import { authors } from "./authors";
import { allBooks } from "./books";
import { workId } from "./library";

/**
 * Every book and story shows a different painting.
 *
 * The ten catalog books have one chosen for that book. Every other work takes
 * the next painting from its author's set, assigned by position rather than by
 * hashing the id — a hash collides, and two works on the same page then share a
 * backdrop.
 *
 * `artwork-pools.json` lists the paintings that actually exist on disk, so a
 * work beyond the available set returns null and falls back to the generated
 * gradient. A visible gap is better than a broken image or a silent duplicate.
 */

const ownArtwork = new Map(
  allBooks.filter((b) => b.artwork.src).map((b) => [b.id, b.artwork.src!]),
);

const available = pools as Record<string, number[]>;

/** work id -> painting path, or null where the author's set runs out. */
const assigned = new Map<string, string | null>();

for (const author of authors) {
  const set = available[author.id] ?? [];
  const everything = [...author.works, ...(author.stories ?? [])];

  everything.forEach((work, i) => {
    const n = set[i];
    assigned.set(
      workId(author.id, work.title),
      n === undefined ? null : `/artwork/authors/${author.id}-${n}.jpg`,
    );
  });
}

/** Callers pass whole books or works, so extra fields are accepted and ignored. */
export function backdropFor(item: {
  id: string;
  author?: string;
  authorId?: string;
}): string | null {
  return ownArtwork.get(item.id) ?? assigned.get(item.id) ?? null;
}
