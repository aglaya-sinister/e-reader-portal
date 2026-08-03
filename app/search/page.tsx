import Link from "next/link";
import TopBar from "@/components/TopBar";
import { searchEntries, type SearchEntry } from "@/data/search";

export const metadata = { title: "Search — e-reader-portal" };

const KIND_LABEL: Record<SearchEntry["kind"], string> = {
  author: "Author",
  book: "Book",
  work: "Work",
  story: "Story",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  // Rendered on the server, so a results URL is shareable and works without JS.
  const results = query ? searchEntries(query, 60) : [];

  const groups: SearchEntry["kind"][] = ["author", "book", "work", "story"];

  return (
    <>
      <TopBar />

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 pb-20 pt-8 sm:px-6">
        <Link href="/" className="text-sm text-muted transition hover:text-cream">
          ← Catalog
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {query ? <>Results for “{query}”</> : "Search"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {query
            ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
            : "Type in the box above to search titles, authors and genres."}
        </p>

        {query && results.length === 0 && (
          <p className="mt-8 text-cream/70">
            Nothing matches that. Try an author’s surname, a title, or a genre
            such as <Link href="/tag/gothic" className="text-brass hover:underline">Gothic</Link>.
          </p>
        )}

        {groups.map((kind) => {
          const inGroup = results.filter((r) => r.kind === kind);
          if (inGroup.length === 0) return null;
          return (
            <section key={kind} className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                {KIND_LABEL[kind]}
                {inGroup.length > 1 ? "s" : ""}
              </h2>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-ink-soft">
                {inGroup.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      className="flex items-baseline gap-3 px-4 py-3 transition hover:bg-white/5"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {r.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {r.subtitle}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </>
  );
}
