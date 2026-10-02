"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/components/icons/Icon";
import { drawChart } from "@/components/motion/draw";
import { enter } from "@/components/motion/fx";
import { Field } from "@/components/ui/Field";
import { Corner } from "@/components/ui/ornaments";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { InquiryError, submitInquiry } from "@/lib/api/inquiry";
import { waLinkTo } from "@/lib/site";
import { useSiteSettings } from "@/components/layout/SiteSettingsProvider";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/domain/enums";
import {
  INQUIRY_AREAS,
  INQUIRY_EXP,
  INQUIRY_LANGS,
  WHY_MAX,
  inquiryDefaults,
  inquirySchema,
  type InquiryKind,
  type InquiryValues,
} from "@/lib/validation/inquiry";

/* InquiryForm (design/InquiryForm.dc.html 15–163): the enrollment (kind "course") and ritual
   (kind "ritual") inquiry card. Cream card with two brass corners. Name · WhatsApp (+91, digits
   only, 10) · Email (optional) · City; the course select (preset by the page); chip groups
   (experience, or area of concern + call language); the message (20–600, live count); the consent
   checkbox; submit + WhatsApp link.
   Validation (react-hook-form + zod): errors show only after the first submit and then update as
   you type; a failed submit focuses the first bad text field (name → phone → email → city → message).
   Submit: 1100 ms "Sending…" with a spinning chakra (mock API), then the done state fades up
   (y 10, 420 ms) with the seal drawing in (900 ms): "Pranam, <first name>.", the reference
   (MKA-S-/MKA-R-######), WhatsApp and "Send another inquiry" (keeps the chosen course). */

export type CourseOption = { key: string; en: string; hi: string };

type Phase = "idle" | "sending" | "done";
type Sent = InquiryValues & { refNo: string };

const TEXT_FIELDS = ["name", "phone", "email", "city"] as const;

