"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildParagraphs, type ChapterMeta } from "@/data/chapters";
import type { Readable } from "@/data/library";
import ShelfButtons from "../shelf/ShelfButtons";
import { useShelf } from "../shelf/useShelf";
import ChapterRail from "./ChapterRail";
import { withEmphasis } from "./emphasis";
import { themeOrder, themes } from "./themes";
import { useReaderTheme } from "./useReaderTheme";

export default function ReaderShell({
  item: book,
  chapters,
  initialParagraphs,
  isRealText,
  source,
}: {
  item: Readable;
  chapters: ChapterMeta[];
  initialParagraphs: string[];
  isRealText: boolean;
  source: { gutenbergId: number; url: string } | null;
}) {
  const [themeKey, chooseTheme] = useReaderTheme();
  const { recordProgress } = useShelf();
  const [railOpen, setRailOpen] = useState(true);
  const [current, setCurrent] = useState(0);
  const [scrollFraction, setScrollFraction] = useState(0);

  const theme = themes[themeKey];
  const chapter = chapters[current];

  // The server renders chapter one; later chapters are fetched one at a time so
  // a 200,000-word book never crosses the wire whole.
  const [paragraphs, setParagraphs] = useState(initialParagraphs);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  const { wordsBefore, totalWords } = useMemo(() => {
    const total = chapters.reduce((n, c) => n + c.wordCount, 0);
    const before = chapters
      .slice(0, current)
      .reduce((n, c) => n + c.wordCount, 0);
    return { wordsBefore: before, totalWords: total };
  }, [chapters, current]);

  // Progress across the whole book: chapters already behind us, plus how far
  // down the current one we have scrolled.
  const progress = useMemo(() => {
    if (!totalWords) return 0;
    const read = wordsBefore + scrollFraction * chapter.wordCount;
    return Math.min(100, Math.round((read / totalWords) * 100));
  }, [wordsBefore, totalWords, scrollFraction, chapter.wordCount]);

  useEffect(() => {
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollFraction(scrollable > 0 ? window.scrollY / scrollable : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [current]);

  // Percentage at the start of a given chapter, for the saved reading position.
  const percentAt = useCallback(
    (index: number) => {
      const total = chapters.reduce((n, c) => n + c.wordCount, 0);
      if (!total) return 0;
      const before = chapters
        .slice(0, index)
        .reduce((n, c) => n + c.wordCount, 0);
      return Math.round((before / total) * 100);
    },
    [chapters],
  );

  // Remember the work was opened, so it can surface under "recently opened".
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    recordProgress(book.id, 0, 0);
  }, [book.id, recordProgress]);

  const goToChapter = useCallback(
    (index: number) => {
      setCurrent(index);
      setScrollFraction(0);
      recordProgress(book.id, index, percentAt(index));
      window.scrollTo({ top: 0, behavior: "auto" });

      const token = ++requestRef.current;

      // Placeholder prose can be regenerated on the spot; real text has to come
      // from the server.
      if (!isRealText) {
        setParagraphs(buildParagraphs(`${book.id}:${index}`));
        return;
      }

      setLoading(true);
      fetch(`/api/chapter?id=${encodeURIComponent(book.id)}&n=${index}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data: { paragraphs: string[] }) => {
          if (token !== requestRef.current) return; // a later chapter won
          setParagraphs(data.paragraphs);
          setLoading(false);
        })
        .catch(() => {
          if (token !== requestRef.current) return;
          setParagraphs([]);
          setLoading(false);
        });
    },
    [book.id, isRealText, percentAt, recordProgress],
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* ---- header: title — author, and the three reading themes ---- */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm"
        style={{
          borderColor: theme.rule,
          backgroundColor: `color-mix(in srgb, ${theme.bg} 88%, transparent)`,
        }}
      >
        {!railOpen && (
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            aria-label="Show chapter list"
            className="grid h-9 w-9 place-items-center rounded-md border text-xs"
            style={{ borderColor: theme.rule, color: theme.muted }}
          >
            ››
          </button>
        )}

        <Link
          href="/"
          className="text-sm transition hover:opacity-100"
          style={{ color: theme.muted }}
        >
          ← Catalog
        </Link>

        <h1 className="mx-auto truncate text-sm sm:text-base">
          <span className="font-semibold">{book.title}</span>
          <span style={{ color: theme.muted }}> — </span>
          <Link
            href={`/author/${book.authorId}`}
            className="underline-offset-2 hover:underline"
            style={{ color: theme.muted }}
          >
            {book.author}
          </Link>
        </h1>

        <ShelfButtons id={book.id} className="mr-1" />

        <div
          className="flex items-center gap-1.5"
          role="radiogroup"
          aria-label="Reading theme"
        >
          {themeOrder.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={themeKey === key}
              aria-label={`${themes[key].label} theme`}
              onClick={() => chooseTheme(key)}
              className="h-6 w-6 rounded-sm border transition focus:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: themes[key].swatch,
                borderColor: themeKey === key ? theme.accent : theme.rule,
                boxShadow:
                  themeKey === key ? `0 0 0 2px ${theme.accent}55` : undefined,
              }}
            />
          ))}
        </div>
      </header>

      <ChapterRail
        chapters={chapters}
        current={current}
        open={railOpen}
        theme={theme}
        onSelect={goToChapter}
        onClose={() => setRailOpen(false)}
      />

      {/* ---- the page itself ---- */}
      <main
        className={`pr-6 pb-24 pt-28 transition-[padding] ${
          railOpen ? "pl-22" : "pl-6"
        }`}
      >
        <article className="mx-auto max-w-[68ch]">
          {/* Only show the numbered label separately when there is a real
              title to sit under it. */}
          {chapter.title && (
            <p
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: theme.muted }}
            >
              {chapter.label}
            </p>
          )}
          <h2 className="mt-2 font-serif text-3xl leading-tight">
            {chapter.title ?? chapter.label}
          </h2>
          <hr className="mt-5 mb-8" style={{ borderColor: theme.rule }} />

          <div
            className="font-serif text-[1.075rem] leading-[1.85] transition-opacity"
            style={{ opacity: loading ? 0.35 : 1 }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "" : "mt-5 indent-8"}>
                {withEmphasis(p)}
              </p>
            ))}
          </div>

          {source && (
            <p className="mt-10 text-xs" style={{ color: theme.muted }}>
              Text from{" "}
              <a
                href={`https://www.gutenberg.org/ebooks/${source.gutenbergId}`}
                className="underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Project Gutenberg #{source.gutenbergId}
              </a>{" "}
              · public domain
            </p>
          )}

          <div className="mt-12 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => goToChapter(current - 1)}
              className="rounded-md border px-4 py-2 text-sm transition disabled:opacity-30"
              style={{ borderColor: theme.rule, color: theme.text }}
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={current === chapters.length - 1}
              onClick={() => goToChapter(current + 1)}
              className="rounded-md border px-4 py-2 text-sm transition disabled:opacity-30"
              style={{ borderColor: theme.rule, color: theme.text }}
            >
              Next chapter →
            </button>
          </div>
        </article>
      </main>

      {/* ---- progress bar pinned to the bottom edge ---- */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div
          className="px-4 pb-1 text-right text-[11px] tabular-nums"
          style={{ color: theme.muted }}
        >
          {progress}% of the book
        </div>
        <div
          className="h-2 w-full"
          style={{ backgroundColor: theme.chip }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress through the book"
        >
          <div
            className="h-full transition-[width] duration-150"
            style={{ width: `${progress}%`, backgroundColor: theme.progress }}
          />
        </div>
      </div>
    </div>
  );
}
