import { GLYPH_PATHS } from "@/lib/art/glyphs";
import { cn } from "@/lib/utils/cn";

type Props = { k: string; col?: string; sw?: number; className?: string };

/** One of the 12 custom rashi glyphs (A.glyph, mka-astro.js 30): 24 grid, round caps. Decorative. */
export function RashiGlyph({ k, col = "currentColor", sw = 1.5, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      stroke={col}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("block", className)}
      // Trusted, build-generated path markup from src/lib/art/glyphs.ts.
      dangerouslySetInnerHTML={{ __html: GLYPH_PATHS[k as keyof typeof GLYPH_PATHS] ?? "" }}
    />
  );
}
