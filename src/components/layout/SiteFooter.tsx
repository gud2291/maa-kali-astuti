import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/ui/Logo";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { rng } from "@/lib/core/rng";
import { categoryHref, policyHref, routes, serviceHref } from "@/lib/routes";
import { PAY_FOOTER } from "@/lib/site";
import { waLinkTo } from "@/lib/core/commerce";
import { getSetting } from "@/server/settings/queries";
import { FooterLang, FooterNewsletter, FooterRoot, FooterSocial } from "./FooterClient";

/* Night sky (SiteFooter 91–94 + M.stars mka-core 171): 70 seeded stars on desktop; mobile shows
   the first 34 — the same seed yields the same prefix, so one list serves both. */
function Sky() {
  const R = rng("foot");
  const stars = Array.from({ length: 70 }, () => {
    const r = R() < 0.15 ? 1.4 : R() < 0.5 ? 0.9 : 0.6;
    return { cx: (R() * 1440).toFixed(1), cy: (R() * 620).toFixed(1), r };
  });
  const cons = [
    [
      [180, 120],
      [240, 160],
      [300, 140],
      [350, 190],
      [330, 250],
    ],
    [
      [980, 90],
      [1040, 130],
      [1100, 110],
      [1150, 160],
    ],
    [
      [620, 420],
      [680, 380],
      [740, 400],
      [760, 460],
      [700, 500],
    ],
  ];
  return (
    <svg viewBox="0 0 1440 620" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className="block">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#D9B96A"
          data-amb="twinkle"
          className={i >= 34 ? "max-md:hidden" : undefined}
        />
      ))}
      {cons.map((pts, i) => (
        <g key={i}>
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#D9B96A"
            strokeWidth=".6"
            opacity=".5"
            pathLength={1}
            data-amb={`draw:18:${i * 4}`}
          />
          {pts.map((p, j) => (
            <circle key={j} cx={p[0]} cy={p[1]} r="1.6" fill="#F4E2B0" />
          ))}
        </g>
      ))}
    </svg>
  );
}

const linkCls =
  "self-start bg-[linear-gradient(#D9B96A,#D9B96A)] bg-[size:0_1px] bg-[position:0_100%] bg-no-repeat font-sans text-[14px] leading-[1.35] font-medium text-em1 no-underline transition-[background-size,color] duration-300 ease-mka hover:bg-[size:100%_1px] hover:text-iv";
const headCls =
  "mb-1 font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase hi:tracking-normal";
const contactCls = "flex items-center gap-[9px] font-sans text-[14px] leading-[1.35] font-medium text-em1 no-underline";

/**
 * Site footer — port of SiteFooter.dc.html: night cosmos (twinkling stars, constellations that
 * draw every 18 s, a 680px mandala turning over 180 s, a shooting star every ~12 s), brand +
 * newsletter row, five link columns + contact, social / payments / language, shloka line.
 * Server-rendered; newsletter, social, language and the tab-bar padding are client islands.
 */
