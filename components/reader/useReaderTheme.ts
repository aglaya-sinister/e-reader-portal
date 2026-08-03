"use client";

import { useCallback, useSyncExternalStore } from "react";
import { themes, type ThemeKey } from "./themes";

const STORAGE_KEY = "reader-theme";
const DEFAULT: ThemeKey = "black";

const listeners = new Set<() => void>();
let snapshot: ThemeKey | null = null;

function readStored(): ThemeKey {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved && saved in themes ? (saved as ThemeKey) : DEFAULT;
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

function getSnapshot(): ThemeKey {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

// The server has no localStorage, so it always renders the default theme and
// React swaps in the stored one right after hydration.
function getServerSnapshot(): ThemeKey {
  return DEFAULT;
}

export function useReaderTheme() {
  const themeKey = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setThemeKey = useCallback((key: ThemeKey) => {
    window.localStorage.setItem(STORAGE_KEY, key);
    snapshot = key;
    emit();
  }, []);

  return [themeKey, setThemeKey] as const;
}
