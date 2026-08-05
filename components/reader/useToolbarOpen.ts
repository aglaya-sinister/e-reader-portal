"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the reader's top bar is showing, remembered across books the way the
 * theme and the reading language are.
 *
 * The chapter rail deliberately does not persist — it is opened and closed
 * while hunting for a chapter. Putting the bar away is a choice about how to
 * read, and having it come back at every book undoes the point of it.
 */

const STORAGE_KEY = "reader-toolbar";
const DEFAULT = true;

const listeners = new Set<() => void>();
let snapshot: boolean | null = null;

function readStored(): boolean {
  // Only an explicit "hidden" closes it; anything unset or unrecognised opens.
  return window.localStorage.getItem(STORAGE_KEY) !== "hidden";
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  // Keep other tabs in step with the choice made here.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      snapshot = readStored();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): boolean {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

// The server has no localStorage, so it always renders the bar and React hides
// it again right after hydration.
function getServerSnapshot(): boolean {
  return DEFAULT;
}

export function useToolbarOpen() {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setOpen = useCallback((next: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, next ? "shown" : "hidden");
    snapshot = next;
    emit();
  }, []);

  return [open, setOpen] as const;
}
