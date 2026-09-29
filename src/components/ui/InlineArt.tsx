import type { CSSProperties } from "react";
import { withUid } from "@/lib/art/uid";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** A string constant from src/lib/art/* — never user or remote content. */
  svg: string;
  /** Unique per instance on the page; replaces the __U__ id token. */
  uid: string;
  className?: string;
  style?: CSSProperties;
};

/** Renders trusted, build-generated SVG markup inline (animated art, or art with web-font text). */
export function InlineArt({ svg, uid, className, style }: Props) {
  return (
    <span
      className={cn("block size-full", className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: withUid(svg, uid) }}
    />
  );
}
