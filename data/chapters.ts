/**
 * Chapter structure and placeholder body text.
 *
 * The DIVISIONS here are real: each catalog book is split the way the actual
 * book is split, including its letters, prologues and epilogues. Only the prose
 * inside them is filler — see `sentencePool`.
 *
 * Chapters carry no invented titles. Most nineteenth-century novels number
 * their chapters and leave them unnamed; where a book genuinely titles them
 * (Jekyll and Hyde) the real titles are used.
 */

export type Segment = {
  /** "Chapter", "Letter", "Part", "Prologue", "Epilogue"… */
  unit: string;
  count: number;
  /** Real titles, where the work has them. */
  titles?: string[];
};

export type ChapterMeta = {
  /** 0-based position across the whole work. */
  index: number;
  /** "Chapter 12", "Letter 3", "Epilogue" */
  label: string;
  title?: string;
  wordCount: number;
};

export type Chapter = ChapterMeta & { paragraphs: string[] };

/** PLACEHOLDER PROSE — replace when real text is available. */
const sentencePool = [
  "The morning came in grey over the water, and for a long while nobody spoke of it.",
  "He had promised himself he would not go back to the house before the thaw.",
  "There is a particular silence to a room that has been recently argued in.",
  "She counted the lamps along the quay as though the number might mean something.",
  "Whatever had been decided in that letter, it was not decided kindly.",
  "The road bent twice and then gave up the pretence of going anywhere at all.",
  "It is easy, afterwards, to describe a thing as inevitable.",
  "Rain had got into the seams of the coat and stayed there like a grudge.",
  "He listened to the clock and disliked it for continuing.",
  "The town kept its opinions in the windows rather than in the mouths of its people.",
  "Nothing in the account she gave was untrue, and none of it was the truth.",
  "By the third day the arrangement had hardened into a habit.",
  "A gull went over, low, and the whole afternoon seemed to turn with it.",
  "He wrote the name down and then sat looking at his own handwriting.",
  "The fire had burned to the stage where it asks to be either fed or abandoned.",
  "They walked as far as the bridge and found they had nothing further to say.",
  "Some houses are built to be lived in; that one had been built to be left.",
  "The question was not whether he believed her, but what believing her would cost.",
  "Snow lay in the furrows and made a map of work that had been done in autumn.",
  "She had the trick of making a refusal sound like an invitation to try again.",
  "Papers, string, a key that fitted nothing, and a receipt from a shop long closed.",
  "In the end the argument was settled by the weather rather than by either of them.",
];

/**
 * Real divisions of the catalog books.
 *
 * Frankenstein follows the 1831 text (four letters, twenty-four chapters); the
 * 1818 first edition runs to twenty-three.
 */
const structures: Record<string, Segment[]> = {
  frankenstein: [
    { unit: "Letter", count: 4 },
    { unit: "Chapter", count: 24 },
  ],
  "dorian-gray": [{ unit: "Chapter", count: 20 }],
  "moby-dick": [
    { unit: "Chapter", count: 135 },
    { unit: "Epilogue", count: 1 },
  ],
  dracula: [{ unit: "Chapter", count: 27 }],
  "jekyll-hyde": [
    {
      unit: "Chapter",
      count: 10,
      titles: [
        "Story of the Door",
        "Search for Mr Hyde",
        "Dr Jekyll Was Quite at Ease",
        "The Carew Murder Case",
        "Incident of the Letter",
        "Remarkable Incident of Doctor Lanyon",
        "Incident at the Window",
        "The Last Night",
        "Dr Lanyon's Narrative",
        "Henry Jekyll's Full Statement of the Case",
      ],
    },
  ],
  "monte-cristo": [{ unit: "Chapter", count: 117 }],
  "three-musketeers": [
    { unit: "Chapter", count: 67 },
    { unit: "Epilogue", count: 1 },
  ],
  "jane-eyre": [{ unit: "Chapter", count: 38 }],
  "heart-of-darkness": [{ unit: "Part", count: 3 }],
  "wuthering-heights": [{ unit: "Chapter", count: 34 }],
};

/** Anything not in `structures` — author works — describes its own divisions. */
export function segmentsFor(
  id: string,
  fallbackChapters = 1,
  titles?: string[],
  unit?: string,
): Segment[] {
  const known = structures[id];
  if (known) return known;
  return [
    {
      unit: unit ?? (fallbackChapters > 1 ? "Chapter" : "Text"),
      count: fallbackChapters,
      titles,
    },
  ];
}

/** Deterministic PRNG so server and client render identical text. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Body text for one chapter. Exported so the client can rebuild the chapter it
 * is showing instead of the server shipping every chapter of Moby-Dick.
 */
export function buildParagraphs(seedKey: string) {
  const rand = mulberry32(hash(seedKey));
  const paragraphCount = 6 + Math.floor(rand() * 4);

  return Array.from({ length: paragraphCount }, () => {
    const sentences = 4 + Math.floor(rand() * 5);
    return Array.from(
      { length: sentences },
      () => sentencePool[Math.floor(rand() * sentencePool.length)],
    ).join(" ");
  });
}

function countWords(paragraphs: string[]) {
  return paragraphs.reduce((n, p) => n + p.split(/\s+/).length, 0);
}

/** Flatten the segments into a numbered list, with word counts for progress. */
export function chapterMetaFor(
  id: string,
  fallbackChapters = 1,
  titles?: string[],
  unit?: string,
): ChapterMeta[] {
  const out: ChapterMeta[] = [];
  let index = 0;

  for (const segment of segmentsFor(id, fallbackChapters, titles, unit)) {
    for (let n = 1; n <= segment.count; n++) {
      out.push({
        index,
        // A lone Epilogue or Prologue is not "Epilogue 1".
        label: segment.count === 1 ? segment.unit : `${segment.unit} ${n}`,
        title: segment.titles?.[n - 1],
        wordCount: countWords(buildParagraphs(`${id}:${index}`)),
      });
      index++;
    }
  }

  return out;
}

/** Full chapter including text — used where the whole thing is wanted. */
export function chaptersFor(id: string, fallbackChapters = 1): Chapter[] {
  return chapterMetaFor(id, fallbackChapters).map((meta) => ({
    ...meta,
    paragraphs: buildParagraphs(`${id}:${meta.index}`),
  }));
}
