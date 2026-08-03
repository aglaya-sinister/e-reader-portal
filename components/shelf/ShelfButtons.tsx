"use client";

import { useShelf, type ShelfStatus } from "./useShelf";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="m5 12.5 4.5 4.5L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 7.4V12l3.2 2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M6.5 4h11v16l-5.5-4-5.5 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const OPTIONS: {
  status: ShelfStatus;
  label: string;
  colour: string;
  Icon: () => React.ReactElement;
}[] = [
  { status: "read", label: "Already read", colour: "#3fa96a", Icon: CheckIcon },
  { status: "reading", label: "Reading now", colour: "#3b82f6", Icon: ClockIcon },
  { status: "planned", label: "Planned to read", colour: "#e08421", Icon: BookmarkIcon },
];

/**
 * Three small status buttons. Pressing the active one clears the status, so a
 * mistake is undone the same way it was made.
 *
 * `z-10` lifts these above the card's stretched title link, which otherwise
 * swallows every click inside the card.
 */
export default function ShelfButtons({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const { shelf, setStatus } = useShelf();
  const current = shelf[id]?.status;

  return (
    <div
      className={`relative z-10 flex items-center gap-1.5 ${className}`}
      role="group"
      aria-label="Reading status"
    >
      {OPTIONS.map(({ status, label, colour, Icon }) => {
        const active = current === status;
        return (
          <button
            key={status}
            type="button"
            title={active ? `${label} — press to clear` : label}
            aria-label={label}
            aria-pressed={active}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setStatus(id, status);
            }}
            className="grid h-6 w-6 place-items-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            style={{
              borderColor: active ? colour : "var(--color-line)",
              backgroundColor: active ? colour : "transparent",
              color: active ? "#0b0b0b" : colour,
              opacity: active ? 1 : 0.75,
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
