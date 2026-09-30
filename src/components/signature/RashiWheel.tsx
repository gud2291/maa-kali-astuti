import type { Ref } from "react";
import { InlineArt } from "@/components/ui/InlineArt";
import { WHEEL_CENTER_SVG, WHEEL_GRAHA_SVG, WHEEL_RASHI_SVG } from "@/lib/art/wheel";

/* Rashi wheel layers (A.wheel, mka-astro.js 175–191; Home 364–371 / 410–418), bottom to top:
   27-nakshatra ring (spin 240 s) · 9-graha ring (spin −320 s) · 12-rashi ring ([data-rot], turned
   by useRashiCycle) · ॐ centre · pointer. The rashi ring's segments are g[data-seg="i"] with a
   highlight [data-hl], glyph [data-gl] and Devanagari name [data-tx]; `wheelActive` lights one. */

type Props = {
  /** The [data-rot] ring the cycle hook rotates. */
  ringRef: Ref<HTMLSpanElement>;
  /** Unique per wheel on the page. */
  uid: string;
};

export function WheelLayers({ ringRef, uid }: Props) {
  return (
    <>
      <span aria-hidden="true" data-amb="spin:240" className="absolute inset-0 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/svg/wheel/nak.svg" alt="" width={620} height={620} loading="lazy" className="block size-full" />
      </span>
      <span aria-hidden="true" data-amb="spin:-320" className="absolute inset-0 block">
        <InlineArt svg={WHEEL_GRAHA_SVG} uid={`${uid}-g`} />
      </span>
      <span ref={ringRef} data-rot="" className="absolute inset-0 block will-change-transform">
        <InlineArt svg={WHEEL_RASHI_SVG} uid={`${uid}-r`} />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
        <InlineArt svg={WHEEL_CENTER_SVG} uid={`${uid}-c`} />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/svg/wheel/pointer.svg" alt="" width={620} height={620} loading="lazy" className="block size-full" />
      </span>
    </>
  );
}

/** Light segment i: fill the highlight, pale-gold glyph + name (A.wheelActive, mka-astro.js 192–200). */
export function wheelActive(root: ParentNode | null, i: number) {
  if (!root) return;
  root.querySelectorAll("[data-seg]").forEach((g) => {
    const on = +(g.getAttribute("data-seg") || -1) === i;
    const hl = g.querySelector<SVGElement>("[data-hl]");
    const gl = g.querySelector("[data-gl]");
    const tx = g.querySelector("[data-tx]");
    if (hl) hl.style.opacity = on ? "1" : "0";
    gl?.setAttribute("stroke", on ? "#F6E7BC" : "#D9B96A");
    tx?.setAttribute("fill", on ? "#F6E7BC" : "#E4EEE8");
  });
}
