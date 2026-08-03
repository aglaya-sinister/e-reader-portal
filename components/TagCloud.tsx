import Link from "next/link";
import type { Tag } from "@/data/books";
import { tagSlug } from "@/data/tags";
import Panel from "./Panel";

// Bigger, brighter type for the tags with more books behind them.
function weightFor(count: number, max: number) {
  const t = count / max;
  if (t > 0.75) return "text-base font-semibold text-cream";
  if (t > 0.45) return "text-sm font-medium text-cream/85";
  if (t > 0.2) return "text-sm text-cream/70";
  return "text-xs text-muted";
}

export default function TagCloud({
  tags,
  activeSlug,
}: {
  tags: Tag[];
  /** Set on a tag page so the current genre stands out. */
  activeSlug?: string;
}) {
  const max = Math.max(...tags.map((t) => t.count));

  return (
    <Panel title="Cloud of Tags">
      <ul className="flex flex-wrap gap-x-3 gap-y-2.5">
        {tags.map((tag) => {
          const slug = tagSlug(tag.label);
          const active = slug === activeSlug;
          return (
            <li key={tag.label}>
              <Link
                href={`/tag/${slug}`}
                aria-current={active ? "page" : undefined}
                className={`${active ? "text-base font-semibold text-brass" : weightFor(tag.count, max)} rounded transition hover:text-brass focus:outline-none focus-visible:ring-2 focus-visible:ring-brass`}
              >
                {tag.label}
                <span className="ml-1 align-super text-[9px] text-muted/70 tabular-nums">
                  {tag.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
