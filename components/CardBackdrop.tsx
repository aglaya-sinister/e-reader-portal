import Image from "next/image";
import type { Book } from "@/data/books";

/**
 * The painting behind a featured card.
 *
 * Paintings are landscape and the card is wider than it is tall, so the image
 * is cropped with object-cover and pulled toward its centre. Two scrims sit on
 * top: a left-to-right wash that keeps the cover and description legible, and a
 * bottom fade for the title block.
 *
 * With no `src` yet, this falls back to the generated hue gradient, so the
 * layout is identical whether or not the artwork has been added.
 */
export default function CardBackdrop({
  book,
  priority = false,
}: {
  book: Book;
  /** Set on the first card — it is the largest thing above the fold. */
  priority?: boolean;
}) {
  const { artwork, hue } = book;

  if (!artwork.src) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 140% at 8% 0%,
              hsl(${hue} 32% 22%) 0%,
              hsl(${hue} 24% 14%) 45%,
              #0d0d0d 100%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(60% 80% at 85% 20%, hsl(${hue} 60% 40% / 0.55), transparent 70%)`,
          }}
        />
      </>
    );
  }

  return (
    <>
      <Image
        src={artwork.src}
        alt={`${artwork.painting} by ${artwork.artist}`}
        fill
        sizes="(max-width: 700px) 86vw, 640px"
        className="object-cover object-center"
        priority={priority}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
        }}
      />
    </>
  );
}
