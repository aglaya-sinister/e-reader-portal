"use client";

import Link from "next/link";
import { readableById } from "@/data/library";
import { backdropFor } from "@/data/artwork";
import BookCover from "../BookCover";
import CardBackdrop from "../CardBackdrop";
import ShelfButtons from "./ShelfButtons";
import { idsByStatus, useShelf, type ShelfStatus } from "./useShelf";

const GROUPS: { status: ShelfStatus; heading: string; colour: string }[] = [
  { status: "reading", heading: "Reading now", colour: "#3b82f6" },
  { status: "planned", heading: "Planned to read", colour: "#e08421" },
  { status: "read", heading: "Already read", colour: "#3fa96a" },
];

function Card({ id, percent }: { id: string; percent?: number }) {
  const item = readableById(id);
  if (!item) return null;

  return (
    <li className="relative overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-brass/40">
      <CardBackdrop src={backdropFor(item)} hue={item.hue} dim sizes="520px" />

      <div className="relative flex gap-4 p-4">
        <BookCover book={item} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-semibold leading-snug">
          <Link
            href={`/read/${item.id}`}
            className="after:absolute after:inset-0 hover:text-brass"
          >
            {item.title}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted">
          <Link
            href={`/author/${item.authorId}`}
            className="relative z-10 underline-offset-2 hover:text-brass hover:underline"
          >
            {item.author}
          </Link>
        </p>

        {percent != null && (
          <div className="mt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brass"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted tabular-nums">
              {percent}% read
            </p>
          </div>
        )}

          <div className="mt-auto pt-3">
            <ShelfButtons id={item.id} />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function LibraryLists() {
  const { shelf } = useShelf();

  const groups = GROUPS.map((g) => ({ ...g, ids: idsByStatus(shelf, g.status) }));
  const total = groups.reduce((n, g) => n + g.ids.length, 0);

  return (
    <>
      <Link href="/" className="text-sm text-muted transition hover:text-cream">
        ← Catalog
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your Library</h1>
      <p className="mt-1 text-sm text-muted">
        {total === 0
          ? "Nothing shelved yet."
          : `${total} ${total === 1 ? "title" : "titles"} shelved`}
      </p>

      {total === 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-ink-soft p-6">
          <p className="leading-relaxed text-cream/75">
            Every book and short story on the site carries three buttons. Use the{" "}
            <span style={{ color: "#3fa96a" }}>green tick</span> for something
            you have read, the{" "}
            <span style={{ color: "#3b82f6" }}>blue clock</span> for what you are
            reading now, and the{" "}
            <span style={{ color: "#e08421" }}>orange bookmark</span> for what
            you plan to read.
          </p>
          <p className="mt-3 text-sm text-muted">
            Your shelf is stored in this browser — no account needed.
          </p>
        </div>
      )}

      {groups.map((group) =>
        group.ids.length === 0 ? null : (
          <section key={group.status} className="mt-10">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: group.colour }}
                aria-hidden
              />
              <h2 className="text-xl font-semibold tracking-tight">
                {group.heading}
              </h2>
              <span className="text-sm text-muted">({group.ids.length})</span>
            </div>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.ids.map((id) => (
                <Card key={id} id={id} percent={shelf[id]?.percent} />
              ))}
            </ul>
          </section>
        ),
      )}

    </>
  );
}
