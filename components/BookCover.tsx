type Size = "sm" | "md" | "lg";

/** Anything with a title, an author and a hue can have a cover drawn for it. */
export type Coverable = {
  title: string;
  author: string;
  hue: number;
};

const widths: Record<Size, string> = {
  sm: "w-16",
  md: "w-24",
  lg: "w-32",
};

const titleSize: Record<Size, string> = {
  sm: "text-[9px] leading-tight",
  md: "text-[11px] leading-tight",
  lg: "text-sm leading-snug",
};

/**
 * Covers are generated from the book's hue rather than loaded as images, so the
 * catalog renders with no assets and no broken thumbnails. Swap this component
 * for an <Image> once there is real cover art.
 */
export default function BookCover({
  book,
  size = "md",
  className = "",
}: {
  book: Coverable;
  size?: Size;
  className?: string;
}) {
  const { hue, title, author } = book;

  return (
    <div
      className={`${widths[size]} aspect-2/3 shrink-0 overflow-hidden rounded-sm shadow-lg shadow-black/40 ring-1 ring-white/10 ${className}`}
      style={{
        // Same hues, lower lightness — the covers sit quieter against the
        // dark cards without changing colour.
        background: `linear-gradient(150deg,
          hsl(${hue} 38% 21%) 0%,
          hsl(${hue} 34% 13%) 55%,
          hsl(${(hue + 24) % 360} 30% 9%) 100%)`,
      }}
    >
      <div className="relative flex h-full flex-col justify-between p-2">
        {/* spine */}
        <div className="absolute inset-y-0 left-0 w-[6px] bg-black/25" />
        <div className="absolute inset-y-0 left-[6px] w-px bg-white/15" />

        <div
          className="ml-2 h-px w-8 opacity-70"
          style={{ backgroundColor: `hsl(${hue} 60% 72%)` }}
        />

        <div className="ml-2">
          <p
            className={`${titleSize[size]} font-semibold text-white/95 line-clamp-3`}
          >
            {title}
          </p>
          {size !== "sm" && (
            <p className="mt-1 text-[9px] uppercase tracking-wider text-white/55">
              {author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
