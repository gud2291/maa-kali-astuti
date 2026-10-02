"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { routes } from "@/lib/routes";

const RINGS = [
  { ring: "outer", amb: "spin:120" },
  { ring: "middle", amb: "spin:-90" },
  { ring: "inner", amb: "spin:60" },
] as const;

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.page");

  useEffect(() => {
    // Client-side observation if digest is present without exposing details to UI
  }, [error]);

  return (
    <section className="relative overflow-hidden bg-iv">
      <div className="container-mka flex min-h-[70vh] flex-col items-center justify-center gap-5 section-y text-center">
        <div className="relative grid size-[min(260px,68vw)] place-items-center">
          <div aria-hidden="true" className="absolute inset-0 opacity-60">
            {RINGS.map((r) => (
              <span key={r.ring} data-amb={r.amb} className="absolute inset-0 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/svg/chakra/${r.ring}-d9b96a.svg`}
                  alt=""
                  width={260}
                  height={260}
                  className="block size-full"
                />
              </span>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="relative font-display text-[clamp(48px,8vw,72px)] leading-none font-normal tracking-[-.02em] text-g5 italic font-soft"
          >
            ॥ॐ॥
          </span>
        </div>

        <Eyebrow>{t("eyebrow")}</Eyebrow>

        <span lang="hi" className="font-deva text-[clamp(20px,2.4vw,28px)] leading-[1.35] text-g7">
          {t("deva")}
        </span>

        <h1 className="m-0 font-display text-[clamp(32px,4vw,48px)] leading-[1.1] font-normal tracking-[-.02em] text-balance text-em9 font-soft">
          {t.rich("title", {
            em: (chunks) => <em className="italic">{chunks}</em>,
          })}
        </h1>

        <div className="h-4 w-60">
          <LotusRule />
        </div>

        <p className="m-0 max-w-[500px] font-sans text-[15px] leading-[1.65] text-ink6">
          {t("body")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={() => reset()}>
            {t("retry")}
          </Button>
          <ButtonLink href={routes.home} variant="outline" size="md">
            {t("home")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
