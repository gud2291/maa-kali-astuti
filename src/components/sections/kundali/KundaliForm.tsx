"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { PlaceInput, type SelectedPlace } from "@/components/forms/PlaceInput";
import { cn } from "@/lib/utils/cn";
import type { K99Draft, K99Errors } from "@/lib/validation/astro";
import { ErrorRow, FIELD, LABEL, ringOf } from "./ui";

/* Kundali ₹99 form state (Kundali-99.dc.html 64–128): name; date + time of birth (2 columns from
   420px) with "I don't know my exact time" (greys the time, shows the noon note); the place
   combobox with GeoNames lookup; the report language segmented control;
   WhatsApp (+91, digits only, 10) + optional email; "Generate my Kundali" with the gold sheen. */

type Props = {
  f: K99Draft;
  err: K99Errors;
  today: string;
  set: <K extends keyof K99Draft>(k: K, v: K99Draft[K]) => void;
  /** The place was typed (the picked town is forgotten). */
  onPlace: (v: string) => void;
  onPick: (c: SelectedPlace) => void;
  onSubmit: (e: FormEvent) => void;
};

const TWO = "grid grid-cols-1 gap-x-3 gap-y-[18px] min-[420px]:grid-cols-2";

export function KundaliForm({ f, err, today, set, onPlace, onPick, onSubmit }: Props) {
  const t = useTranslations("k99.form");

  const errRow = (k: keyof K99Errors) =>
    err[k] ? <ErrorRow id={`k-${k}-err`}>{t(`err.${err[k]}`)}</ErrorRow> : null;
  const aria = (k: keyof K99Errors) => ({
    "aria-invalid": !!err[k],
    "aria-describedby": err[k] ? `k-${k}-err` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1 px-1.5">
        <span className="font-title text-[24px] leading-[1.2] text-em9">{t("title")}</span>
        <span className="font-sans text-[13px] leading-[1.45] font-medium text-ink6">{t("sub")}</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="k-name" className={LABEL}>
          {t("name")}
        </label>
        <input
          id="k-name"
          type="text"
          autoComplete="name"
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
          {...aria("name")}
          className={cn(FIELD, "px-3.5")}
          style={ringOf(!!err.name)}
        />
        {errRow("name")}
      </div>

      <div className={TWO}>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="k-dob" className={LABEL}>
            {t("dob")}
          </label>
          <input
            id="k-dob"
            type="date"
            min="1900-01-01"
            max={today}
            value={f.dob}
            onChange={(e) => set("dob", e.target.value)}
            {...aria("dob")}
            className={cn(FIELD, "px-3")}
            style={ringOf(!!err.dob)}
          />
          {errRow("dob")}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="k-tob" className={LABEL}>
            {t("tob")}
          </label>
          <input
            id="k-tob"
            type="time"
            value={f.tob}
            onChange={(e) => set("tob", e.target.value)}
            disabled={f.unknown}
            {...aria("tob")}
            className={cn(FIELD, "px-3")}
            style={{ ...ringOf(!!err.tob), backgroundColor: f.unknown ? "#F4EDDD" : "#FFFDF8" }}
          />
          {errRow("tob")}
        </div>
      </div>

      <label className="-mt-1.5 flex min-h-8 cursor-pointer items-center gap-2.5 font-sans text-[14px] leading-[1.4] font-medium text-ink">
        <input
          type="checkbox"
          checked={f.unknown}
          onChange={(e) => set("unknown", e.target.checked)}
          className="m-0 size-[18px] accent-em7"
        />
        {t("unknown")}
      </label>
      {f.unknown && (
        <span className="-mt-2 font-sans text-[12.5px] leading-[1.5] font-medium text-ink6">{t("noon")}</span>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="k-place" className={LABEL}>
          {t("place")}
        </label>
        <PlaceInput
          id="k-place"
          value={f.place}
          onChange={(val) => {
            onPlace(val);
          }}
          onSelect={(p) => {
            // onPick sets the label itself; calling onPlace here would clear the picked place.
            onPick(p);
          }}
          placeholder={t("placeHint")}
          icon={<Icon name="pin" />}
          hasError={!!err.place}
          aria-describedby={err.place ? "k-place-err" : undefined}
          className={cn(FIELD, "pr-3.5 pl-[42px]")}
          style={ringOf(!!err.place)}
        />
        {errRow("place")}
      </div>

      <div role="radiogroup" aria-labelledby="k-l-lang" className="flex flex-wrap items-center justify-between gap-2.5">
        <span id="k-l-lang" className={LABEL}>
          {t("lang")}
        </span>
        <span className="inline-flex gap-1 rounded-btn bg-s1 p-1">
          {(
            [
              ["en", "English", "font-sans text-[14px] leading-none font-semibold"],
              ["hi", "हिंदी", "font-hi text-[16px] leading-none font-normal"],
            ] as const
          ).map(([v, label, font]) => {
            const sel = f.lang === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={sel}
                lang={v}
                onClick={() => set("lang", v)}
                className={cn(
                  "h-10 min-w-[92px] cursor-pointer rounded-field border-none px-4 transition-colors duration-200",
                  font,
                  sel ? "bg-cream text-em9 shadow-[0_4px_12px_-6px_rgba(14,59,48,.35)]" : "bg-transparent text-ink6",
                )}
              >
                {label}
              </button>
            );
          })}
        </span>
      </div>

      <div className={TWO}>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="k-phone" className={LABEL}>
            {t("phone")}
          </label>
          <div
            className="flex h-[52px] rounded-field bg-cream focus-within:shadow-[inset_0_0_0_1.5px_#164E3F]!"
            style={ringOf(!!err.phone)}
          >
            <span className="flex items-center px-2.5 font-sans text-[15px] leading-none font-semibold text-ink6 shadow-[inset_-1px_0_0_#EAE0CA]">
              +91
            </span>
            <input
              id="k-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={f.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              {...aria("phone")}
              className="h-full min-w-0 flex-1 border-none bg-transparent px-3 font-sans text-[16px] leading-[1.2] font-medium text-ink tabular outline-none"
            />
          </div>
          {errRow("phone")}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="k-email" className={LABEL}>
            {t("email")} <span className="font-medium text-ink6">{t("optional")}</span>
          </label>
          <input
            id="k-email"
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={(e) => set("email", e.target.value.trim())}
            {...aria("email")}
            className={cn(FIELD, "px-3.5")}
            style={ringOf(!!err.email)}
          />
          {errRow("email")}
        </div>
      </div>

      <button
        type="submit"
        className="sheen mt-1 flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-em7 font-sans text-[15.5px] leading-none font-semibold tracking-[.02em] text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]"
      >
        <span className="block size-[19px]">
          <Icon name="kundali" />
        </span>
        {t("submit")}
      </button>
      <span className="flex items-center justify-center gap-[7px] text-center font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">
        <span className="block size-3.5 flex-none text-g5">
          <Icon name="lock" />
        </span>
        {t("privacy")}
      </span>
    </form>
  );
}
