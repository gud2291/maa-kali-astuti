"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { burst, flyToCart } from "@/components/commerce/fx";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { roll } from "@/components/motion/fx";
import { Stars } from "@/components/ui/Rating";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { dfmt, muhurat } from "@/lib/core/dates";
import { fmt, off } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { productHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { getCartCount, useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { useIsWished, useWishlist } from "@/stores/wishlist";
import type { Product } from "@/types/product";

/* §5 Featured Copper 12 Nag (Home.dc.html 274–344, vSpot 1460–1479, spotAdd 1068–1079).
   Copper-toned spotlight: a huge outlined "12" drifts at −0.2× scroll speed behind a 4-photo
   gallery (thumb picks crossfade 500 ms), then the buy box — qty (1–10, rolling number),
   Add to Cart morph (idle → Adding… 380 ms → Added ✓ 1.5 s, flies to the cart), Buy Now
   (adds, then checkout) and the wishlist heart (burst + toast). The copy is English in both
   locales, as in the design. */

const PHOTOS = [
  "/images/p-12-nag.webp",
  "/images/p-12-nag-2.webp",
  "/images/p-12-nag-3.webp",
  "/images/p-12-nag-wide.webp",
];

const BADGES: { icon: IconName; k: "pure" | "set" | "energized" }[] = [
  { icon: "shield", k: "pure" },
  { icon: "grid", k: "set" },
  { icon: "flame", k: "energized" },
];
const BENEFITS: { icon: IconName; k: "wealth" | "protection" | "legal" | "health" }[] = [
  { icon: "coins", k: "wealth" },
  { icon: "shield", k: "protection" },
  { icon: "scales", k: "legal" },
  { icon: "health", k: "health" },
];
const IDEAL: { icon: IconName; k: "temple" | "locker" | "office" | "home" }[] = [
  { icon: "temple", k: "temple" },
  { icon: "locker", k: "locker" },
  { icon: "office", k: "office" },
  { icon: "home", k: "home" },
];

type Phase = "idle" | "loading" | "added";
const noop = () => () => {};

export function NagSpotlight({ product: p, buildNow }: { product: Product; buildNow: number }) {
  const t = useTranslations("home.spot");
  const tt = useTranslations("toast");
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [ph, setPh] = useState<Phase>("idle");
  const phRef = useRef<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const imgRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const twelveRef = useRef<HTMLSpanElement>(null);
  const wished = useIsWished(p.id);

  // Next energization date: build time in the HTML, the viewer's today after hydration.
  const nextDate = useSyncExternalStore(
    noop,
    () => dfmt(muhurat()),
    () => dfmt(muhurat(buildNow)),
  );

  const setPhase = useCallback((v: Phase) => {
    phRef.current = v;
    setPh(v);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  // "12" numeral parallax: translateY = (centre − vh/2) × −0.2 while within 200px of the viewport.
  useEffect(() => {
    const el = twelveRef.current;
    const box = el?.parentElement;
    if (!el || !box || isReduced()) return;
    let rq = 0;
    const frame = () => {
      rq = 0;
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom > -200 && r.top < vh + 200)
        el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * -0.2).toFixed(1)}px,0)`;
    };
    const request = () => {
      if (!rq) rq = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    frame();
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(rq);
    };
  }, []);

  const add = (buy: boolean) => {
    if (phRef.current !== "idle") return;
    setPhase("loading");
    timers.current.push(
      setTimeout(() => {
        useCart.getState().add(p.id, { qty });
        if (buy) {
          router.push(routes.checkout);
          return;
        }
        flyToCart(imgRef.current);
        const ui = useUi.getState();
        ui.toast({ msg: t("toast", { q: qty }), tone: "ok", action: { kind: "cart", label: tt("viewCart") } });
        // The cart was empty before this add → open the drawer (as on the cards).
        if (getCartCount() === qty) ui.openCart();
        setPhase("added");
        timers.current.push(setTimeout(() => setPhase("idle"), 1500));
      }, 380),
    );
  };

  const step = (dir: 1 | -1) => {
    if (dir < 0 && qty <= 1) return;
    if (dir > 0 && qty >= 10) {
      useUi.getState().toast({ msg: t("max"), tone: "info" });
      return;
    }
    setQty(qty + dir);
    requestAnimationFrame(() => roll(numRef.current, dir));
  };

  const toggleWish = () => {
    const now = useWishlist.getState().toggle(p.id);
    if (!now) return;
    burst(heartRef.current);
    useUi
      .getState()
      .toast({ msg: tt("saved"), tone: "ok", action: { kind: "href", label: tt("view"), href: routes.wishlist } });
  };

  const em = (c: ReactNode) => <em className="text-cu italic">{c}</em>;
  const copperRing = "shadow-[inset_0_0_0_1px_rgba(184,104,61,.55)]";

  return (
    <section
      data-screen-label="04 Featured 12 Nag"
      lang="en"
      className="relative overflow-hidden bg-s1 shadow-[inset_0_1px_0_rgba(184,104,61,.45),inset_0_-1px_0_rgba(184,104,61,.45)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] items-center gap-[clamp(36px,5vw,96px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Gallery */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[-4%] flex items-center lg:left-[-8%]"
          >
            <span
              ref={twelveRef}
              className="block font-display text-[300px] leading-[.8] tracking-[-.07em] text-[rgba(184,104,61,.1)] will-change-transform [-webkit-text-stroke:1.5px_rgba(184,104,61,.32)] [font-variation-settings:'SOFT'_30] md:text-[460px] lg:text-[600px]"
            >
              12
            </span>
          </div>
          <div className="relative mx-auto grid max-w-[620px] grid-cols-[minmax(0,1fr)] items-start gap-3.5 md:grid-cols-[76px_minmax(0,1fr)]">
            <div
              role="group"
              aria-label={t("photos")}
              className="order-2 flex flex-row gap-2.5 md:order-none md:flex-col"
            >
              {PHOTOS.map((src, i) => {
                const on = img === i;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImg(i)}
                    aria-label={t("photoAria", { n: i + 1 })}
                    aria-pressed={on}
                    className={cn(
                      "relative aspect-[4/5] w-16 cursor-pointer overflow-hidden rounded-[3px] border-0 bg-[#EFE6D2] p-0 transition-shadow duration-[250ms] md:w-[76px]",
                      on
                        ? "shadow-[inset_0_0_0_1.5px_#B8683D,0_0_0_3px_rgba(184,104,61,.16)]"
                        : "shadow-[inset_0_0_0_1px_rgba(184,104,61,.3)]",
                    )}
                  >
                    <Image src={src} alt="" fill sizes="76px" draggable={false} className="block object-cover" />
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <span
                ref={imgRef}
                className="relative block aspect-[4/5] overflow-hidden rounded-btn bg-[#EFE6D2] shadow-[0_36px_70px_-40px_rgba(110,52,24,.55),inset_0_0_0_1px_rgba(184,104,61,.35)]"
              >
                {PHOTOS.map((src, i) => (
                  <span
                    key={src}
                    className="absolute inset-0 block transition-opacity duration-500 ease-mka"
                    style={{ opacity: img === i ? 1 : 0 }}
                  >
                    <Image
                      src={src}
                      alt={img === i ? p.name : ""}
                      fill
                      sizes="(min-width: 1024px) 530px, (min-width: 768px) 530px, 92vw"
                      draggable={false}
                      className="block object-cover"
                    />
                  </span>
                ))}
              </span>
              <span className="absolute bottom-[-18px] left-[-6px] flex -rotate-[2.5deg] flex-col gap-1.5 rounded-btn bg-iv px-[18px] py-3.5 shadow-[inset_0_0_0_1px_rgba(184,104,61,.45),0_18px_36px_-22px_rgba(110,52,24,.5)] md:bottom-[14%] md:left-[-40px]">
                <span className="font-display text-[clamp(19px,1.8vw,24px)] leading-[1.2] text-[#8A4A26] italic [font-variation-settings:'SOFT'_60]">
                  {t("note1")}
                  <br />
                  {t("note2")}
                </span>
                <span aria-hidden="true" className="block h-2.5 w-[120px]">
                  <LotusRule col="#B8683D" />
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="flex min-w-0 flex-col gap-[18px]">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-[#8A4A26] uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,3vw,40px)] leading-[1.14] font-normal tracking-[-.018em] text-em9 font-soft">
              <MaskLine>
                <span className="block md:whitespace-nowrap">{t("l1")}</span>
              </MaskLine>
              <MaskLine>
                <span className="block md:whitespace-nowrap">{t.rich("l2", { em })}</span>
              </MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-[#8A4A26]">
              {t("deva")}
            </span>
          </MaskText>

          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-sans text-[13.5px] leading-none font-semibold text-ink tabular">
              <span className="block h-3.5 w-[78px]">
                <Stars col="#B8683D" label={t("ratingAria", { r: p.rating.toFixed(1) })} />
              </span>
              {p.rating.toFixed(1)} <span className="font-medium text-ink6">{t("reviews", { n: p.reviews })}</span>
            </span>
            <span aria-hidden="true" className="size-1 rounded-pill bg-cu" />
            <span className="font-sans text-[13.5px] leading-[1.3] font-medium text-ink6">{t("set")}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span
                key={b.k}
                className={cn(
                  "inline-flex h-[30px] items-center gap-[7px] rounded-pill bg-iv px-3 font-sans text-[11px] leading-none font-bold tracking-[.08em] text-[#8A4A26] uppercase",
                  copperRing,
                )}
              >
                <span className="block size-3.5">
                  <Icon name={b.icon} />
                </span>
                {t(`badges.${b.k}`)}
              </span>
            ))}
          </div>

          <p className="m-0 max-w-[540px] font-sans text-[16px] leading-[1.7] text-pretty text-ink">{t("desc")}</p>

          <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-x-6 border-t border-[rgba(184,104,61,.3)] p-0 min-[600px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)] xl:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={b.k}
                className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 border-b border-[rgba(184,104,61,.3)] py-3.5"
              >
                <span className="grid size-10 place-items-center rounded-pill bg-iv text-cu shadow-[inset_0_0_0_1px_rgba(184,104,61,.5)]">
                  <span className="block size-5">
                    <Icon name={b.icon} />
                  </span>
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="font-sans text-[14.5px] leading-[1.3] font-semibold text-em9">
                    {t(`benefits.${b.k}.t`)}
                  </span>
                  <span className="font-sans text-[13.5px] leading-normal text-ink6">{t(`benefits.${b.k}.d`)}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <span className="font-sans text-[34px] leading-none font-bold tracking-[-.01em] text-em9 tabular">
              {fmt(p.price)}
            </span>
            <span className="font-sans text-[16px] leading-none font-medium text-ink6 tabular line-through">
              {t("mrp", { price: fmt(p.mrp) })}
            </span>
            <span className="inline-flex h-6 items-center rounded-pill bg-sin px-2.5 font-sans text-[11px] leading-none font-bold tracking-[.06em] text-iv">
              {t("off", { n: off(p) })}
            </span>
            <span className="font-sans text-[12.5px] leading-none font-medium text-ink6">{t("tax")}</span>
          </div>

          <span className="flex items-center gap-2 font-sans text-[13px] leading-[1.4] font-semibold text-ok">
            <span className="size-2 flex-none rounded-pill bg-ok shadow-[0_0_0_3px_rgba(47,122,79,.18)]" />
            {t("stock", { date: nextDate })}
          </span>

          <div className="flex flex-wrap items-stretch gap-2.5">
            <div
              role="group"
              aria-label={t("qty")}
              className={cn("flex h-[54px] items-center rounded-btn bg-iv", copperRing)}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t("dec")}
                disabled={qty <= 1}
                className="grid h-[54px] w-11 cursor-pointer place-items-center border-0 bg-transparent text-em7 disabled:cursor-default disabled:opacity-40"
              >
                <span className="block size-4">
                  <Icon name="minus" />
                </span>
              </button>
              <span className="grid h-[54px] w-8 place-items-center overflow-hidden">
                <span
                  ref={numRef}
                  aria-live="polite"
                  className="block font-sans text-[16px] leading-none font-bold text-ink tabular"
                >
                  {qty}
                </span>
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t("inc")}
                className="grid h-[54px] w-11 cursor-pointer place-items-center border-0 bg-transparent text-em7"
              >
                <span className="block size-4">
                  <Icon name="plus" />
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => add(false)}
              disabled={ph === "loading"}
              className={cn(
                "inline-flex h-[54px] flex-[1_1_180px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-0 px-[22px] font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold",
                "bg-[linear-gradient(110deg,rgba(217,185,106,0)_40%,rgba(217,185,106,.4)_50%,rgba(217,185,106,0)_60%)] bg-[size:260%_100%] bg-[position:100%_0] bg-no-repeat transition-[background-position,background-color] duration-[700ms,300ms] ease-mka hover:bg-[position:0_0]",
                ph === "added" ? "bg-ok" : "bg-em7",
              )}
            >
              <span className="block size-[18px]">
                <Icon name={ph === "added" ? "check" : "bag"} />
              </span>
              {ph === "loading" ? t("adding") : ph === "added" ? t("added") : t("add")}
            </button>
            <button
              type="button"
              onClick={() => add(true)}
              className="h-[54px] flex-[1_1_140px] cursor-pointer rounded-btn border-0 bg-iv px-5 font-sans text-[15px] leading-none font-semibold text-em7 shadow-ring-em transition-colors duration-150 hover:bg-em1"
            >
              {t("buy")}
            </button>
            <button
              type="button"
              onClick={toggleWish}
              aria-label={wished ? t("wishRemove") : t("wishSave")}
              aria-pressed={wished}
              className={cn(
                "grid size-[54px] cursor-pointer place-items-center rounded-btn border-0 bg-iv",
                copperRing,
                wished ? "text-sin" : "text-em7",
              )}
            >
              <span ref={heartRef} className="block size-5">
                <Icon name={wished ? "heartF" : "heart"} />
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="mr-1 font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-ink6 uppercase">
              {t("ideal")}
            </span>
            {IDEAL.map((d) => (
              <span
                key={d.k}
                className="inline-flex h-[34px] items-center gap-[7px] rounded-pill bg-iv px-[13px] font-sans text-[13px] leading-none font-medium text-em7 shadow-ring-sand"
              >
                <span className="block size-4 text-cu">
                  <Icon name={d.icon} />
                </span>
                {t(`idealItems.${d.k}`)}
              </span>
            ))}
          </div>

          <Link
            href={productHref(p)}
            className="inline-flex items-center gap-2 self-start bg-[linear-gradient(#B8683D,#B8683D)] bg-[size:100%_1px] bg-[position:0_100%] bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
          >
            {t("more")}
            <span className="block size-[15px]">
              <Icon name="arrowR" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
