"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchEntries, type SearchEntry } from "@/data/search";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const KIND_LABEL: Record<SearchEntry["kind"], string> = {
  author: "Author",
  book: "Book",
  work: "Work",
  story: "Story",
};

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchEntries(query, 8), [query]);

  // Close when focus or a click goes elsewhere.
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[active];
      if (chosen) go(chosen.href);
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-2xl" role="search">
      <label htmlFor="site-search" className="sr-only">
        Search the catalog
      </label>
      <input
        id="site-search"
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="search-results"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="search for…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-full border border-line bg-ink-soft pl-5 pr-12 text-sm text-cream placeholder:text-muted/70 focus:border-brass/60 focus:outline-none focus:ring-1 focus:ring-brass/40"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
        <SearchIcon />
      </span>

      {showPanel && (
        <div
          id="search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-ink-soft shadow-2xl shadow-black/60"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              Nothing matches “{query.trim()}”.
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={`flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition ${
                      i === active ? "bg-white/5" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-cream">
                      {r.title}
                    </span>
                    <span className="shrink-0 truncate text-xs text-muted">
                      {r.subtitle}
                    </span>
                    <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                      {KIND_LABEL[r.kind]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && (
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="w-full border-t border-line px-4 py-2 text-left text-xs text-brass/80 transition hover:bg-white/5 hover:text-brass"
            >
              See all results for “{query.trim()}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
