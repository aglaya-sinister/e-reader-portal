# Text pipeline

The reader serves real public-domain texts from Project Gutenberg. Those texts
live in `content/texts/` (one JSON file per work) and are **not committed** —
they are ~30 MB of derived data. These scripts regenerate them.

Anything without an ingested text falls back to clearly-marked placeholder
prose, so the site works with `content/texts/` empty.

## Regenerating everything

```bash
npm run texts:books        # the 10 catalog books
npm run texts:works        # author works, searched by title + author
npm run texts:collections  # short stories extracted from their parent volumes
npm run texts:verify       # confirm each file is the work it claims to be
```

Run them in that order. All three fetch scripts are throttled and safe to
re-run; each rewrites only the works in its manifest.

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
