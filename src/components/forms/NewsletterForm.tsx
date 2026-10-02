"use client";

import { useState, useTransition, useRef, type FormEvent, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { subscribeAction } from "@/server/messages/actions";

type Status = "idle" | "pending" | "done" | "error";

export type NewsletterFormProps = {
  /** Unique id prefix for form fields (avoids collisions when rendered multiple times). */
  idPrefix: string;
  /** Label text for the email input. */
  label: string;
  /** Placeholder for the email input. */
  placeholder: string;
  /** Subscribe button text. */
  subscribe: string;
  /** Error message for invalid email. */
  errorText: string;
  /** Success message. */
  doneText: string;
  /** Source identifier for analytics (footer/home/checkout/account). */
  source: "footer" | "home" | "checkout" | "account";
  /** Optional extra content (e.g. WhatsApp link) rendered next to the subscribe button. */
  extra?: ReactNode;
  /** Optional: render the input + button with a custom wrapper (for layout flexibility). */
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
  doneClassName?: string;
};

export function NewsletterForm({
  idPrefix,
  label,
  placeholder,
  subscribe: subscribeTxt,
  errorText,
  doneText,
  source,
  extra,
  inputClassName,
  buttonClassName,
  errorClassName,
  doneClassName,
}: NewsletterFormProps): React.JSX.Element {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  if (status === "done") {
    return (
      <span
        role="status"
        className={doneClassName}
      >
        <Icon name="checkc" className="size-5 flex-none" />
        {doneText}
      </span>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus("error");
      return;
    }

    startTransition(async () => {
      const result = await subscribeAction({
        email: email.trim(),
        locale,
        source,
        turnstileToken: turnstileToken ?? undefined,
      });

      if (result.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setResetKey((k) => k + 1);
        setTurnstileToken(null);
      }
    });
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="contents">
        <label htmlFor={`${idPrefix}-email`} className="sr-only">
          {label}
        </label>
        <input
          ref={inputRef}
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          onFocus={() => setFocused(true)}
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? `${idPrefix}-err` : undefined}
          className={inputClassName}
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonClassName}
        >
          {isPending ? "…" : subscribeTxt}
        </button>
        {extra}
      </form>
      {focused && (
        <div className="hidden">
          <TurnstileWidget
            onToken={setTurnstileToken}
            action="newsletter"
            resetKey={resetKey}
          />
        </div>
      )}
      {status === "error" && (
        <span
          id={`${idPrefix}-err`}
          role="alert"
          className={errorClassName}
        >
          <Icon name="alert" className="size-3.5" />
          {errorText}
        </span>
      )}
    </>
  );
}
