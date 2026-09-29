import type { SVGProps } from "react";
import { ICON_PATHS } from "@/lib/art/icons";
import { cn } from "@/lib/utils/cn";

export type IconName = keyof typeof ICON_PATHS;

type Props = Omit<SVGProps<SVGSVGElement>, "name" | "dangerouslySetInnerHTML" | "children"> & {
  name: IconName;
  /** Stroke width (design default 1.5). Ignored for the filled icons. */
  sw?: number;
  /** Accessible label. Without it the icon is decorative (aria-hidden). */
  label?: string;
};

/**
 * The design's single icon family (mka-core.js `M.icon`): 24 grid, 1.5 stroke, round caps,
 * currentColor. Fills its box by default — size it with the wrapper or `className` (`size-4`).
 */
export function Icon({ name, sw = 1.5, label, className, ...rest }: Props) {
  const filled = name === "heartF" || name === "starF";
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 1 : sw}
      strokeLinecap={filled ? undefined : "round"}
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      className={cn("block", className)}
      {...rest}
      // Trusted, build-generated markup from src/lib/art/icons.ts (CLAUDE.md rule).
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
