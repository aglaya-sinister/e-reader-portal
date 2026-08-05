# Text pipeline

The reader serves real public-domain texts from Project Gutenberg. Those texts
live in `content/texts/` (one JSON file per work) and **are committed**, so a
deployed build serves real books. These scripts regenerate them.

Anything without an ingested text falls back to clearly-marked placeholder
prose, so the site works with `content/texts/` empty.

## Regenerating everything

```bash
npm run texts:books        # the 10 catalog books
npm run texts:works        # author works, searched by title + author
npm run texts:collections  # short stories extracted from their parent volumes
npm run texts:fr           # the French Dumas originals
npm run texts:verify       # confirm each file is the work it claims to be
```

Run them in that order. All the fetch scripts are throttled and safe to
re-run; each rewrites only the works in its manifest.

## Languages

English is the base text, `content/texts/<id>.json`. Any other language is a
sibling file, `<id>.<lang>.json`, and the reader shows a switcher beside the
title for works that have one. `lib/languages.ts` lists the codes.

`ingest-translations.mjs` fetches them. Unlike the English scripts it **pins**
Gutenberg IDs instead of searching — a title search in another language matches
far too loosely. Where a work was only ever published in volumes, list them all
in `gutenbergIds` and they are joined into one book with chapters renumbered
from one.

It also turns on two splitting behaviours the English texts do not use, so
their existing output cannot shift:

- **numbered titles** — French editions often print no "CHAPITRE" at all, just
  `I. Le fantôme de Richelieu`. Enabling that pattern for English would match a
  wrapped line beginning "I."
- **titles ending in a full stop** — `Marseille.--L'arrivée.` is a heading, not
  prose.

Both are described in `split.mjs`. Downloads are checked for function words in
the target language first, so a mistyped ID cannot file the English edition
under a French name.

## Why there are three fetch scripts

**`ingest-works.mjs`** — for anything with its own Gutenberg entry. Searches
by title + author, downloads the plain text, strips the licence header, and
splits it into chapters.

**`extract-collection.mjs`** — for short stories that have *no* standalone
entry because they were published inside a volume (*New Arabian Nights*,
*The Piazza Tales*). Finds each story's heading in the collection and slices
between them. Needs `boundaries` in the manifest: the titles of neighbouring
pieces, without which the last slice runs to the end of the file and swallows
everything after it.

**`extract-sections.mjs`** — same goal, different method: splits the whole
volume with the normal splitter and matches story titles against the sections
it finds. More reliable when the volume's headings are clean.

## Chapter splitting

`split.mjs` is shared. It tries three strategies — numbered units
(`CHAPTER IV`), bare numerals on their own line, and all-caps titles — and
keeps whichever yields the most plausible divisions, preferring a known
expected count when the manifest supplies one.

Hard-won details, each of which produced visibly wrong output before it was
fixed:

- Heading matching is **case-sensitive**. Matching `/part/i` turns every line
  of prose beginning "Part of the crew…" into a chapter.
- Gutenberg lists every chapter in a table of contents first, so each heading
  appears twice. Only the last occurrence is kept.
- A title-only heading followed by a dedication line ("TO MARGARET…") leaves
  the real title as an empty section with the text under the dedication. Those
  are merged, keeping the title.
- Records exist for audio and alternate editions that expose a stub text file.
  Downloads under 15k characters are rejected and the next candidate tried.

## Manifests

- `manifests/books.json` — the 10 catalog books, with pinned Gutenberg IDs and
  expected chapter counts used to validate the split.
- `manifests/works.json` — generated from `data/authors.ts` by
  `make-works-manifest.mjs`. Regenerate after adding an author work.
- `manifests/collections.json` — story-to-volume mapping for collection
  extraction.

## Images

```bash
npm run art:fetch        # card backdrop paintings -> public/artwork
npm run portraits:fetch  # author portraits -> public/authors
```

These *are* committed (~12 MB), since they change rarely and are chosen by
hand. Re-run only if you change the selections in `data/books.ts` or
`data/authors.ts`.
