"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { fmt } from "@/lib/core/format";
import { PRICE_MAX, toPos, toVal } from "./shop-data";

type Range = [number, number];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const label = (v: number) => (v >= PRICE_MAX ? "₹12,000+" : fmt(v));
const THUMB =
  "absolute top-1 -ml-[11px] size-[22px] cursor-grab touch-none rounded-pill border-0 bg-iv shadow-[inset_0_0_0_1.5px_#164E3F,0_4px_10px_-4px_rgba(14,59,48,.5)]";

/**
 * Two-thumb price slider (Shop.dc.html 117–126, drag 274–286). Square-root scale snapped to ₹50,
 * thumbs keep ₹100 apart. The drag previews locally and commits on release; arrow keys move a
 * thumb by 3% of the track and commit at once.
 */
export function PriceRange({ value, onCommit }: { value: Range; onCommit: (v: Range) => void }) {
  const t = useTranslations("shop");
  const [pd, setPd] = useState<Range | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  const down = (which: "min" | "max") => (e: RPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stop.current?.();
    let cur: Range = [value[0], value[1]];
    setPd(cur);
    const move = (ev: PointerEvent) => {
      const r = track.current?.getBoundingClientRect();
      if (!r) return;
      const v = toVal(clamp01((ev.clientX - r.left) / r.width));
      cur = which === "min" ? [Math.min(v, cur[1] - 100), cur[1]] : [cur[0], Math.max(v, cur[0] + 100)];
      setPd(cur);
    };
    const up = () => {
      stop.current?.();
      setPd(null);
      onCommit(cur);
    };
    stop.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      stop.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const key = (which: "min" | "max") => (e: KeyboardEvent<HTMLButtonElement>) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const pr: Range = [value[0], value[1]];
    const i = which === "min" ? 0 : 1;
    pr[i] = toVal(clamp01(toPos(pr[i]) + step * 0.03));
    if (pr[0] < pr[1] - 50) onCommit(pr);
  };

  const pv = pd ?? value;
  const pl = toPos(pv[0]) * 100;
  const ph = toPos(pv[1]) * 100;

  return (
    <>
      <div className="flex justify-between pt-0.5 pb-2.5 font-sans text-[14px] leading-none font-bold text-em9 tabular">
        <span>{fmt(pv[0])}</span>
        <span>{label(pv[1])}</span>
      </div>
      <div ref={track} className="relative mx-2.5 h-[30px]">
        <div className="absolute inset-x-0 top-3.5 h-0.5 rounded-pill bg-s2" />
        <div className="absolute top-3.5 h-0.5 bg-em7" style={{ left: `${pl}%`, right: `${100 - ph}%` }} />
        <button
          type="button"
          role="slider"
          aria-label={t("priceMin")}
          aria-valuemin={0}
          aria-valuemax={PRICE_MAX}
          aria-valuenow={pv[0]}
          aria-valuetext={fmt(pv[0])}
          onPointerDown={down("min")}
          onKeyDown={key("min")}
          className={THUMB}
          style={{ left: `${pl}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label={t("priceMax")}
          aria-valuemin={0}
          aria-valuemax={PRICE_MAX}
          aria-valuenow={pv[1]}
          aria-valuetext={label(pv[1])}
          onPointerDown={down("max")}
          onKeyDown={key("max")}
          className={THUMB}
          style={{ left: `${ph}%` }}
        />
      </div>
      <span className="pt-1.5 font-sans text-[12px] leading-[1.4] font-medium text-ink6">{t("priceNote")}</span>
    </>
  );
}
