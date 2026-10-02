"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { SOCIAL } from "@/lib/site";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { chromeFor } from "./chrome-config";
import { useSwitchLocale } from "./useSwitchLocale";

/* Client islands of the server-rendered footer (SiteFooter.dc.html). */

/** `<footer>` with 72px bottom padding on mobile when the page has the tab bar (SiteFooter 96).
 *  On `flowFooter` routes (Booking) it renders only once the flow is done. */
export function FooterRoot({ children }: { children: ReactNode }) {
  const cfg = chromeFor(usePathname());
  const flowDone = useUi((s) => s.flowDone);
  const tabbar = cfg.tabbar && cfg.mode !== "checkout";
  if (cfg.flowFooter && !flowDone) return null;
  return (
    <footer className={cn("relative overflow-hidden bg-n9 text-em1", tabbar && "pb-[72px] md:pb-0")}>{children}</footer>
  );
}

/** Newsletter (SiteFooter 27–37, 86): idle → error on a bad email → "Subscribed". Off on Home. */
export function FooterNewsletter() {
  const t = useTranslations("footer");
  const show = chromeFor(usePathname()).newsletter;
  if (!show) return null;

  return (
    <div className="flex flex-col gap-3">
      <span
        className="font-sans text-[11px] leading-[1.3] font-semibold tracking-[.16em] text-g3 uppercase hi:tracking-normal"
      >
        {t("nlLabel")}
      </span>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <NewsletterForm
            idPrefix="nl"
            label={t("nlLabel")}
            placeholder={t("nlPh")}
            subscribe={t("subscribe")}
            errorText={t("nlErr")}
            doneText={t("nlDone")}
            source="footer"
            inputClassName="h-12 min-w-0 flex-1 rounded-field border bg-[rgba(251,247,238,.04)] px-3.5 font-sans text-[15px] leading-none font-medium text-iv outline-none focus:border-g3 border-[rgba(217,185,106,.45)]"
            buttonClassName="h-12 cursor-pointer rounded-btn border-0 bg-transparent px-5 font-sans text-[14px] leading-none font-semibold tracking-[.03em] text-g3 shadow-ring-g3 transition-colors duration-150 hover:bg-[rgba(217,185,106,.12)] hi:tracking-normal disabled:opacity-60"
            errorClassName="flex items-center gap-1.5 font-sans text-[13px] leading-[1.3] font-medium text-rose"
            doneClassName="flex h-12 items-center gap-2.5 font-sans text-[15px] leading-[1.3] font-medium text-iv"
          />
        </div>
      </div>
    </div>
  );
}

/** Social circles (SiteFooter 59–61). Unconfirmed profiles show a toast instead of navigating. */
export function FooterSocial() {
  const t = useTranslations("footer");
  const cls =
    "grid size-10 place-items-center rounded-pill text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)] transition-colors duration-150 hover:bg-[rgba(217,185,106,.12)]";
  return (
    <div className="flex gap-2">
      {SOCIAL.map((s) =>
        s.url ? (
          <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className={cls}>
            <span className="block size-[18px]">
              <Icon name={s.key} />
            </span>
          </a>
        ) : (
          <button
            key={s.key}
            type="button"
            aria-label={s.name}
            onClick={() => useUi.getState().toast({ msg: t("socialSoon", { name: s.name }), tone: "info" })}
            className={cn(cls, "cursor-pointer border-0 bg-transparent")}
          >
            <span className="block size-[18px]">
              <Icon name={s.key} />
            </span>
          </button>
        ),
      )}
    </div>
  );
}

/** English | हिंदी toggle (SiteFooter 65–69). */
export function FooterLang() {
  const t = useTranslations("chrome");
  const { hi, setLocale } = useSwitchLocale();
  return (
    <div role="group" aria-label={t("language")} className="flex items-center gap-3.5">
      <span className="block size-4 text-g3">
        <Icon name="globe" />
      </span>
      <button
        type="button"
        lang="en"
        aria-pressed={!hi}
        onClick={() => setLocale("en")}
        className={cn(
          "cursor-pointer border-0 bg-transparent px-0 py-1 font-sans text-[13px] leading-none font-semibold text-iv",
          !hi && "shadow-[inset_0_-1px_0_#D9B96A]",
        )}
      >
        English
      </button>
      <button
        type="button"
        lang="hi"
        aria-pressed={hi}
        onClick={() => setLocale("hi")}
        className={cn(
          "cursor-pointer border-0 bg-transparent px-0 py-1 font-hi text-[15px] leading-none font-medium text-iv",
          hi && "shadow-[inset_0_-1px_0_#D9B96A]",
        )}
      >
        हिंदी
      </button>
    </div>
  );
}
