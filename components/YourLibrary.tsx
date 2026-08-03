import Link from "next/link";
import { authorSlug } from "@/data/authors";
import { bookById, type ShelfEntry } from "@/data/books";
import BookCover from "./BookCover";
import Panel from "./Panel";

export default function YourLibrary({ shelf }: { shelf: ShelfEntry[] }) {
  return (
    <Panel
      title="Your Library"
      action={
        <button
          type="button"
          className="text-xs text-brass/80 transition hover:text-brass"
        >
          All →
        </button>
      }
    >
      <ul className="space-y-4">
        {shelf.map((entry) => {
          const book = bookById(entry.bookId);
          if (!book) return null;
          return (
            <li key={entry.bookId} className="relative flex gap-3">
              <BookCover book={book} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium">
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
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brass"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted tabular-nums">
                  {entry.progress}% read
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