export function InquiryForm({
  kind = "course",
  preset = "baglamukhi",
  courses = [],
}: {
  kind?: InquiryKind;
  /** Course key selected on mount and whenever the prop changes. */
  preset?: string;
  /** Options for "Which sadhana?" (course inquiries). */
  courses?: CourseOption[];
}) {
  const t = useTranslations("inquiry");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { contact } = useSiteSettings();
  const uid = useId();
  const ritual = kind === "ritual";
  const schema = useMemo(() => inquirySchema(kind), [kind]);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    setError,
    getValues,
    reset,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<InquiryValues>({
    resolver: zodResolver(schema),
    defaultValues: inquiryDefaults(preset),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  // Chip groups and the consent box are buttons, not inputs: register them by name.
  useEffect(() => {
    register("exp");
    register("area");
    register("lang");
    register("agree");
  }, [register]);

  // A new preset from the page (design componentDidUpdate 101) re-selects the course.
  const lastPreset = useRef(preset);
  useEffect(() => {
    if (preset && preset !== lastPreset.current) setValue("course", preset);
    lastPreset.current = preset;
  }, [preset, setValue]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [sent, setSent] = useState<Sent | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const doneRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = doneRef.current;
    if (phase !== "done" || !el) return;
    enter(el, { y: 10, dur: 420 });
    drawChart(el, { dur: 900 });
    el.focus({ preventScroll: true });
  }, [phase]);

  const [exp, area, lang, agree, why] = watch(["exp", "area", "lang", "agree", "why"]);
  // Values come from the fixed option lists above, so the cast is safe.
  const pick = (name: "exp" | "area" | "lang" | "agree", v: string | boolean) =>
    setValue(name, v as never, { shouldDirty: true, shouldValidate: isSubmitted });

  const onValid = async (v: InquiryValues) => {
    if (phase === "sending") return;
    setServerError(null);

    if (!turnstileToken) {
      setServerError(tErrors("BOT_CHECK_FAILED"));
      return;
    }

    setPhase("sending");
    try {
      const { refNo } = await submitInquiry(kind, v, turnstileToken, locale as Locale);
      if (!alive.current) return;
      setSent({ ...v, refNo });
      setPhase("done");
    } catch (err: unknown) {
      if (!alive.current) return;
      setPhase("idle");
      setResetKey((k) => k + 1);

      if (err instanceof InquiryError) {
        if (err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setError(field as never, { message });
          }
        }
        try {
          setServerError(tErrors(err.code as Parameters<typeof tErrors>[0]));
        } catch {
          setServerError(tErrors("INTERNAL"));
        }
      } else {
        setServerError(tErrors("INTERNAL"));
      }
    }
  };
  const onInvalid = (e: FieldErrors<InquiryValues>) => {
    const first = TEXT_FIELDS.find((k) => e[k]);
    if (first) setFocus(first);
    else if (e.why) setFocus("why");
  };

  const err = (k: "name" | "phone" | "email" | "city" | "exp" | "area") => (errors[k] ? t(`err.${k}`) : undefined);
  const phoneReg = register("phone");
  const n = (why || "").trim().length;

  const chip = (on: boolean) =>
    cn(
      "flex min-h-10 cursor-pointer items-center gap-[7px] rounded-pill border-0 px-[15px] font-sans text-[13px] leading-none font-semibold transition-[background-color,box-shadow] duration-150",
      on
        ? "bg-em7 text-iv shadow-[inset_0_0_0_1px_#164E3F,0_0_0_3px_rgba(184,146,58,.25)]"
        : "bg-white text-em7 shadow-ring-sand",
    );
  const groups: { name: "exp" | "area" | "lang"; label: string; items: { v: string; t: string }[]; error?: string }[] =
    ritual
      ? [
          {
            name: "area",
            label: t("area.label"),
            items: INQUIRY_AREAS.map((v) => ({ v, t: t(`area.${v}`) })),
            error: err("area"),
          },
          { name: "lang", label: t("lang.label"), items: INQUIRY_LANGS.map((v) => ({ v, t: t(`lang.${v}`) })) },
        ]
      : [
          {
            name: "exp",
            label: t("exp.label"),
            items: INQUIRY_EXP.map((v) => ({ v, t: t(`exp.${v}`) })),
            error: err("exp"),
          },
        ];
  const current = { exp, area, lang } as Record<"exp" | "area" | "lang", string>;

  const em = (c: ReactNode) => <em className="text-g5 italic hi:not-italic">{c}</em>;

  return (
    <div className="relative rounded-btn bg-cream p-[clamp(20px,3.4vw,36px)] shadow-[inset_0_0_0_1px_rgba(184,146,58,.5),0_28px_56px_-32px_rgba(10,31,26,.55)]">
      <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 block size-[30px]">
        <Corner />
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute right-2 bottom-2 block size-[30px] rotate-180">
        <Corner />
      </span>

      {phase !== "done" || !sent ? (
        <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
              {t(`${kind}.eyebrow`)}
            </span>
            <span className="font-title text-[clamp(24px,2.6vw,30px)] leading-[1.15] font-normal tracking-[-.01em] text-em9 font-soft hi:tracking-normal">
              {t(`${kind}.title`)}
            </span>
            <span className="font-sans text-[14.5px] leading-[1.6] text-pretty text-ink6">{t(`${kind}.note`)}</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-4">
            <Field
              id={`${uid}-name`}
              label={t("name")}
              autoComplete="name"
              maxLength={80}
              placeholder={t("namePh")}
              error={err("name")}
              {...register("name")}
            />
            <Field
              id={`${uid}-phone`}
              label={t("phone")}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              prefix="+91"
              placeholder={t("phonePh")}
              error={err("phone")}
              {...phoneReg}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                return phoneReg.onChange(e);
              }}
            />
            <Field
              id={`${uid}-email`}
              label={t("email")}
              optional={t("optional")}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={80}
              placeholder={t("emailPh")}
              error={err("email")}
              {...register("email")}
            />
            <Field
              id={`${uid}-city`}
              label={t("city")}
              autoComplete="address-level2"
              maxLength={80}
              placeholder={t("cityPh")}
              error={err("city")}
              {...register("city")}
            />
          </div>

          {!ritual && (
            <label htmlFor={`${uid}-course`} className="flex flex-col gap-[7px]">
              <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">{t("whichCourse")}</span>
              <span className="relative block">
                <select
                  id={`${uid}-course`}
                  {...register("course")}
                  className="h-12 w-full cursor-pointer appearance-none rounded-field border-0 bg-white pr-11 pl-[14px] font-sans text-[15.5px] leading-none font-medium text-ink shadow-ring-sand outline-none focus-visible:shadow-ring-focus focus-visible:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.en} · {c.hi}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevD"
                  className="pointer-events-none absolute top-1/2 right-[14px] -mt-2 size-4 text-ink6"
                />
              </span>
            </label>
          )}

          {groups.map((g) => (
            <div key={g.name} role="radiogroup" aria-label={g.label} className="flex flex-col gap-[9px]">
              <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">{g.label}</span>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => {
                  const on = current[g.name] === it.v;
                  return (
                    <button
                      key={it.v}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => pick(g.name, it.v)}
                      className={chip(on)}
                    >
                      {it.t}
                    </button>
                  );
                })}
              </div>
              {g.error && <ErrorRow>{g.error}</ErrorRow>}
            </div>
          ))}

          <label htmlFor={`${uid}-why`} className="flex flex-col gap-[7px]">
            <span className="flex justify-between gap-2.5 font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">
              {t(`${kind}.area`)}
              <span className="font-medium text-ink6 tabular">{t("count", { n })}</span>
            </span>
            <textarea
              id={`${uid}-why`}
              rows={4}
              maxLength={WHY_MAX}
              placeholder={t(`${kind}.areaPh`)}
              aria-invalid={errors.why ? true : undefined}
              aria-describedby={errors.why ? `${uid}-why-err` : undefined}
              {...register("why")}
              className={cn(
                "min-h-28 w-full resize-y rounded-field border-0 bg-white px-[14px] py-3 font-sans text-[15px] leading-[1.6] font-medium text-ink outline-none focus-visible:outline-none",
                errors.why ? "shadow-ring-error" : "shadow-ring-sand focus:shadow-ring-focus",
              )}
            />
            {errors.why && <ErrorRow id={`${uid}-why-err`}>{t(`${kind}.whyErr`)}</ErrorRow>}
          </label>

          <button
            type="button"
            role="checkbox"
            aria-checked={agree}
            onClick={() => pick("agree", !agree)}
            className="grid cursor-pointer grid-cols-[22px_minmax(0,1fr)] items-start gap-3 border-0 bg-transparent p-0 text-left"
          >
            <span
              className={cn(
                "grid size-[22px] place-items-center rounded-3 text-iv transition-colors duration-150",
                agree ? "bg-em7" : "bg-white",
                errors.agree ? "shadow-ring-error" : agree ? "shadow-ring-em-15" : "shadow-[inset_0_0_0_1.5px_#C9BFA6]",
              )}
            >
              <Icon name="check" className={cn("size-3.5", agree ? "opacity-100" : "opacity-0")} />
            </span>
            <span className="font-sans text-[13.5px] leading-[1.55] font-medium text-pretty text-ink">
              {t(`${kind}.agree`)}
            </span>
          </button>
          {errors.agree && <ErrorRow className="-mt-3">{t("err.agree")}</ErrorRow>}

          <div className="flex flex-col gap-2">
            <TurnstileWidget
              action="inquiry"
              onToken={setTurnstileToken}
              resetKey={resetKey}
            />
            {serverError && <ErrorRow>{serverError}</ErrorRow>}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5">
            <button
              type="submit"
              disabled={phase === "sending"}
              className="flex h-[52px] cursor-pointer items-center gap-2.5 rounded-btn border-0 bg-em7 sheen px-[26px] font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold disabled:cursor-wait hi:tracking-normal"
            >
              <span className="block size-[18px]">
                {phase === "sending" ? (
                  <span data-amb="spin:1.4" className="block size-full">
                    <Icon name="chakra" />
                  </span>
                ) : (
                  <Icon name="arrowR" />
                )}
              </span>
              {phase === "sending" ? t("sending") : t(`${kind}.send`)}
            </button>
            <a
              href={waLinkTo(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
            >
              <Icon name="whatsapp" className="size-[17px]" />
              {t("orWa")}
            </a>
          </div>
        </form>
      ) : (
        <div
          ref={doneRef}
          role="status"
          tabIndex={-1}
          className="flex flex-col items-start gap-3.5 py-1.5 outline-none"
        >
          <span className="block size-16">
            <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" className="block">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#B8923A" strokeWidth="1.5" pathLength={1} data-cl="" />
              <path
                d="M20 33l8 8 16-17"
                fill="none"
                stroke="#164E3F"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                data-cl=""
              />
            </svg>
          </span>
          <span className="font-title text-[clamp(28px,3vw,36px)] leading-[1.1] font-normal text-em9 font-soft">
            {t.rich("pranam", { em, name: sent.name.trim().split(/\s+/)[0] || t("seeker") })}
          </span>
          <span className="max-w-[520px] font-sans text-[16px] leading-[1.65] text-pretty text-ink">
            {ritual
              ? t("ritual.done", { wa: contact.phoneDisplay, lang: t(`langName.${sent.lang}`) })
              : t("course.done", {
                  wa: contact.phoneDisplay,
                  course: (() => {
                    const c = courses.find((x) => x.key === sent.course) ?? courses[0];
                    return c ? (locale === "hi" ? c.hi : c.en) : "";
                  })(),
                })}
          </span>
          <span className="flex h-[34px] items-center gap-2.5 rounded-pill bg-s1 px-3.5 font-sans text-[12.5px] leading-none font-semibold tracking-[.06em] text-g7 tabular hi:tracking-normal">
            {t("reference", { ref: sent.refNo })}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <a
              href={waLinkTo(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center gap-[9px] rounded-btn bg-em7 px-5 font-sans text-[14px] leading-none font-semibold text-iv no-underline shadow-ring-gold hover:text-iv"
            >
              <Icon name="whatsapp" className="size-[17px]" />
              {t("continueWa")}
            </a>
            <button
              type="button"
              onClick={() => {
                reset(inquiryDefaults(getValues("course")));
                setSent(null);
                setServerError(null);
                setResetKey((k) => k + 1);
                setPhase("idle");
              }}
              className="h-12 cursor-pointer rounded-btn border-0 bg-transparent px-[18px] font-sans text-[14px] leading-none font-semibold text-em7 shadow-ring-em hover:bg-em1"
            >
              {t("another")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorRow({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <span
      id={id}
      role="alert"
      className={cn("flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.35] font-medium text-sin", className)}
    >
      <span className="block size-[14px] flex-none">
        <Icon name="alert" />
      </span>
      {children}
    </span>
  );
}
