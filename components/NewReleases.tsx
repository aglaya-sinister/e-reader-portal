import Link from "next/link";
import { authorSlug } from "@/data/authors";
import ShelfButtons from "./shelf/ShelfButtons";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";
import StarRating from "./StarRating";

/** The sketch's wide card: cover on the left, description beside it. */
function WideCard({ book }: { book: Book }) {
  return (
    <article className="relative flex gap-4 rounded-2xl border border-line bg-panel p-4 transition hover:border-brass/40">
      <BookCover book={book} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass/70">
          Description
        </p>
        <p className="mt-2 line-clamp-4 text-sm font-semibold leading-relaxed text-cream/85">
          {book.blurb}
        </p>
        <div className="mt-auto pt-4">
          <h3 className="truncate font-semibold">
            <Link
              href={`/read/${book.id}`}
              className="after:absolute after:inset-0 hover:text-brass"
            >
              {book.title}
            </Link>
          </h3>
          <p className="text-xs text-muted">
            <Link
              href={`/author/${authorSlug(book.author)}`}
              className="relative z-10 underline-offset-2 transition hover:text-brass hover:underline"
            >
              {book.author}
            </Link>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating value={book.rating} showValue />
            <span className="text-muted/40">·</span>
            <span className="text-[11px] text-muted">
              {book.genres.join(" · ")}
            </span>
          </div>
          <ShelfButtons id={book.id} className="mt-3" />
        </div>
      </div>
    </article>
  );
}

/** The sketch's compact card: cover, title, one line of everything else. */
function CompactCard({ book }: { book: Book }) {
  return (
    <article className="relative flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 transition hover:border-brass/40">
      <BookCover book={book} size="md" />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">
          <Link
            href={`/read/${book.id}`}
            className="after:absolute after:inset-0 hover:text-brass"
          >
            {book.title}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted">
          <Link
            href={`/author/${authorSlug(book.author)}`}
            className="relative z-10 underline-offset-2 transition hover:text-brass hover:underline"
          >
            {book.author}
          </Link>
        </p>
        <div className="mt-1.5">
          <StarRating value={book.rating} />
        </div>
        <ShelfButtons id={book.id} className="mt-2.5" />
      </div>
    </article>
  );
}

export default function NewReleases({ books }: { books: Book[] }) {
  const [lead, ...rest] = books;

  return (
    <section aria-labelledby="new-releases">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 id="new-releases" className="text-2xl font-semibold tracking-tight">
          New Release
        </h2>
        <button
          type="button"
          className="text-xs text-brass/80 transition hover:text-brass"
        >
          See all →
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="sm:col-span-2 xl:col-span-2">
          <WideCard book={lead} />
        </div>
        {rest.map((book) => (
          <CompactCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
