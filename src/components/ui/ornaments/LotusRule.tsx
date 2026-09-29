import { cn } from "@/lib/utils/cn";

/** 240×16 lotus divider (mka-core.js 172). Size it with the wrapper; default colour g5. */
export function LotusRule({ col = "#B8923A", className }: { col?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      width="100%"
      height="100%"
      fill="none"
      stroke={col}
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <path d="M0 8H100M140 8H240" />
      <path d="M120 2c2.4 2.4 2.8 5.2 0 9-2.8-3.8-2.4-6.6 0-9zM120 11c-2.6-3.2-5.6-4.4-9-4 1 3 4 4.6 9 4zM120 11c2.6-3.2 5.6-4.4 9-4-1 3-4 4.6-9 4z" />
      <circle cx="104" cy="8" r="1.2" fill={col} />
      <circle cx="136" cy="8" r="1.2" fill={col} />
    </svg>
  );
}
