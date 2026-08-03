"use client";

import Link from "next/link";
import { useRef } from "react";
import { authorSlug } from "@/data/authors";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";
import ShelfButtons from "./shelf/ShelfButtons";
import StarRating from "./StarRating";

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedCard({ book }: { book: Book }) {
  return (
    <article className="group relative flex w-[min(86vw,640px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative flex w-full gap-5 p-5 sm:gap-6 sm:p-6">
        <div className="flex flex-col gap-3">
          <BookCover book={book} size="lg" />
          <StarRating value={book.rating} showValue />
          <ShelfButtons id={book.id} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass/80">
            Description
          </p>
          <div className="mt-1 h-px w-full bg-line" />
          <p className="mt-3 line-clamp-6 text-sm font-semibold leading-relaxed text-cream/85">
            {book.blurb}
          </p>

          <div className="mt-auto pt-5">
            <h3 className="truncate text-xl font-semibold tracking-tight">
              <Link
                href={`/read/${book.id}`}
                className="after:absolute after:inset-0 hover:text-brass"
              >
                {book.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              {/* z-10 lifts this above the title's stretched click target */}
              <Link
                href={`/author/${authorSlug(book.author)}`}
                className="relative z-10 underline-offset-2 transition hover:text-brass hover:underline"
              >
                {book.author}
              </Link>{" "}
              · {book.year}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {book.genres.map((g) => (
                <li
                  key={g}
                  className="rounded-full border border-line bg-black/25 px-2.5 py-1 text-[11px] text-cream/70"
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedCarousel({ books }: { books: Book[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    // One card plus the gap, capped so it still feels right on narrow screens.
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.9, 660), behavior: "smooth" });
  };

  return (
    <section aria-label="Featured books" className="relative">
      <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-4 px-4 pb-3 pt-6 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          Featured
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Scroll featured books left"
            onClick={() => scrollBy(-1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-cream/70 transition hover:border-brass/50 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            aria-label="Scroll featured books right"
            onClick={() => scrollBy(1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-cream/70 transition hover:border-brass/50 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
      >
        {books.map((book) => (
          <FeaturedCard key={book.id} book={book} />
        ))}
        {/* keeps the last card from butting against the viewport edge */}
        <div className="w-2 shrink-0" aria-hidden />
      </div>
    </section>
  );
}
