import Image from "next/image";
import type { Author } from "@/data/authors";

/**
 * The square portrait plate from the sketch. Falls back to a monogram if no
 * image has been added for this author yet.
 */
export default function AuthorPortrait({ author }: { author: Author }) {
  const initials = author.name
    .split(/\s+/)
    .filter((p) => !/^(de|van|von)$/i.test(p))
    .map((p) => p[0])
    .join("")
    .slice(0, 3);

  return (
    <figure className="w-full max-w-[280px] shrink-0">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-panel">
        {author.portrait.src ? (
          <Image
            src={author.portrait.src}
            alt={`Portrait of ${author.name}`}
            fill
            sizes="280px"
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="font-serif text-5xl text-muted/50">{initials}</span>
          </div>
        )}
      </div>
      {author.portrait.credit && (
        <figcaption className="mt-2 text-[11px] text-muted/70">
          {author.portrait.credit}
        </figcaption>
      )}
    </figure>
  );
}
