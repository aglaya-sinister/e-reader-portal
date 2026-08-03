import Link from "next/link";
import type { AuthorWork } from "@/data/authors";
import { workId } from "@/data/library";
import { backdropFor } from "@/data/artwork";
import BookCover from "../BookCover";
import CardBackdrop from "../CardBackdrop";
import ShelfButtons from "../shelf/ShelfButtons";

/** A titled grid of works: cover on the left, description beside it. */
export default function WorkGrid({
  heading,
  id,
  authorId,
  authorName,
  items,
  note,
}: {
  heading: string;
  id: string;
  authorId: string;
  authorName: string;
  items: AuthorWork[];
  /** Optional line under the heading, e.g. where a cycle was collected. */
  note?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((work) => (
          <li
            key={work.title}
            className="relative overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-brass/40"
          >
            <CardBackdrop
              src={backdropFor({
                id: workId(authorId, work.title),
                author: authorName,
                authorId,
              })}
              hue={work.hue}
              dim
              sizes="520px"
            />

            <div className="relative flex gap-4 p-4">
              <BookCover
                book={{ title: work.title, author: authorName, hue: work.hue }}
                size="md"
              />
              <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass/70">
                Description
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-cream/85">
                {work.note}
              </p>
              <div className="mt-3">
                <h3 className="font-semibold leading-snug">
                  <Link
                    href={`/read/${workId(authorId, work.title)}`}
                    className="after:absolute after:inset-0 hover:text-brass"
                  >
                    {work.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted">{work.year}</p>
                <ShelfButtons
                  id={workId(authorId, work.title)}
                  className="mt-2.5"
                />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
