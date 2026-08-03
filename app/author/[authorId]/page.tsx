import Link from "next/link";
import { notFound } from "next/navigation";
import AuthorPortrait from "@/components/author/AuthorPortrait";
import WorkGrid from "@/components/author/WorkGrid";
import TopBar from "@/components/TopBar";
import { authorById, authors, authorSlug } from "@/data/authors";
import { allBooks } from "@/data/books";

export function generateStaticParams() {
  return authors.map((a) => ({ authorId: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await params;
  const author = authorById(authorId);
  if (!author) return { title: "Author not found" };
  return {
    title: `${author.name} — E-reader portal`,
    description: author.bio.slice(0, 155),
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await params;
  const author = authorById(authorId);
  if (!author) notFound();

  // Anything of theirs we actually carry.
  const inCatalog = allBooks.filter((b) => authorSlug(b.author) === author.id);

  return (
    <>
      <TopBar />

      <main className="mx-auto max-w-[1100px] flex-1 px-4 pb-20 pt-8 sm:px-6">
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-cream"
        >
          ← Catalog
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-8">
          <AuthorPortrait author={author} />

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {author.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {author.nationality} · {author.lived}
            </p>

            <p className="mt-5 leading-relaxed text-cream/85">{author.bio}</p>
            <p className="mt-4 leading-relaxed text-cream/75">{author.style}</p>

            {inCatalog.length > 0 && (
              <div className="mt-6 rounded-xl border border-line bg-ink-soft p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass/70">
                  In the catalog
                </p>
                <ul className="mt-2 space-y-1">
                  {inCatalog.map((book) => (
                    <li key={book.id}>
                      <Link
                        href={`/read/${book.id}`}
                        className="text-sm transition hover:text-brass"
                      >
                        {book.title}{" "}
                        <span className="text-muted">({book.year})</span> →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <WorkGrid
          heading="Other works"
          id="other-works"
          authorId={author.id}
          authorName={author.name}
          items={author.works}
        />

        <WorkGrid
          heading="Short stories"
          id="short-stories"
          authorId={author.id}
          authorName={author.name}
          items={author.stories ?? []}
        />
      </main>
    </>
  );
}
