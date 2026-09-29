import type { ComponentPropsWithoutRef, ElementType } from "react";

/* `data-reveal` wrapper (mka-core.js fx.reveal 482–489). Server-safe: it only renders the
   attribute; AmbientRoot animates it (fade-up 24px, 700 ms, delay i × 80 ms, EASE, once at 12%).
   Porting tip: a design element with data-reveal="2" becomes <Reveal i={2}> — or keep the
   plain attribute on any element, which works the same. */
type Props<T extends ElementType> = { as?: T; i?: number } & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Reveal<T extends ElementType = "div">({ as, i = 0, ...rest }: Props<T>) {
  const Tag: ElementType = as || "div";
  return <Tag data-reveal={String(i)} {...rest} />;
}