export async function SiteFooter() {
  const [t, contact] = await Promise.all([getTranslations("footer"), getSetting("contact")]);
  const l = (k: string) => t(`l.${k}`);
  const phoneHref = contact.phoneTel.startsWith("tel:") ? contact.phoneTel : `tel:${contact.phoneTel}`;

  const cols: { h: string; links: [string, string][] }[] = [
    {
      h: t("h.shop"),
      links: [
        [l("rudraksha"), categoryHref("rudraksha")],
        [l("bracelets"), categoryHref("bracelets")],
        [l("amulets"), categoryHref("amulets")],
        [l("havan"), categoryHref("havan")],
        [l("copper"), categoryHref("copper")],
        [l("wishlist"), routes.wishlist],
      ],
    },
    {
      h: t("h.services"),
      links: [
        [l("kundaliReading"), serviceHref("kundali")],
        [l("palmistry"), serviceHref("palm")],
        [l("tarot"), serviceHref("tarot")],
        [l("numerology"), serviceHref("numerology")],
        [l("kundali99"), routes.kundali99],
        [l("love"), routes.loveCalculator],
      ],
    },
    {
      h: t("h.learn"),
      links: [
        [l("rashifal"), routes.rashifal],
        [l("courses"), routes.courses],
        [l("rituals"), routes.rituals],
        [l("videos"), routes.videos],
        [l("journal"), routes.blog],
        [l("about"), routes.about],
      ],
    },
    {
      h: t("h.help"),
      links: [
        [l("track"), routes.trackOrder],
        [l("cart"), routes.cart],
        [l("faq"), routes.faq],
        [l("contact"), routes.contact],
      ],
    },
    {
      h: t("h.policies"),
      links: [
        [l("shipping"), policyHref("shipping")],
        [l("refund"), policyHref("refund-returns")],
        [l("privacy"), policyHref("privacy")],
        [l("terms"), policyHref("terms")],
        [l("disclaimer"), policyHref("astrology-disclaimer")],
      ],
    },
  ];

  return (
    <FooterRoot>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Sky />
      </div>
      <div aria-hidden className="pointer-events-none absolute -top-[240px] -right-[260px] size-[680px] opacity-[.13]">
        <span data-amb="spin:180" className="block size-full">
          <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
            <MandalaG R={296} col="#D9B96A" sw={1} />
          </svg>
        </span>
      </div>
      <span aria-hidden data-amb="shoot:12:2" className="pointer-events-none absolute top-[70px] right-[18%] block">
        <span className="block h-px w-[130px] origin-right rotate-[-31deg] bg-[linear-gradient(90deg,rgba(217,185,106,0),#F4E2B0)]" />
      </span>

      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,24px)] pt-[clamp(56px,8vw,96px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-10">
          <div className="flex items-center gap-5">
            <span className="block size-[76px] flex-none">
              <Logo uid="foot" />
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-display text-[clamp(26px,3vw,34px)] leading-[1.1] font-normal tracking-[-.015em] text-iv font-soft hi:tracking-normal">
                {t.rich("tagline", {
                  em: (c) => <em className="text-g3 italic hi:not-italic">{c}</em>,
                })}
              </span>
              <span lang="hi" className="font-deva text-[15px] leading-[1.35] text-g3">
                साधना से स्पष्टता तक
              </span>
            </div>
          </div>
          <FooterNewsletter />
        </div>

        <div
          aria-hidden
          className="mt-12 mb-10 h-px bg-[linear-gradient(90deg,rgba(217,185,106,0),rgba(217,185,106,.45),rgba(217,185,106,0))]"
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-8 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {cols.map((c) => (
            <nav key={c.h} aria-label={c.h} className="flex flex-col gap-[11px]">
              <span className={headCls}>{c.h}</span>
              {c.links.map(([label, href]) => (
                <Link key={href} href={href} className={linkCls}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
          <div className="flex flex-col gap-[11px]">
            <span className={headCls}>{t("h.contact")}</span>
            <a href={waLinkTo(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className={contactCls}>
              <span className="block size-4 flex-none text-g3">
                <Icon name="whatsapp" />
              </span>
              {contact.phoneDisplay}
            </a>
            <a href={phoneHref} className={contactCls}>
              <span className="block size-4 flex-none text-g3">
                <Icon name="phone" />
              </span>
              {t("callOffice")}
            </a>
            <a href={`mailto:${contact.email}`} className={`${contactCls} break-all`}>
              <span className="block size-4 flex-none text-g3">
                <Icon name="mail" />
              </span>
              {contact.email}
            </a>
            <span className="flex items-center gap-[9px] font-sans text-[14px] leading-[1.35] font-medium text-em1">
              <span className="block size-4 flex-none text-g3">
                <Icon name="clock" />
              </span>
              {t("hours")}
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-[rgba(217,185,106,.18)] py-[22px]">
          <FooterSocial />
          <div className="flex flex-wrap items-center gap-1.5">
            {PAY_FOOTER.map((p) => (
              <span
                key={p}
                className="grid h-[26px] place-items-center rounded-3 px-[9px] font-sans text-[10.5px] leading-none font-bold tracking-[.06em] text-em1 shadow-[inset_0_0_0_1px_rgba(228,238,232,.25)]"
              >
                {p}
              </span>
            ))}
          </div>
          <FooterLang />
        </div>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2.5 border-t border-[rgba(217,185,106,.18)] pt-[18px] pb-7 font-sans text-[12.5px] leading-[1.5] font-medium text-sg5">
          <span>
            <span lang="hi" className="font-deva text-[15px] leading-[1.35] font-normal text-g3">
              || सर्वे भवन्तु सुखिनः ||
            </span>
            {"  "}
            {t("shlokaMeaning")}
          </span>
          <span>{t("copyright")}</span>
        </div>
      </div>
    </FooterRoot>
  );
}
