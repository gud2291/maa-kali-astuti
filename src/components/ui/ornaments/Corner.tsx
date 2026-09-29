import { cn } from "@/lib/utils/cn";

/** 48×48 frame corner (mka-core.js 173). Rotate/flip the wrapper for the other corners. */
export function Corner({ col = "#B8923A", className }: { col?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      fill="none"
      stroke={col}
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <path d="M2 46V14C2 7.4 7.4 2 14 2h32" />
      <path d="M8 46V18c0-5.5 4.5-10 10-10h28" />
      <path d="M14 14c4 0 6 2 6 6-4 0-6-2-6-6z" />
      <circle cx="26" cy="26" r="1.3" fill={col} />
    </svg>
  );
}
