import Image from "next/image";

/**
 * The painting behind a card.
 *
 * Paintings are landscape and cards are wider than they are tall, so the image
 * is cropped with object-cover. Scrims on top keep the text legible: a
 * left-to-right wash for the cover and description, and a bottom fade for the
 * title block.
 *
 * Every card shows the painting at full strength — the same treatment in the
 * catalog, on author pages, and in the library.
 */
export default function CardBackdrop({
  src,
  hue,
  alt = "",
  priority = false,
  sizes = "(max-width: 700px) 86vw, 640px",
}: {
  src?: string | null;
  /** Fallback gradient when there is no painting. */
  hue: number;
  alt?: string;
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

  // The scrim is heaviest on the left, where the cover and description sit, and
  // thins out to the right so the painting is actually visible.
  const sideWash =
    "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.2) 100%)";

  const bottomFade =
    "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-center"
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
