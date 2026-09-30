"use client";

import type { ComponentProps } from "react";
import { scrollToId } from "@/components/layout/scroll";

/** `<a href="#id">` that scrolls to the section with the design's 60px offset (keeps the hash
 *  href for no-JS and middle-click). */
export function AnchorLink({ to, offset = 60, ...rest }: { to: string; offset?: number } & ComponentProps<"a">) {
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(to, offset);
      }}
      {...rest}
    />
  );
}
