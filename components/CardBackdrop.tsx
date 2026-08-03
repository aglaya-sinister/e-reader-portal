import Image from "next/image";

/**
 * The painting behind a card.
 *
 * Paintings are landscape and cards are wider than they are tall, so the image
 * is cropped with object-cover. Scrims on top keep the text legible: a
 * left-to-right wash for the cover and description, and a bottom fade for the
 * title block.
 *
 * `dim` darkens it further. The catalog's featured cards are the showpiece and
 * carry the painting at full strength; everywhere else it is background, and
 * competing with the text would make lists harder to scan.
 */
export default function CardBackdrop({
  src,
  hue,
  alt = "",
  dim = false,
  priority = false,
  sizes = "(max-width: 700px) 86vw, 640px",
}: {
  src?: string | null;
  /** Fallback gradient when there is no painting. */
  hue: number;
  alt?: string;
  dim?: boolean;
  /** Set on the first card — it is the largest thing above the fold. */
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 140% at 8% 0%,
            hsl(${hue} 32% 22%) 0%,
            hsl(${hue} 24% 14%) 45%,
            #0d0d0d 100%)`,
        }}
      />
    );
  }

  const sideWash = dim
    ? "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.74) 100%)"
    : "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.45) 100%)";

  const bottomFade = dim
    ? "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.2) 100%)"
    : "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-center"
        style={{ opacity: dim ? 0.55 : 1 }}
        priority={priority}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: sideWash }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: bottomFade }}
      />
    </>
  );
}
