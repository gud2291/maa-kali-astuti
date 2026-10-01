"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { InlineArt } from "@/components/ui/InlineArt";
import type { ServiceKey } from "@/lib/api/consult";
import { PALM_LIGHT_SVG } from "@/lib/art/service-art";
import { placeSearch } from "@/lib/astro/kundali";
import { cn } from "@/lib/utils/cn";
import type { BookingDetails, BookingErrors, SessionLang } from "@/lib/validation/booking";
import { useUpload } from "@/components/media/useUpload";
import { useUi } from "@/stores/ui";
import { ErrorRow, FIELD_LABEL, GROUP_TITLE, inputCls } from "./ui";

/* Step 2 · Details (Booking.dc.html 101–233). Name + WhatsApp (+91, digits only, 10) · Email
   (optional). Per service:
   - kundali: birth block (date, time with "I don't know", place combobox over 32 towns);
   - numerology: "Name & numbers" (date, mobile to analyse, business name);
   - palmistry: photo guide (3 tiles) + left/right palm uploads with preview and Remove;
   - tarot: the question becomes required.
   Then the question (textarea) and the session language (हिंदी / English segmented control).
   Errors show only after a failed Continue (`E` is empty until then). */

export type PalmSide = "left" | "right";
export type PalmFile = {
  url: string;
  name: string;
  mediaId?: number;
  claimKey?: string;
};

type Setter = <K extends keyof BookingDetails>(key: K, v: BookingDetails[K]) => void;

const digits = (v: string) => v.replace(/\D/g, "").slice(0, 10);

/** The guide tiles (Booking 554–555): art transform, shaded "don't" tile, ✓ / ✕ badge. */
const GUIDE = [
  { tf: "none", shade: false, ok: true },
  { tf: "scale(.84)", shade: false, ok: true },
  { tf: "rotate(-14deg)", shade: true, ok: false },
] as const;

