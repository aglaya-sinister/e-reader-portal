"use client";

import { useCallback, useSyncExternalStore } from "react";
import { BASE_LANG, isLangCode, type LangCode } from "@/lib/languages";

/**
 * The reading language, remembered across books the way the theme is.
 *
 * It is a preference, not a promise: most works exist only in English, so the
 * reader treats this as "use it where it exists" and falls back to the base
 * language everywhere else.
 */

const STORAGE_KEY = "reader-lang";

const listeners = new Set<() => void>();
let snapshot: LangCode | null = null;

function readStored(): LangCode {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved && isLangCode(saved) ? saved : BASE_LANG;
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

function getSnapshot(): LangCode {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

// The server has no localStorage, so it always renders the base language and
// React swaps in the stored one right after hydration.
function getServerSnapshot(): LangCode {
  return BASE_LANG;
}

export function usePreferredLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPreferredLang = useCallback((next: LangCode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    snapshot = next;
    emit();
  }, []);

  return [lang, setPreferredLang] as const;
}
