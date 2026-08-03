"use client";

import Link from "next/link";
import { readableById } from "@/data/library";
import BookCover from "./BookCover";
import Panel from "./Panel";
import { idsByStatus, useShelf } from "./shelf/useShelf";

function Row({ id, percent }: { id: string; percent?: number }) {
  const item = readableById(id);
  if (!item) return null;

  return (
    <li className="relative flex gap-3">
      <BookCover book={item} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">
          <Link
            href={`/read/${item.id}`}
            className="after:absolute after:inset-0 hover:text-brass"
          >
            {item.title}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted">{item.author}</p>
        {percent != null && (
          <>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brass"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted tabular-nums">
              {percent}% read
            </p>
          </>
        )}
      </div>
    </li>
  );
}

export default function YourLibrary() {
  const { shelf } = useShelf();

  const reading = idsByStatus(shelf, "reading");
  const planned = idsByStatus(shelf, "planned");
  const read = idsByStatus(shelf, "read");

  const empty = reading.length + planned.length + read.length === 0;

  return (
    <Panel
      title="Your Library"
      action={
        !empty ? (
          <Link
            href="/library"
            className="text-xs text-brass/80 transition hover:text-brass"
          >
            All →
          </Link>
        ) : undefined
      }
    >
      {empty ? (
        <p className="text-sm leading-relaxed text-muted">
          Nothing here yet. Use the{" "}
          <span style={{ color: "#3b82f6" }}>clock</span>,{" "}
          <span style={{ color: "#3fa96a" }}>tick</span> and{" "}
          <span style={{ color: "#e08421" }}>bookmark</span> buttons on any book
          to start a shelf.
        </p>
      ) : (
        <div className="space-y-4">
          {reading.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Reading now
              </p>
              <ul className="space-y-4">
                {reading.slice(0, 4).map((id) => (
                  <Row key={id} id={id} percent={shelf[id]?.percent} />
                ))}
              </ul>
            </div>
          )}

          <p className="border-t border-line pt-3 text-xs text-muted">
            {read.length} read · {planned.length} planned
          </p>
        </div>
      )}
    </Panel>
  );
}
