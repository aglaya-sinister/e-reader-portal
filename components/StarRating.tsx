function Star({ fill }: { fill: number }) {
  // fill: 0 = empty, 1 = full, fractional = partial
  const clip = `inset(0 ${100 - Math.round(fill * 100)}% 0 0)`;
  return (
    <span className="relative inline-block h-3.5 w-3.5">
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full">
        <path
          d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z"
          className="fill-none stroke-brass/45"
          strokeWidth="1.6"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full"
        style={{ clipPath: clip }}
      >
        <path
          d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z"
          className="fill-brass"
        />
      </svg>
    </span>
  );
}

export default function StarRating({
  value,
  showValue = false,
}: {
  value: number;
  showValue?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex gap-0.5"
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.min(1, Math.max(0, value - i))} />
        ))}
      </span>
      {showValue && (
        <span className="text-xs text-muted tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
