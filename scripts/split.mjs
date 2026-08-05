/** Chapter-splitting strategies shared by the ingest scripts. */

export const fold = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function stripBoilerplate(raw) {
  let t = raw.replace(/\r\n/g, "\n");
  const start = t.match(
    /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i,
  );
  if (start) t = t.slice(start.index + start[0].length);
  const end = t.match(
    /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i,
  );
  if (end) t = t.slice(0, end.index);
  return t.trim();
}

const ROMAN_RE = /^[IVXLCDM]+$/;

function romanToInt(r) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let n = 0;
  for (let i = 0; i < r.length; i++) {
    const cur = v[r[i]];
    const next = v[r[i + 1]] || 0;
    n += cur < next ? -cur : cur;
  }
  return n;
}

// French numbers its opening chapter in words — "CHAPITRE PREMIER" — and then
// reverts to numerals, so without this the first chapter of every French volume
// is lost into the front matter.
const WORD_NUMERALS = { premier: 1, première: 1, i: 1 };

const toNumber = (s) => {
  const word = WORD_NUMERALS[fold(s)];
  if (word && !ROMAN_RE.test(s)) return word;
  return ROMAN_RE.test(s) ? romanToInt(s) : parseInt(s, 10);
};

function titleCase(s) {
  const small = /^(a|an|and|as|at|but|by|for|in|nor|of|on|or|the|to|up|with)$/i;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && small.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ")
    .replace(/\bMr\b/g, "Mr")
    .trim();
}

/**
 * Headings like "CHAPTER IV", "Letter 3", "EPILOGUE".
 * Case-sensitive on purpose: matching /part/i turns any line beginning with
 * the word "part" into a chapter heading.
 */
const UNITS =
  "CHAPTER|Chapter|LETTER|Letter|PART|Part|EPILOGUE|Epilogue|PROLOGUE|Prologue|CONCLUSION|Conclusion|" +
  // French, for originals read alongside their translation.
  "CHAPITRE|Chapitre|LETTRE|Lettre|PARTIE|Partie|ÉPILOGUE|Épilogue|PROLOGUE|Prologue";

function unitMarks(text) {
  // A number is required when a title follows on the same line — that is what
  // keeps ordinary prose beginning "Part of the crew…" from matching.
  const re = new RegExp(
    `^[ \\t]*(${UNITS})[ \\t]+([IVXLCDM]+|\\d{1,3}|PREMIER|Premier|PREMIÈRE|Première)[ \\t]*[.:—–-]?[ \\t]*([^\\n]{0,70})$`,
    "gm",
  );
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const unit = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
    const inline = (m[3] || "").trim().replace(/\.$/, "");
    out.push({
      at: m.index,
      end: m.index + m[0].length,
      unit,
      num: toNumber(m[2]),
      inline: inline || undefined,
    });
  }
  return out;
}

/**
 * Standalone "Epilogue" / "Prologue" / "Preface" lines. Merged into whichever
 * strategy wins, since a book numbering its chapters still names these.
 */
function namedSectionMarks(text) {
  const re = /^[ \t]*(EPILOGUE|Epilogue|PROLOGUE|Prologue|PREFACE|Preface|CONCLUSION|Conclusion|ÉPILOGUE|Épilogue|PRÉFACE|Préface|AVANT-PROPOS|Avant-propos)[ \t]*\.?[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      at: m.index,
      end: m.index + m[0].length,
      unit: m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(),
      num: null,
    });
  }
  return out;
}

/** Headings that are a bare roman numeral or number on their own line. */
function bareNumberMarks(text, unitLabel = "Chapter") {
  const re = /^[ \t]*([IVXLCDM]+|\d{1,3})[ \t]*\.?[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      at: m.index,
      end: m.index + m[0].length,
      unit: unitLabel,
      num: toNumber(m[1]),
    });
  }
  return out;
}

/**
 * Headings that are a numeral and a title on one line, with no unit word:
 * "I. Le fantôme de Richelieu". Standard in French editions, which often print
 * no "CHAPITRE" at all.
 *
 * Off by default. In English the roman numeral I is also a word, so a wrapped
 * line reading "I. said nothing" would match, and every English text in the
 * catalogue has already been split without it. The numbers must climb — a lone
 * false positive cannot then drag a whole book apart.
 */
function numberedTitleMarks(text, unitLabel = "Chapter") {
  const re = /^[ \t]*([IVXLCDM]+|\d{1,3})[.:—–-][ \t]+(\p{Lu}[^\n]{2,70})$/gmu;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      at: m.index,
      end: m.index + m[0].length,
      unit: unitLabel,
      num: toNumber(m[1]),
      inline: m[2].trim().replace(/\.$/, ""),
    });
  }
  return out;
}

/**
 * Keep the ascending run that ends the text, and nothing before it.
 *
 * A contents block is itself a perfectly ascending 1…n, so the numbering climbs
 * twice over. Walking back from the end keeps the body and leaves the contents
 * behind — where dropTableOfContents cannot help, since it compares headings
 * without regard to position and keeps whichever came last, which for a chapter
 * whose body heading did not match is the contents entry itself.
 */
