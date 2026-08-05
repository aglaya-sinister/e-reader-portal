"use client";

import type { ChapterMeta } from "@/data/chapters";
import type { ReaderTheme } from "./themes";

export default function ChapterRail({
  chapters,
  current,
  open,
  barOpen,
  theme,
  onSelect,
  onClose,
}: {
  chapters: ChapterMeta[];
  current: number;
  open: boolean;
  /** Whether the toolbar is showing, so the rail knows where the page starts. */
  barOpen: boolean;
  theme: ReaderTheme;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  // With 136 chapters the rail scrolls a long way; keep the current one visible.
  const scrollActiveIntoView = (el: HTMLButtonElement | null) =>
    el?.scrollIntoView({ block: "nearest" });

  return (
    <nav
      aria-label="Chapters"
      className={`fixed left-0 bottom-8 z-30 flex w-16 flex-col items-center gap-2 overflow-y-auto border-r py-4 ${
        barOpen ? "top-16" : "top-0"
      }`}
      style={{ borderColor: theme.rule, backgroundColor: theme.bg }}
    >
      {chapters.map((chapter, i) => {
        const active = i === current;
        return (
          <button
            key={chapter.index}
            ref={active ? scrollActiveIntoView : undefined}
            type="button"
            onClick={() => onSelect(i)}
            title={
              chapter.title
                ? `${chapter.label}. ${chapter.title}`
                : chapter.label
            }
            aria-current={active ? "true" : undefined}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border text-[13px] tabular-nums transition focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: active ? theme.accent : theme.rule,
              backgroundColor: active ? theme.accent : theme.chip,
              color: active ? theme.bg : theme.muted,
              fontWeight: active ? 600 : 400,
            }}
          >
            {/* A lone Prologue/Epilogue has no number of its own. */}
            {chapter.label.match(/\d+$/)?.[0] ?? chapter.label.slice(0, 3)}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onClose}
        aria-label="Hide chapter list"
        className="mt-2 grid h-7 w-9 shrink-0 place-items-center rounded-md text-xs transition hover:opacity-100 focus:outline-none focus-visible:ring-2"
        style={{ color: theme.muted, opacity: 0.7 }}
      >
        ‹‹
      </button>
    </nav>
  );
}
