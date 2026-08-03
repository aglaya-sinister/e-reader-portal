export type ThemeKey = "black" | "beige" | "white";

export type ReaderTheme = {
  key: ThemeKey;
  label: string;
  /** swatch fill shown in the picker */
  swatch: string;
  bg: string;
  text: string;
  muted: string;
  rule: string;
  accent: string;
  /**
   * Fill colour of the progress bar. Kept separate from `accent` so the bar can
   * stay quiet and out of the reader's way while the accent still marks the
   * current chapter and the selected theme.
   */
  progress: string;
  /** chip background for the chapter rail */
  chip: string;
};

export const themes: Record<ThemeKey, ReaderTheme> = {
  black: {
    key: "black",
    label: "Black",
    swatch: "#141414",
    bg: "#111110",
    text: "#d6cec2",
    muted: "#8b8175",
    rule: "#2c2825",
    accent: "#d9a441",
    progress: "#5b554d",
    chip: "#1b1a18",
  },
  beige: {
    key: "beige",
    label: "Beige",
    swatch: "#e3d5b8",
    bg: "#e8dcc3",
    text: "#2e2617",
    muted: "#7a6c53",
    rule: "#cbbb99",
    accent: "#8a5a1e",
    progress: "#9b8c6f",
    chip: "#ddcfb2",
  },
  white: {
    key: "white",
    label: "White",
    swatch: "#ffffff",
    bg: "#fcfcfb",
    text: "#1c1a17",
    muted: "#736e66",
    rule: "#e2ded6",
    accent: "#9a6b1c",
    progress: "#b6b1a8",
    chip: "#f1efea",
  },
};

export const themeOrder: ThemeKey[] = ["black", "beige", "white"];
