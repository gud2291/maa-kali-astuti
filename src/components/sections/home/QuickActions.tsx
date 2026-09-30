"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { GLYPH_PATHS } from "@/lib/art/glyphs";
import { ICON_PATHS } from "@/lib/art/icons";
import { todayRashi } from "@/lib/astro/rashi";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { bookHref, routes } from "@/lib/routes";

/* Mobile quick actions under the hero (Home.dc.html 169–181, script 1412–1419, qaAnim 1044–1049).
   Below 768 only. Each icon sits in a coloured disc ringed by a slowly turning dotted circle;
   the Kundali grid draws itself (draw:7:0), the heart beats every 2.4 s and the phone wiggles
   every 4.2 s. The loops pause offscreen / on a hidden tab; reduced motion keeps them still. */

type QaKey = "kundali" | "love" | "rashi" | "call";

const QA: { k: QaKey; href: string; bg: string; ink: string; spin: number }[] = [
  { k: "kundali", href: routes.kundali99, bg: "#0E3B30", ink: "#D9B96A", spin: 30 },
  { k: "love", href: routes.loveCalculator, bg: "#EBCFC9", ink: "#0E3B30", spin: -34 },
  { k: "rashi", href: routes.rashifal, bg: "#0A1F1A", ink: "#D9B96A", spin: 26 },
  { k: "call", href: bookHref("kundali"), bg: "#E4EEE8", ink: "#164E3F", spin: -28 },
];

// Trusted build-time markup (src/lib/art): the kundali icon with every stroke set up to draw.
const KUNDALI_DRAW = ICON_PATHS.kundali.replace(/<(path|rect)/g, '<$1 pathLength="1" data-amb="draw:7:0"');

function Ring() {
  return (
    <svg viewBox="0 0 58 58" width="100%" height="100%" className="block">
      <circle
        cx="29"
        cy="29"
        r="27.5"
        fill="none"
        stroke="#B8923A"
        strokeWidth="1"
        strokeDasharray="1.5 4.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const noop = () => () => {};

const svgProps = {
  viewBox: "0 0 24 24",
  width: "100%",
  height: "100%",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "block",
} as const;

export function QuickActions() {
  const t = useTranslations("home.hero");
  const ref = useRef<HTMLElement>(null);
  // Today's sun sign depends on the viewer's date: null on the server, resolved on the client.
  const rashi = useSyncExternalStore(
    noop,
    () => todayRashi().key,
    () => null,
  );

  useEffect(() => {
    const root = ref.current;
    if (!root || isReduced()) return;
    const loops: Animation[] = [];
    const heart = root.querySelector('[data-qa="love"]');
    const call = root.querySelector('[data-qa="call"]');
    if (heart)
      loops.push(
        heart.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.16)", offset: 0.1 },
            { transform: "scale(1)", offset: 0.2 },
            { transform: "scale(1.1)", offset: 0.3 },
            { transform: "scale(1)", offset: 0.42 },
            { transform: "scale(1)" },
          ],
          { duration: 2400, iterations: Infinity },
        ),
      );
    if (call)
      loops.push(
        call.animate(
          [
            { transform: "rotate(0)" },
            { transform: "rotate(-12deg)", offset: 0.04 },
            { transform: "rotate(10deg)", offset: 0.08 },
            { transform: "rotate(-8deg)", offset: 0.12 },
            { transform: "rotate(6deg)", offset: 0.16 },
            { transform: "rotate(0)", offset: 0.2 },
            { transform: "rotate(0)" },
          ],
          { duration: 4200, iterations: Infinity },
        ),
      );
    let vis = true;
    const sync = () => loops.forEach((a) => (vis && !document.hidden ? a.play() : a.pause()));
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      loops.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <nav ref={ref} aria-label={t("qaLabel")} className="grid grid-cols-4 gap-2 md:hidden">
      {QA.map((q) => (
        <Link
          key={q.k}
          href={q.href}
          className="flex min-h-[104px] flex-col items-center gap-[9px] rounded-btn bg-cream px-1 pt-3.5 pb-3 text-em9 no-underline shadow-ring-sand"
        >
          <span
            className="relative grid size-12 place-items-center rounded-pill"
            style={{ backgroundColor: q.bg, color: q.ink }}
          >
            <span aria-hidden="true" data-amb={`spin:${q.spin}`} className="absolute -inset-[5px] block">
              <Ring />
            </span>
            <span data-qa={q.k} className="block size-6">
              {q.k === "kundali" && <svg {...svgProps} dangerouslySetInnerHTML={{ __html: KUNDALI_DRAW }} />}
              {q.k === "love" && <Icon name="heart" />}
              {q.k === "rashi" && rashi && (
                <svg
                  {...svgProps}
                  stroke="#D9B96A"
                  dangerouslySetInnerHTML={{ __html: GLYPH_PATHS[rashi as keyof typeof GLYPH_PATHS] ?? "" }}
                />
              )}
              {q.k === "call" && <Icon name="phone" />}
            </span>
          </span>
          <span className="text-center font-sans text-[11.5px] leading-[1.25] font-semibold text-balance">
            {t(`qa.${q.k}`)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
