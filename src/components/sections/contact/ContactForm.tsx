"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { submitContactAction } from "@/server/messages/actions";
import { MESSAGE_TOPICS, type MessageTopic } from "@/lib/domain/enums";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "pending" | "done" | "error";

const FIELD =
  "w-full rounded-field border border-s2 bg-cream px-3.5 py-3 font-sans text-[15px] leading-[1.4] font-medium text-ink outline-none transition-colors focus:border-em7 placeholder:text-ink6";
const LABEL =
  "font-sans text-[13px] leading-[1.2] font-semibold text-ink";
const ERR_CLS =
  "flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.3] font-medium text-rose";

export function ContactForm(): React.JSX.Element {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<MessageTopic>("other");
  const [body, setBody] = useState("");

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-field border border-s2 bg-cream px-8 py-12 text-center">
        <span className="block size-12 text-em7">
          <Icon name="checkc" />
        </span>
        <span className="font-display text-[22px] leading-[1.2] font-normal text-ink">
          {t("form.success")}
        </span>
        <span className="font-sans text-[15px] leading-[1.5] font-medium text-ink6">
          {t("form.successSub")}
        </span>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    startTransition(async () => {
      const result = await submitContactAction({
        name,
        phone: phone || undefined,
        email: email || undefined,
        topic,
        body,
        locale,
        turnstileToken: turnstileToken ?? undefined,
      });

      if (result.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.code === "RATE_LIMITED") {
          setErrorMsg(t("form.rateLimited"));
        } else if (result.code === "BOT_CHECK_FAILED") {
          setErrorMsg(t("form.botCheck"));
        } else if (result.code === "VALIDATION") {
          setErrorMsg(t("form.validationError"));
        } else {
          setErrorMsg(t("form.genericError"));
        }
        setResetKey((k) => k + 1);
        setTurnstileToken(null);
      }
    });
  };

  const fe = (key: string): string | undefined => fieldErrors[key];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-name" className={LABEL}>
          {t("form.name")} <span className="text-rose">*</span>
        </label>
        <input
          id="cf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("form.namePh")}
          maxLength={80}
          aria-invalid={fe("name") ? true : undefined}
          aria-describedby={fe("name") ? "cf-name-err" : undefined}
          className={cn(FIELD, fe("name") && "border-rose")}
        />
        {fe("name") && (
          <span id="cf-name-err" role="alert" className={ERR_CLS}>
            <Icon name="alert" className="size-3.5" />
            {t("form.nameErr")}
          </span>
        )}
      </div>

      {/* Phone + Email row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-phone" className={LABEL}>
            {t("form.phone")}
          </label>
          <input
            id="cf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder={t("form.phonePh")}
            maxLength={10}
            aria-invalid={fe("phone") ? true : undefined}
            aria-describedby={fe("phone") ? "cf-phone-err" : undefined}
            className={cn(FIELD, fe("phone") && "border-rose")}
          />
          {fe("phone") && (
            <span id="cf-phone-err" role="alert" className={ERR_CLS}>
              <Icon name="alert" className="size-3.5" />
              {t("form.phoneErr")}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-email" className={LABEL}>
            {t("form.email")}
          </label>
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("form.emailPh")}
            maxLength={120}
            autoComplete="email"
            aria-invalid={fe("email") ? true : undefined}
            aria-describedby={fe("email") ? "cf-email-err" : undefined}
            className={cn(FIELD, fe("email") && "border-rose")}
          />
          {fe("email") && (
            <span id="cf-email-err" role="alert" className={ERR_CLS}>
              <Icon name="alert" className="size-3.5" />
              {t("form.emailErr")}
            </span>
          )}
        </div>
      </div>

      <p className="font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">
        {t("form.contactHint")}
      </p>

      {/* Topic */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-topic" className={LABEL}>
          {t("form.topic")} <span className="text-rose">*</span>
        </label>
        <select
          id="cf-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as MessageTopic)}
          className={cn(FIELD, "cursor-pointer appearance-none")}
        >
          {MESSAGE_TOPICS.map((k) => (
            <option key={k} value={k}>
              {t(`topics.${k}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-body" className={LABEL}>
          {t("form.message")} <span className="text-rose">*</span>
        </label>
        <textarea
          id="cf-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("form.messagePh")}
          maxLength={2000}
          rows={5}
          aria-invalid={fe("body") ? true : undefined}
          aria-describedby={fe("body") ? "cf-body-err" : undefined}
          className={cn(FIELD, "resize-y", fe("body") && "border-rose")}
        />
        {fe("body") && (
          <span id="cf-body-err" role="alert" className={ERR_CLS}>
            <Icon name="alert" className="size-3.5" />
            {t("form.bodyErr")}
          </span>
        )}
      </div>

      {/* Turnstile */}
      <TurnstileWidget
        onToken={setTurnstileToken}
        action="contact"
        resetKey={resetKey}
      />

      {/* Error banner */}
      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-field border border-rose bg-[rgba(235,207,201,.15)] px-3.5 py-3 font-sans text-[13.5px] leading-[1.4] font-medium text-rose">
          <Icon name="alert" className="size-4 flex-none" />
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 cursor-pointer rounded-btn border-0 bg-em7 px-6 font-sans text-[15px] leading-none font-semibold text-iv transition-colors hover:bg-em9 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t("form.sending") : t("form.send")}
      </button>
    </form>
  );
}
