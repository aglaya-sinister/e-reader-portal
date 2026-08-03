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

const toNumber = (s) => (ROMAN_RE.test(s) ? romanToInt(s) : parseInt(s, 10));

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
  "CHAPTER|Chapter|LETTER|Letter|PART|Part|EPILOGUE|Epilogue|PROLOGUE|Prologue|CONCLUSION|Conclusion";

function unitMarks(text) {
  // A number is required when a title follows on the same line — that is what
  // keeps ordinary prose beginning "Part of the crew…" from matching.
  const re = new RegExp(
    `^[ \\t]*(${UNITS})[ \\t]+([IVXLCDM]+|\\d{1,3})[ \\t]*[.:—–-]?[ \\t]*([^\\n]{0,70})$`,
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
  const re = /^[ \t]*(EPILOGUE|Epilogue|PROLOGUE|Prologue|PREFACE|Preface|CONCLUSION|Conclusion)[ \t]*\.?[ \t]*$/gm;
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
function bareNumberMarks(text) {
  const re = /^[ \t]*([IVXLCDM]+|\d{1,3})[ \t]*\.?[ \t]*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      at: m.index,
      end: m.index + m[0].length,
      unit: "Chapter",
      num: toNumber(m[1]),
    });
  }
  return out;
}

/** All-caps lines used as section titles (Jekyll and Hyde does this). */
function capsTitleMarks(text) {
  const re = /^[ \t]*([A-Z][A-Z' .,’-]{6,68})[ \t]*$/gm;
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

export function toParagraphs(body) {
  return body
    .split(/\n[ \t]*\n+/)
    .map((p) => p.replace(/\n[ \t]*/g, " ").trim())
    .filter((p) => p.length > 0);
}

function build(text, marks) {
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
        label = `Chapter ${counter}`;
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
        if (
          first &&
          first.length < 70 &&
          !/[.!?"”]$/.test(first) &&
          lines[1]?.trim() === ""
        ) {
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
function tidySections(chapters, strategy) {
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

  // Caps-derived numbering is positional, so it has to be redone after merges.
  if (strategy === "caps") {
    let n = 0;
    for (const c of out) {
      if (/^(Preface|Epilogue|Prologue|Conclusion|Etymology|Extracts)$/.test(c.label)) {
        continue;
      }
      n += 1;
      c.label = `Chapter ${n}`;
    }
  }

  return out;
}

export function splitChapters(text, expect) {
  const named = dropTableOfContents(namedSectionMarks(text));

  const candidates = [];
  for (const [name, fn] of [
    ["unit", unitMarks],
    ["bare", bareNumberMarks],
    ["caps", capsTitleMarks],
  ]) {
    const base = dropTableOfContents(fn(text));
    // Fold in Epilogue/Prologue/Preface, skipping any the strategy already has.
    const extra = named.filter(
      (n) => !base.some((b) => Math.abs(b.at - n.at) < 4),
    );
    const marks = [...base, ...extra].sort((a, b) => a.at - b.at);
    if (marks.length < 2) continue;
    const chapters = tidySections(build(text, marks), name);
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
