"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildParagraphs, type ChapterMeta } from "@/data/chapters";
import type { Readable } from "@/data/library";
import { BASE_LANG, languageLabel, type LangCode } from "@/lib/languages";
import ShelfButtons from "../shelf/ShelfButtons";
import { useShelf } from "../shelf/useShelf";
import ChapterRail from "./ChapterRail";
import { withEmphasis } from "./emphasis";
import { themeOrder, themes } from "./themes";
import { usePreferredLang } from "./useReaderLang";
import { useReaderTheme } from "./useReaderTheme";

type Source = {
  gutenbergId: number;
  url: string;
  volumes: number[] | null;
};

export default function ReaderShell({
  item: book,
  chapters: initialChapters,
  initialParagraphs,
  isRealText,
  source: initialSource,
  languages,
}: {
  item: Readable;
  chapters: ChapterMeta[];
  initialParagraphs: string[];
  isRealText: boolean;
  source: Source | null;
  /** Every language this work has a text for; one entry means no switcher. */
  languages: LangCode[];
}) {
  const [themeKey, chooseTheme] = useReaderTheme();
  const [preferredLang, setPreferredLang] = usePreferredLang();
  const { recordProgress } = useShelf();
  const [railOpen, setRailOpen] = useState(true);
  const [barOpen, setBarOpen] = useState(true);
  const [current, setCurrent] = useState(0);
  const [scrollFraction, setScrollFraction] = useState(0);

  // The server always renders the base language; a stored preference for
  // another one is applied after hydration, and only where it exists.
  const [lang, setLang] = useState<LangCode>(BASE_LANG);
  const [chapters, setChapters] = useState(initialChapters);
  const [source, setSource] = useState(initialSource);

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

  // Last percentage written to the shelf, so scrolling does not write on every
  // pixel — only when the figure actually changes.
  const lastSavedRef = useRef(-1);

  useEffect(() => {
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const fraction = scrollable > 0 ? window.scrollY / scrollable : 1;
      setScrollFraction(fraction);

      // Save where the reader actually is, not where the chapter began. Saving
      // only on chapter change left a finished book stuck at the percentage of
      // its last chapter's first line.
      if (!totalWords) return;
      const read = wordsBefore + fraction * chapters[current].wordCount;
      const pct = Math.min(100, Math.round((read / totalWords) * 100));
      if (Math.abs(pct - lastSavedRef.current) >= 1) {
        lastSavedRef.current = pct;
        recordProgress(book.id, current, pct);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [book.id, chapters, current, recordProgress, totalWords, wordsBefore]);

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

  const goToChapter = useCallback(
    (index: number) => {
      setCurrent(index);
      setScrollFraction(0);
      lastSavedRef.current = percentAt(index);
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
      fetch(
        `/api/chapter?id=${encodeURIComponent(book.id)}&n=${index}&lang=${lang}`,
      )
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
    [book.id, isRealText, lang, percentAt, recordProgress],
  );

  /**
   * Swap edition. The chapter list comes back with the prose because the two
   * editions rarely divide alike — Dumas in French runs to different chapter
   * counts than the Victorian translations — so the rail has to be rebuilt, and
   * the server clamps the position to something that exists in the new one.
   */
  const switchLang = useCallback(
    (next: LangCode) => {
      if (next === lang || !languages.includes(next)) return;

      const token = ++requestRef.current;
      setLang(next);
      setPreferredLang(next);
      setLoading(true);

      fetch(
        `/api/edition?id=${encodeURIComponent(book.id)}&lang=${next}&n=${current}`,
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(
          (data: {
            chapters: ChapterMeta[];
            index: number;
            paragraphs: string[];
            source: Source | null;
          }) => {
            if (token !== requestRef.current) return;
            setChapters(data.chapters);
            setCurrent(data.index);
            setParagraphs(data.paragraphs);
            setSource(data.source);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: "auto" });
          },
        )
        .catch(() => {
          if (token !== requestRef.current) return;
          // Leave the reader on the edition it already had rather than on a
          // blank page.
          setLang(lang);
          setLoading(false);
        });
    },
    [book.id, current, lang, languages, setPreferredLang],
  );

  /**
   * Apply a language chosen while reading something else, once, on arrival.
   *
   * Deliberately not routed through switchLang: that sets state the moment it
   * is called, which inside an effect means a second render before the fetch
   * has even left. Here nothing changes until the edition is in hand, so the
   * page renders English once and then swaps, rather than flickering through a
   * loading state on every load.
   */
  const appliedPreference = useRef(false);
  useEffect(() => {
    if (appliedPreference.current) return;
    // Nothing to do — and importantly, no latching either. On the hydration
    // render the stored preference is not readable yet (the store hands back
    // the server's value), so claiming it had been applied here would settle
    // for English one render before the real answer arrives.
    if (preferredLang === lang || !languages.includes(preferredLang)) return;
    appliedPreference.current = true;

    const token = ++requestRef.current;
    fetch(`/api/edition?id=${encodeURIComponent(book.id)}&lang=${preferredLang}&n=0`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(
        (data: {
          chapters: ChapterMeta[];
          index: number;
          paragraphs: string[];
          source: Source | null;
        }) => {
          if (token !== requestRef.current) return;
          setLang(preferredLang);
          setChapters(data.chapters);
          setCurrent(data.index);
          setParagraphs(data.paragraphs);
          setSource(data.source);
        },
      )
      .catch(() => {
        // Stay on the English text already rendered.
      });
  }, [book.id, lang, languages, preferredLang]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* The only way back once the bar is hidden. It has to sit outside the
          header and stay mounted, or hiding the bar while the chapter rail is
          also hidden would leave the reader with no controls at all. */}
      {!barOpen && (
        <button
          type="button"
          onClick={() => setBarOpen(true)}
          aria-label="Show toolbar"
          aria-expanded={false}
          title="Show toolbar"
          className="fixed right-3 top-3 z-50 grid h-8 w-8 place-items-center rounded-md border text-xs opacity-40 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:opacity-100"
          style={{
            borderColor: theme.rule,
            color: theme.muted,
            backgroundColor: `color-mix(in srgb, ${theme.bg} 80%, transparent)`,
          }}
        >
          ⌄
        </button>
      )}

      {/* ---- header: title — author, and the three reading themes ---- */}
      {barOpen && (
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

        <div className="mx-auto flex min-w-0 items-center gap-3">
          <h1 className="truncate text-sm sm:text-base">
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

          {/* Only worth showing where there is something to switch to. */}
          {languages.length > 1 && (
            <div
              className="flex shrink-0 items-center overflow-hidden rounded-md border"
              style={{ borderColor: theme.rule }}
              role="radiogroup"
              aria-label="Reading language"
            >
              {languages.map((code) => {
                const meta = languageLabel(code);
                const on = code === lang;
                return (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`Read in ${meta.label}`}
                    title={meta.endonym}
                    disabled={loading}
                    onClick={() => switchLang(code)}
                    className="px-2 py-1 text-[11px] tracking-wide transition disabled:opacity-50"
                    style={{
                      backgroundColor: on ? theme.accent : "transparent",
                      color: on ? theme.bg : theme.muted,
                    }}
                  >
                    {meta.short}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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

        <button
          type="button"
          onClick={() => setBarOpen(false)}
          aria-label="Hide toolbar"
          aria-expanded={true}
          title="Hide toolbar"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs opacity-70 transition hover:opacity-100 focus:outline-none focus-visible:ring-2"
          style={{ color: theme.muted }}
        >
          ⌃
        </button>
      </header>
      )}

      <ChapterRail
        chapters={chapters}
        current={current}
        open={railOpen}
        barOpen={barOpen}
        theme={theme}
        onSelect={goToChapter}
        onClose={() => setRailOpen(false)}
      />

      {/* ---- the page itself ---- */}
      <main
        // Only the left gap is animated. `transition-[padding]` covered every
        // edge, and with the top gap in the same shorthand the text would not
        // move up when the toolbar was hidden — it sat at the header's offset
        // with nothing above it.
        className={`pr-6 pb-24 transition-[padding-left] ${
          railOpen ? "pl-22" : "pl-6"
        }`}
        // Inline rather than a utility class: the gap has to clear the fixed
        // header when it is showing and only the floating reveal button when it
        // is not, and this file already sets everything theme-dependent inline.
        style={{ paddingTop: barOpen ? "7rem" : "3.5rem" }}
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
              {languages.length > 1 && `${languageLabel(lang).endonym} · `}
              Text from{" "}
              {/* Editions assembled from several volumes credit each one. */}
              {(source.volumes ?? [source.gutenbergId]).map((gid, i, all) => (
                <span key={gid}>
                  <a
                    href={`https://www.gutenberg.org/ebooks/${gid}`}
                    className="underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Project Gutenberg #{gid}
                  </a>
                  {i < all.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
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
