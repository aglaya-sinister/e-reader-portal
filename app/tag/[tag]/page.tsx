import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import StarRating from "@/components/StarRating";
import ShelfButtons from "@/components/shelf/ShelfButtons";
import TagCloud from "@/components/TagCloud";
import TopBar from "@/components/TopBar";
import { authorSlug } from "@/data/authors";
import { itemsByGenre, tagBySlug, tags, tagSlug } from "@/data/tags";

export function generateStaticParams() {
  return tags.map((t) => ({ tag: tagSlug(t.label) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const found = tagBySlug(tag);
  return { title: found ? `${found.label} — e-reader-portal` : "Tag not found" };
}

const KIND_LABEL = { book: "In the catalog", work: "Work", story: "Short story" };

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const found = tagBySlug(tag);
  if (!found) notFound();

  const items = itemsByGenre(found.label);
  const counts = {
    book: items.filter((i) => i.kind === "book").length,
    work: items.filter((i) => i.kind === "work").length,
    story: items.filter((i) => i.kind === "story").length,
  };

  return (
    <>
      <TopBar />

      <main className="mx-auto grid max-w-[1500px] flex-1 gap-6 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TagCloud tags={tags} activeSlug={tag} />
        </aside>

        <div>
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-cream"
          >
            ← Catalog
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {found.label}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} {items.length === 1 ? "title" : "titles"}
            {" · "}
            {counts.book} in the catalog, {counts.work} other works,{" "}
            {counts.story} short stories
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-brass/40"
              >

                <div className="relative flex gap-4 p-4">
                  <BookCover book={item} size="md" />
                  <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass/70">
                    {KIND_LABEL[item.kind]}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-cream/70">
                    {item.note}
                  </p>
                  <div className="mt-3">
                    <h2 className="font-semibold leading-snug">
                      <Link
                        href={item.href}
                        className="after:absolute after:inset-0 hover:text-brass"
                      >
                        {item.title}
                      </Link>
                    </h2>
                    <p className="text-xs text-muted">
                      <Link
                        href={`/author/${item.authorId || authorSlug(item.author)}`}
                        className="relative z-10 underline-offset-2 hover:text-brass hover:underline"
                      >
                        {item.author}
                      </Link>{" "}
                      · {item.year}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.rating != null && (
                        <StarRating value={item.rating} showValue />
                      )}
                      <span className="text-[11px] text-muted">
                        {item.genres.join(" · ")}
                      </span>
                    </div>
                    <ShelfButtons id={item.id} className="mt-2.5" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
