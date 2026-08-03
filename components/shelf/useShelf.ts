"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * What the reader has done with a work. Kept in localStorage so a shelf
 * survives a reload without needing accounts or a server.
 */
export type ShelfStatus = "read" | "reading" | "planned";

export type ShelfEntry = {
  status?: ShelfStatus;
  /** Last chapter opened, for picking up where you left off. */
  chapter?: number;
  /** 0-100 through the whole work. */
  percent?: number;
  /** When the status was last changed. */
  updatedAt?: number;
};

export type ShelfState = Record<string, ShelfEntry>;

const KEY = "shelf-v1";
const EMPTY: ShelfState = {};

const listeners = new Set<() => void>();
let snapshot: ShelfState | null = null;

function read(): ShelfState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ShelfState;
    return parsed && typeof parsed === "object" ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function write(next: ShelfState) {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Out of quota or blocked — the in-memory shelf still works this session.
  }
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  // Another tab changing the shelf should update this one.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      snapshot = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ShelfState {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

// The server has no localStorage, so it renders an empty shelf and React swaps
// the stored one in straight after hydration.
function getServerSnapshot(): ShelfState {
  return EMPTY;
}

export function useShelf() {
  const shelf = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** Set a status, or clear it by passing the one already set. */
  const setStatus = useCallback((id: string, status: ShelfStatus) => {
    const current = getSnapshot();
    const existing = current[id] ?? {};
    const next = { ...current };

    if (existing.status === status) {
      // Pressing the active button clears it, but the reading position stays.
      const rest = { ...existing };
      delete rest.status;
      if (Object.keys(rest).length === 0) delete next[id];
      else next[id] = rest;
    } else {
      next[id] = { ...existing, status, updatedAt: Date.now() };
    }
    write(next);
  }, []);

  /** Remember where the reader got to, for the progress bar on the shelf. */
  const recordProgress = useCallback(
    (id: string, chapter: number, percent: number) => {
      const current = getSnapshot();
      const existing = current[id];
      // Only track position for works that are actually shelved.
      if (!existing?.status) return;
      write({ ...current, [id]: { ...existing, chapter, percent } });
    },
    [],
  );

  return { shelf, setStatus, recordProgress };
}

/** Ids with a given status, most recently changed first. */
export function idsByStatus(shelf: ShelfState, status: ShelfStatus) {
  return Object.entries(shelf)
    .filter(([, e]) => e.status === status)
    .sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0))
    .map(([id]) => id);
}