export function StepDetails({
  svc,
  f,
  set,
  E,
  palm,
  onPalm,
  todayIso,
}: {
  svc: ServiceKey;
  f: BookingDetails;
  set: Setter;
  E: BookingErrors;
  palm: Record<PalmSide, PalmFile | null>;
  onPalm: (side: PalmSide, file: PalmFile | null) => void;
  todayIso: string;
}) {
  const t = useTranslations("booking");
  const isKundali = svc === "kundali";
  const isNum = svc === "numerology";
  const isPalm = svc === "palm";
  const err = (k: keyof BookingErrors) => (E[k] ? t(`err.${E[k]}`) : undefined);
  const guide = t.raw("s2.palms.guide") as string[];

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 min-[560px]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="bk-name" className={FIELD_LABEL}>
            {t("s2.name")}
          </label>
          <input
            id="bk-name"
            type="text"
            autoComplete="name"
            maxLength={80}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!E.name}
            aria-describedby={E.name ? "bk-name-err" : undefined}
            className={cn(inputCls(!!E.name), "h-[52px]")}
          />
          {E.name && <ErrorRow id="bk-name-err">{err("name")}</ErrorRow>}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="bk-phone" className={FIELD_LABEL}>
            {t("s2.phone")}
          </label>
          <PhoneBox bad={!!E.phone}>
            <input
              id="bk-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              value={f.phone}
              onChange={(e) => set("phone", digits(e.target.value))}
              aria-invalid={!!E.phone}
              aria-describedby={E.phone ? "bk-phone-err" : undefined}
              className={PHONE_INPUT}
            />
          </PhoneBox>
          {E.phone && <ErrorRow id="bk-phone-err">{err("phone")}</ErrorRow>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="bk-email" className={FIELD_LABEL}>
          {t("s2.email")} <span className="font-medium text-ink6">{t("s2.emailOpt")}</span>
        </label>
        <input
          id="bk-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={80}
          value={f.email}
          onChange={(e) => set("email", e.target.value.trim())}
          aria-invalid={!!E.email}
          aria-describedby={E.email ? "bk-email-err" : undefined}
          className={cn(inputCls(!!E.email), "h-[52px]")}
        />
        {E.email && <ErrorRow id="bk-email-err">{err("email")}</ErrorRow>}
      </div>

      {(isKundali || isNum) && (
        <div className="flex flex-col gap-[18px] border-t border-s2 pt-[22px]">
          <span className={GROUP_TITLE}>{t(isKundali ? "s2.birth.kundali" : "s2.birth.numerology")}</span>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 min-[560px]:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor="bk-dob" className={FIELD_LABEL}>
                {t("s2.dob")}
              </label>
              <input
                id="bk-dob"
                type="date"
                autoComplete="bday"
                max={todayIso}
                value={f.dob}
                onChange={(e) => set("dob", e.target.value)}
                aria-invalid={!!E.dob}
                aria-describedby={E.dob ? "bk-dob-err" : undefined}
                className={cn(inputCls(!!E.dob), "h-[52px]")}
              />
              {E.dob && <ErrorRow id="bk-dob-err">{err("dob")}</ErrorRow>}
            </div>
            {isKundali && (
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="bk-tob" className={FIELD_LABEL}>
                  {t("s2.tob")}
                </label>
                <input
                  id="bk-tob"
                  type="time"
                  value={f.tob}
                  onChange={(e) => set("tob", e.target.value)}
                  disabled={f.unknown}
                  aria-invalid={!!E.tob}
                  aria-describedby={E.tob ? "bk-tob-err" : undefined}
                  className={cn(inputCls(!!E.tob), "h-[52px]", f.unknown && "bg-s1")}
                />
                <label className="flex min-h-8 cursor-pointer items-center gap-2.5 font-sans text-[13.5px] leading-[1.4] font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={f.unknown}
                    onChange={(e) => set("unknown", e.target.checked)}
                    className="m-0 size-[18px] accent-em7"
                  />
                  {t("s2.unknown")}
                </label>
                {E.tob && <ErrorRow id="bk-tob-err">{err("tob")}</ErrorRow>}
              </div>
            )}
            {isNum && (
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="bk-mob" className={FIELD_LABEL}>
                  {t("s2.mob")}
                </label>
                <PhoneBox bad={!!E.mobile}>
                  <input
                    id="bk-mob"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={f.mobile}
                    onChange={(e) => set("mobile", digits(e.target.value))}
                    placeholder={t("s2.mobPh")}
                    aria-invalid={!!E.mobile}
                    aria-describedby={E.mobile ? "bk-mob-err" : undefined}
                    className={PHONE_INPUT}
                  />
                </PhoneBox>
                {E.mobile && <ErrorRow id="bk-mob-err">{err("mobile")}</ErrorRow>}
              </div>
            )}
          </div>
          {isKundali && (
            <PlaceField value={f.place} onChange={(v) => set("place", v)} error={err("place")} />
          )}
          {isNum && (
            <div className="flex flex-col gap-2">
              <label htmlFor="bk-biz" className={FIELD_LABEL}>
                {t("s2.biz")} <span className="font-medium text-ink6">{t("s2.optional")}</span>
              </label>
              <input
                id="bk-biz"
                type="text"
                autoComplete="organization"
                maxLength={80}
                value={f.biz}
                onChange={(e) => set("biz", e.target.value)}
                className={cn(inputCls(false), "h-[52px]")}
              />
            </div>
          )}
        </div>
      )}

      {isPalm && (
        <div className="flex flex-col gap-4 border-t border-s2 pt-[22px]">
          <div className="flex flex-col gap-1.5">
            <span className={GROUP_TITLE}>{t("s2.palms.title")}</span>
            <span className="font-sans text-[14px] leading-[1.55] font-medium text-pretty text-ink6">
              {t("s2.palms.body")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {GUIDE.map((g, i) => (
              <figure key={i} className="m-0 flex flex-col gap-2">
                <span className="relative block aspect-square overflow-hidden rounded-btn bg-s1">
                  <span
                    aria-hidden="true"
                    className="absolute top-[8%] right-[12%] bottom-[4%] left-[4%] block"
                    style={{ transform: g.tf }}
                  >
                    <InlineArt svg={PALM_LIGHT_SVG} uid={`bk-hand-${i}`} />
                  </span>
                  {g.shade && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(118deg,rgba(14,59,48,0)_52%,rgba(14,59,48,.42)_53%)]"
                    />
                  )}
                  <span
                    className={cn(
                      "absolute top-2 right-2 grid size-6 place-items-center rounded-pill text-iv",
                      g.ok ? "bg-ok" : "bg-sin",
                    )}
                  >
                    <Icon name={g.ok ? "check" : "close"} className="size-3.5" />
                  </span>
                </span>
                <figcaption className="font-sans text-[12.5px] leading-[1.4] font-medium text-pretty text-ink">
                  {guide[i]}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["left", "right"] as const).map((side) => (
              <PalmUpload key={side} side={side} file={palm[side]} error={err(side)} onPick={onPalm} />
            ))}
          </div>
          <span className="flex items-start gap-2 font-sans text-[12.5px] leading-[1.5] font-medium text-ink6">
            <Icon name="lock" className="mt-px size-[15px] flex-none text-g5" />
            {t("s2.palms.private")}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-s2 pt-[22px]">
        <label htmlFor="bk-q" className={GROUP_TITLE}>
          {t(`s2.q.${svc}.title`)}
        </label>
        <span id="bk-q-hint" className="font-sans text-[13.5px] leading-[1.5] font-medium text-ink6">
          {t(`s2.q.${svc}.hint`)}
        </span>
        <textarea
          id="bk-q"
          rows={4}
          maxLength={1000}
          value={f.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder={t(`s2.q.${svc}.ph`)}
          aria-invalid={!!E.q}
          aria-describedby={E.q ? "bk-q-hint bk-q-err" : "bk-q-hint"}
          className={cn(inputCls(!!E.q), "min-h-[120px] resize-y py-3.5 leading-[1.55]")}
        />
        {E.q && <ErrorRow id="bk-q-err">{err("q")}</ErrorRow>}
      </div>

      <div role="radiogroup" aria-labelledby="bk-l-lang" className="flex flex-col gap-2.5">
        <span id="bk-l-lang" className={FIELD_LABEL}>
          {t("s2.lang")}
        </span>
        <div className="inline-flex gap-1 self-start rounded-btn bg-s1 p-1">
          {(
            [
              ["hi", "हिंदी"],
              ["en", "English"],
            ] as [SessionLang, string][]
          ).map(([v, label]) => {
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
                  "h-11 rounded-field border-0 px-5 transition-colors duration-200",
                  v === "hi"
                    ? "font-hi text-[16px] leading-none font-normal"
                    : "font-sans text-[14.5px] leading-none font-semibold",
                  sel ? "bg-cream text-em9 shadow-[0_4px_12px_-6px_rgba(14,59,48,.35)]" : "bg-transparent text-ink6",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

const PHONE_INPUT =
  "h-full min-w-0 flex-1 rounded-field border-0 bg-transparent px-[14px] font-sans text-[16px] leading-[1.2] font-medium text-ink tabular outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F] focus-visible:outline-none";

/** "+91" prefix box (Booking 111–113, 140–143). */
function PhoneBox({ bad, children }: { bad: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-[52px] rounded-field bg-cream",
        bad ? "shadow-[inset_0_0_0_1px_#A8322D]" : "shadow-ring-sand",
      )}
    >
      <span className="flex items-center px-3 font-sans text-[15px] leading-none font-semibold text-ink6 shadow-[inset_-1px_0_0_#EAE0CA]">
        +91
      </span>
      {children}
    </div>
  );
}

/** Place of birth combobox (Booking 150–171, placeRes 559): prefix matches first, then
 *  "contains", max 6; picking writes "Town, State". The list closes 160 ms after blur so a
 *  mouse pick lands first. Keyboard (our addition): ↑/↓ move, Enter picks, Esc closes. */
function PlaceField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(-1);
  const blurT = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(blurT.current), []);

  const q = value.trim();
  const res = q ? placeSearch(q) : [];
  const show = open && res.length > 0;
  const pick = (i: number) => {
    const c = res[i];
    if (!c) return;
    onChange(`${c[0]}, ${c[1]}`);
    setOpen(false);
    setAct(-1);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!res.length) return;
      e.preventDefault();
      setOpen(true);
      const n = res.length;
      setAct((a) => (e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
    } else if (e.key === "Enter" && show && act > -1) {
      e.preventDefault();
      pick(act);
    } else if (e.key === "Escape" && show) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="bk-place" className={FIELD_LABEL}>
        {t("s2.place")}
      </label>
      <div className="relative">
        <input
          id="bk-place"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="bk-place-list"
          aria-expanded={show}
          aria-activedescendant={show && act > -1 ? `bk-place-${act}` : undefined}
          autoComplete="off"
          maxLength={80}
          placeholder={t("s2.placePh")}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
            setOpen(true);
            setAct(-1);
          }}
          onFocus={() => {
            clearTimeout(blurT.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurT.current = setTimeout(() => setOpen(false), 160);
          }}
          onKeyDown={onKey}
          aria-invalid={!!error}
          aria-describedby={error ? "bk-place-err" : undefined}
          className={cn(inputCls(!!error), "h-[52px] pl-[42px]")}
        />
        <Icon name="pin" className="pointer-events-none absolute top-4 left-3.5 size-5 text-g5" />
        {show && (
          <ul
            id="bk-place-list"
            role="listbox"
            className="absolute top-[calc(100%+6px)] right-0 left-0 z-[6] m-0 list-none rounded-btn bg-cream p-1.5 shadow-card"
          >
            {res.map((c, i) => (
              <li
                key={c[0] + c[1]}
                id={`bk-place-${i}`}
                role="option"
                aria-selected={i === act}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(i);
                }}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-field px-2.5 py-2 hover:bg-s1",
                  i === act && "bg-s1",
                )}
              >
                <span className="font-sans text-[14.5px] leading-[1.2] font-semibold text-ink">{c[0]}</span>
                <span className="font-sans text-[12.5px] leading-[1.2] font-medium text-ink6">{c[1]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <ErrorRow id="bk-place-err">{error}</ErrorRow>}
    </div>
  );
}

/** One palm upload tile (Booking 197–214, palms 556–557): dashed brass frame (dashed red when
 *  missing after Continue), camera circle + "Tap to take or upload"; once chosen, uploads
 *  immediately with useUpload("palm"), fills the 4:5 tile and shows progress/retry/remove. */
function PalmUpload({
  side,
  file,
  error,
  onPick,
}: {
  side: PalmSide;
  file: PalmFile | null;
  error?: string;
  onPick: (side: PalmSide, file: PalmFile | null) => void;
}) {
  const t = useTranslations("booking.s2.palms");
  const label = t(side);
  const { state, upload, reset } = useUpload("palm");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!picked) return;
    if (!/^image\//.test(picked.type)) {
      useUi.getState().toast({ msg: t("notImage"), tone: "err" });
      return;
    }
    if (picked.size > 15 * 1024 * 1024) {
      useUi.getState().toast({ msg: t("tooBig"), tone: "err" });
      return;
    }

    setSelectedFile(picked);
    const previewUrl = URL.createObjectURL(picked);
    // Mark as uploading in parent state (no mediaId/claimKey yet)
    onPick(side, { url: previewUrl, name: picked.name });

    const result = await upload(picked);
    if (result && result.claimKey) {
      onPick(side, {
        url: previewUrl,
        name: picked.name,
        mediaId: result.mediaId,
        claimKey: result.claimKey,
      });
    } else {
      onPick(side, null);
    }
  };

  const handleRetry = async () => {
    if (!selectedFile) return;
    const previewUrl = URL.createObjectURL(selectedFile);
    onPick(side, { url: previewUrl, name: selectedFile.name });
    const result = await upload(selectedFile);
    if (result && result.claimKey) {
      onPick(side, {
        url: previewUrl,
        name: selectedFile.name,
        mediaId: result.mediaId,
        claimKey: result.claimKey,
      });
    } else {
      onPick(side, null);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    reset();
    onPick(side, null);
  };

  const isUploading =
    state.status === "preparing" ||
    state.status === "uploading" ||
    state.status === "confirming";
  const isError = state.status === "error";

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className={cn(
          "relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-btn bg-cream p-3.5 text-center transition-colors duration-200 hover:bg-s1",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-g5 has-[:focus-visible]:outline-solid",
          file?.mediaId
            ? "border border-transparent shadow-ring-g5"
            : error || isError
              ? "border border-dashed border-sin"
              : "border border-dashed border-g5",
        )}
      >
        <input
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={handleFileChange}
          aria-label={t("upload", { side })}
          aria-invalid={!!error || isError}
          aria-describedby={error ? `bk-${side}-err` : undefined}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        {file ? (
          // A local object URL of the visitor's own photo: next/image can't optimise blob: URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={t("alt", { label })}
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            <span className="pointer-events-none grid size-[46px] place-items-center rounded-pill bg-s1 text-em7">
              <Icon name="camera" className="size-[22px]" />
            </span>
            <span className="pointer-events-none flex flex-col gap-1">
              <span className="font-sans text-[14.5px] leading-[1.2] font-bold text-em9">{label}</span>
              <span className="font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">{t("tap")}</span>
            </span>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[rgba(14,59,48,.8)] p-3 text-iv">
            <Icon name="clock" className="size-6 animate-spin text-g3" />
            <span className="font-sans text-[12px] font-semibold text-iv">{t("uploading")}</span>
            <span className="font-sans text-[11px] font-bold text-g3 tabular">{state.progress}%</span>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[rgba(168,50,45,.85)] p-3 text-iv">
            <Icon name="close" className="size-5 text-iv" />
            <span className="font-sans text-[11px] font-medium text-center text-iv">{t("uploadFailed")}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRetry();
              }}
              className="h-7 rounded-btn bg-iv px-2.5 font-sans text-[11px] font-bold text-em9"
            >
              {t("retry")}
            </button>
          </div>
        )}
      </label>
      {file && file.mediaId && (
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 font-sans text-[12.5px] leading-[1.3] font-semibold text-ok">
            <Icon name="checkc" className="size-[14px] flex-none" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{t("added", { label })}</span>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="min-h-11 flex-none border-0 bg-transparent px-1 font-sans text-[13px] leading-none font-semibold text-em7 underline underline-offset-[3px]"
          >
            {t("remove")}
          </button>
        </div>
      )}
      {error && !isError && <ErrorRow id={`bk-${side}-err`}>{error}</ErrorRow>}
    </div>
  );
}