function lastAscendingRun(marks) {
  const out = [];
  let floor = Infinity;
  for (let i = marks.length - 1; i >= 0; i--) {
    const mk = marks[i];
    if (mk.num == null || mk.num < floor) {
      out.push(mk);
      if (mk.num != null) floor = mk.num;
    }
  }
  return out.reverse();
}

/** All-caps lines used as section titles (Jekyll and Hyde does this). */
function capsTitleMarks(text) {
  // Accented capitals are included so French headings are not cut short at the
  // first É or Ç and rejected for length.
  const re = /^[ \t]*([A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ][A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ' .,’-]{6,68})[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const t = m[1].trim().replace(/\.$/, "");
    if (/^(THE END|CONTENTS|PROJECT GUTENBERG|ILLUSTRATIONS|TRANSCRIBER)/.test(t)) continue;
    out.push({ at: m.index, end: m.index + m[0].length, caps: t });
  }
  return out;
}

/** Gutenberg lists every chapter in a contents block first; keep the last. */
function dropTableOfContents(marks) {
  const key = (m) => (m.caps ? `c:${m.caps}` : `${m.unit} ${m.num}`);
  const lastAt = new Map();
  for (const mk of marks) lastAt.set(key(mk), mk.at);
  return marks.filter((mk) => lastAt.get(key(mk)) === mk.at);
}

/**
 * Drop Gutenberg's producer credit and the title block beneath it.
 *
 * A work that splits into chapters loses this already — the front matter falls
 * outside the first heading, and tidySections discards it. A single unbroken
 * text has no headings to fall outside of, so without this the reader opens
 * "Clarimonde" and is met with "Produced by David Widger".
 *
 * The credit at the very top is the trigger, so a text that does not carry one
 * is returned untouched. Only short blocks that are not sentences go: a title,
 * a byline, a translator, a year.
 */
export function stripFrontMatter(text) {
  if (!/^\s*(Produced by|E-?text prepared by|Transcribed from)/i.test(text)) {
    return text;
  }
  const blocks = text.split(/\n[ \t]*\n+/);
  let i = 0;
  // What actually ends the walk is the first block that reads as a sentence;
  // the count is only a backstop. It allows twelve because the Celebrated
  // Crimes volumes run to nine before the prose starts — credit, title, "By",
  // author, series note, year, CONTENTS, the one contents entry, and then the
  // same title again as the body's own heading.
  while (i < blocks.length && i < 12) {
    const b = blocks[i].trim();
    if (b === "") {
      i++;
      continue;
    }
    const credit = /^(Produced by|E-?text prepared by|Transcribed from)/i.test(b);
    const headingish = b.length <= 80 && !/[.!?]["'”’]?$/.test(b);
    if (!credit && !headingish) break;
    i++;
  }
  return blocks.slice(i).join("\n\n").trim();
}

export function toParagraphs(body) {
  return body
    .split(/\n[ \t]*\n+/)
    .map((p) => p.replace(/\n[ \t]*/g, " ").trim())
    .filter((p) => p.length > 0);
}

function build(text, marks, opts = {}) {
  const chapters = [];
  let counter = 0;

  for (let i = 0; i < marks.length; i++) {
    const mk = marks[i];
    const bodyEnd = i + 1 < marks.length ? marks[i + 1].at : text.length;
    let body = text.slice(mk.end, bodyEnd).trim();

    let label;
    let title;

    if (mk.caps) {
      // Front matter keeps its own name; everything else is numbered.
      if (/^(THE )?PREFACE$/.test(mk.caps)) label = "Preface";
      else if (/^(EPILOGUE|PROLOGUE|CONCLUSION|ETYMOLOGY|EXTRACTS)$/.test(mk.caps))
        label = titleCase(mk.caps);
      else {
        counter += 1;
        label = `${opts.unitLabel ?? "Chapter"} ${counter}`;
        title = titleCase(mk.caps);
      }
    } else {
      label = mk.num != null ? `${mk.unit} ${mk.num}` : mk.unit;

      if (mk.inline) {
        title = /^[A-Z' .,’-]+$/.test(mk.inline) ? titleCase(mk.inline) : mk.inline;
      } else {
        // Otherwise a title may sit on the line after the heading.
        const lines = body.split("\n");
        const first = lines[0].trim();
        // A trailing full stop normally means prose, not a heading — except in
        // French editions, which punctuate their titles ("Marseille.--L'arrivée.").
        // Left off by default so the English texts split exactly as before.
        const endsLikeProse = opts.titleMayEndWithPeriod
          ? /[!?"”]$/.test(first)
          : /[.!?"”]$/.test(first);
        if (first && first.length < 70 && !endsLikeProse && lines[1]?.trim() === "") {
          title = /^[A-Z' .,’-]+$/.test(first) ? titleCase(first) : first;
          body = lines.slice(1).join("\n").trim();
        }
      }
    }

    chapters.push({ label, title, paragraphs: toParagraphs(body) });
  }
  return chapters.filter((c) => c.paragraphs.length > 0);
}

const bodyLength = (c) => c.paragraphs.join(" ").length;

/**
 * Repair the two ways a heading-based split goes wrong on real volumes:
 *
 *  - A tale's title is followed by a dedication line ("TO MARGARET…"), so the
 *    title ends up an empty section and the text sits under the dedication.
 *    Merge them, keeping the title.
 *  - Title pages leave fragments ("BY", the author's name) as sections of
 *    their own. Drop anything with no real body.
 */
function tidySections(chapters, strategy, unitLabel = "Chapter") {
  const out = [];

  for (let i = 0; i < chapters.length; i++) {
    const cur = chapters[i];
    const next = chapters[i + 1];

    if (bodyLength(cur) < 200 && next && bodyLength(next) >= 1000) {
      out.push({
        label: cur.label,
        // The first heading is the real title; the second is the dedication.
        title: cur.title ?? next.title,
        paragraphs: next.paragraphs,
      });
      i++; // consumed
      continue;
    }
    if (bodyLength(cur) < 200) continue; // stray front or back matter
    out.push(cur);
  }

  // A first section a fraction of the size of the rest is a title page or a
  // cast list, not a chapter. Compared against the median so a genuinely short
  // opening letter or prologue is kept.
  while (out.length >= 2) {
    const rest = out.slice(1).map(bodyLength).sort((a, b) => a - b);
    const median = rest[Math.floor(rest.length / 2)];
    if (bodyLength(out[0]) >= median * 0.12) break;
    out.shift();
  }

  // Caps-derived numbering is positional, so it has to be redone after merges.
  if (strategy === "caps") {
    let n = 0;
    for (const c of out) {
      if (/^(Preface|Epilogue|Prologue|Conclusion|Etymology|Extracts)$/.test(c.label)) {
        continue;
      }
      n += 1;
      c.label = `${unitLabel} ${n}`;
    }
  }

  return out;
}

const ACT_TITLE =
  /^(?:(?:First|Second|Third|Fourth|Fifth)\s+Act|Act\s+(?:[IVX]+|\d+|One|Two|Three|Four|Five))$/i;

/**
 * Plays divide into acts, but an all-caps character name reads exactly like a
 * heading — so an act gets chopped at the first speaker whose name stands
 * alone, and the title page becomes sections of its own.
 *
 * Where two or more acts are found: drop everything before the first act, and
 * fold any non-act section back into the act it belongs to.
 */
function mergePlayActs(chapters) {
  const isAct = (c) => ACT_TITLE.test((c.title ?? c.label ?? "").trim());
  if (chapters.filter(isAct).length < 2) return chapters;

  const acts = [];
  for (const c of chapters) {
    if (isAct(c)) {
      acts.push({ label: `Act ${acts.length + 1}`, paragraphs: [...c.paragraphs] });
    } else if (acts.length > 0) {
      // A fragment after an act heading is a continuation of that act.
      acts[acts.length - 1].paragraphs.push(...c.paragraphs);
    }
    // Anything before the first act is front matter, and is dropped.
  }
  return acts;
}

export function splitChapters(text, expect, opts = {}) {
  const named = dropTableOfContents(namedSectionMarks(text));

  const strategies = [
    ["unit", unitMarks],
    ["bare", (t) => bareNumberMarks(t, opts.unitLabel)],
    ["caps", capsTitleMarks],
  ];
  // Only offered where it has been asked for; see numberedTitleMarks.
  if (opts.numberedTitles) {
    strategies.push(["numbered", (t) => numberedTitleMarks(t, opts.unitLabel)]);
  }

  const candidates = [];
  for (const [name, fn] of strategies) {
    // The numbered strategy sheds its contents block by position rather than by
    // heading text, so it skips dropTableOfContents entirely.
    const base =
      name === "numbered" ? lastAscendingRun(fn(text)) : dropTableOfContents(fn(text));
    // Fold in Epilogue/Prologue/Preface, skipping any the strategy already has.
    const extra = named.filter(
      (n) => !base.some((b) => Math.abs(b.at - n.at) < 4),
    );
    const marks = [...base, ...extra].sort((a, b) => a.at - b.at);
    if (marks.length < 2) continue;
    const chapters = mergePlayActs(
      tidySections(build(text, marks, opts), name, opts.unitLabel),
    );
    if (chapters.length < 2) continue;
    const lengths = chapters
      .map((c) => c.paragraphs.join(" ").length)
      .sort((a, b) => a - b);
    const median = lengths[Math.floor(chapters.length / 2)];
    if (median < 400) continue;
    candidates.push({ name, chapters, median });
  }
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (expect) {
      const d =
        Math.abs(a.chapters.length - expect) - Math.abs(b.chapters.length - expect);
      if (d !== 0) return d;
    }
    // Without a known count, prefer the finer split — every strategy here has
    // already cleared the median-length floor, so more divisions means the
    // headings were really found rather than a whole book left in one lump.
    return b.chapters.length - a.chapters.length;
  });
  return candidates[0];
}
