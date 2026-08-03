import Link from "next/link";
import SearchBox from "./SearchBox";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M3 11.2 12 4l9 7.2M5.6 9.6V20h12.8V9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FiltersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M4 7h16M4 12h11M4 17h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const iconClasses =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-cream/75 transition hover:bg-white/5 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-brass";

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} className={iconClasses}>
      {children}
    </button>
  );
}

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" aria-label="Home" className={iconClasses}>
          <HomeIcon />
        </Link>
        <IconButton label="Browse filters">
          <FiltersIcon />
        </IconButton>

        <SearchBox />

        <button
          type="button"
          className="ml-auto flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass sm:pr-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-xs font-semibold text-cream/85">
            EP
          </span>
          <span className="hidden text-sm text-cream/75 sm:block">You</span>
        </button>
      </div>
    </header>
  );
}
