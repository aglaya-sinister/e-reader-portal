import { notFound } from "next/navigation";
import ReaderShell from "@/components/reader/ReaderShell";
import { buildParagraphs, chapterMetaFor } from "@/data/chapters";
import { readableById, readables } from "@/data/library";
import { realChapter, realChapterMeta, textSource } from "@/lib/texts";

export function generateStaticParams() {
  return readables.map((r) => ({ bookId: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const item = readableById(bookId);
  if (!item) return { title: "Not found" };
  return { title: `${item.title} — ${item.author}` };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const item = readableById(bookId);
  if (!item) notFound();

  // Real text where we have it; the placeholder generator where we do not.
  const real = realChapterMeta(item.id);
  const chapters =
    real ??
    chapterMetaFor(item.id, item.chapters, item.chapterTitles, item.chapterUnit);

  const initialParagraphs =
    realChapter(item.id, 0) ?? buildParagraphs(`${item.id}:0`);

  return (
    <ReaderShell
      item={item}
      chapters={chapters}
      initialParagraphs={initialParagraphs}
      isRealText={real !== null}
      source={textSource(item.id)}
    />
  );
}
