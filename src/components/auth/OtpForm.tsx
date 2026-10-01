"use client";

import { useState, useRef, useEffect, type FormEvent, type ReactNode } from "react";
import type { ErrorCode } from "@/lib/domain/errors";
import type { Locale, OtpPurpose } from "@/lib/domain/enums";
import { requestOtpAction, verifyOtpAction } from "@/server/auth/actions";
import { TurnstileWidget } from "./TurnstileWidget";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

export type OtpLabels = {
  title?: string;
  emailLabel: string;
  emailPlaceholder: string;
  sendCode: string;
  sending: string;
  enterCode: string;
  codeSentTo: string;
  verify: string;
  verifying: string;
  resendCode: string;
  resendIn: string;
  changeEmail: string;
  errors: Record<ErrorCode, string>;
};

export type OtpFormProps = {
  purpose: OtpPurpose;
  locale: Locale;
  labels: OtpLabels;
  next?: string;
  onDone: (next: string) => void;
};

export function OtpForm({
  purpose,
  locale,
  labels,
  next,
  onDone,
}: OtpFormProps): React.JSX.Element {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [countdown, setCountdown] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || isPending) return;

    setError(null);
    setIsPending(true);

    try {
      const res = await requestOtpAction({
        email: trimmed,
        purpose,
        turnstileToken: turnstileToken ?? undefined,
        locale,
      });

      if (res.ok) {
        setStep("code");
        setCode(["", "", "", "", "", ""]);
        setCountdown(30);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 50);
      } else {
        const msg = labels.errors[res.code] || labels.errors.INTERNAL;
        setError(msg);
        setResetKey((k) => k + 1);
      }
    } catch {
      setError(labels.errors.INTERNAL);
      setResetKey((k) => k + 1);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerify = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6 || isPending) return;

    setError(null);
    setIsPending(true);

    try {
      const res = await verifyOtpAction({
        email: email.trim().toLowerCase(),
        purpose,
        code: fullCode,
        next,
      });

      if (res.ok) {
        onDone(res.data.next);
      } else {
        const msg = labels.errors[res.code] || labels.errors.INTERNAL;
        setError(msg);
      }
    } catch {
      setError(labels.errors.INTERNAL);
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isPending) return;
    setError(null);
    setIsPending(true);

    try {
      const res = await requestOtpAction({
        email: email.trim().toLowerCase(),
        purpose,
        turnstileToken: turnstileToken ?? undefined,
        locale,
      });

      if (res.ok) {
        setCountdown(30);
      } else {
        setError(labels.errors[res.code] || labels.errors.INTERNAL);
      }
    } catch {
      setError(labels.errors.INTERNAL);
    } finally {
      setIsPending(false);
    }
  };

  const handleChangeDigit = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] ?? "";
    }
    setCode(newCode);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="w-full max-w-[420px] rounded-lg border border-[#EAE0CA] bg-white p-6 shadow-sm md:p-8">
      {labels.title && (
        <h2 className="mb-6 font-serif text-2xl font-bold tracking-tight text-ink">
          {labels.title}
        </h2>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <label htmlFor="otp-email" className="flex flex-col gap-[7px]">
            <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">
              {labels.emailLabel}
            </span>
            <span
              className={cn(
                "flex h-12 items-stretch rounded-field bg-white transition-shadow duration-150",
                error ? "shadow-ring-error" : "shadow-ring-sand focus-within:shadow-ring-focus",
              )}
            >
              <input
                id="otp-email"
                type="email"
                required
                autoComplete="email"
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.emailPlaceholder}
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-[14px] font-sans text-[15.5px] font-medium text-ink outline-none"
              />
            </span>
          </label>

          <TurnstileWidget
            action="otp"
            resetKey={resetKey}
            onToken={setTurnstileToken}
          />

          {error && (
            <div
              role="alert"
              className="flex items-center gap-1.5 font-sans text-[12.5px] font-medium text-sin"
            >
              <span className="block size-[14px] flex-none">
                <Icon name="alert" />
              </span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className={buttonClass("primary", "md", "w-full cursor-pointer mt-2")}
          >
            {isPending ? labels.sending : labels.sendCode}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div>
            <span className="font-sans text-[12.5px] font-semibold text-ink">
              {labels.enterCode}
            </span>
            <p className="mt-1 font-sans text-[13.5px] text-ink6">
              {labels.codeSentTo.replace("{email}", email)}
            </p>
          </div>

          {/* 6 numeric boxes */}
          <div className="flex justify-between gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                id={`otp-code-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                disabled={isPending}
                value={digit}
                onChange={(e) => handleChangeDigit(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className={cn(
                  "size-12 rounded-field text-center font-mono text-xl font-bold text-ink transition-shadow outline-none",
                  error
                    ? "shadow-ring-error bg-white"
                    : "shadow-ring-sand bg-white focus:shadow-ring-focus",
                )}
              />
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-1.5 font-sans text-[12.5px] font-medium text-sin"
            >
              <span className="block size-[14px] flex-none">
                <Icon name="alert" />
              </span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || code.join("").length !== 6}
            className={buttonClass("primary", "md", "w-full cursor-pointer mt-1")}
          >
            {isPending ? labels.verifying : labels.verify}
          </button>

          <div className="flex items-center justify-between text-[13.5px]">
            <button
              type="button"
              disabled={isPending || countdown > 0}
              onClick={handleResend}
              className="font-sans font-medium text-em7 hover:underline disabled:cursor-not-allowed disabled:text-ink6 disabled:no-underline"
            >
              {countdown > 0
                ? labels.resendIn.replace("{seconds}", String(countdown))
                : labels.resendCode}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setStep("email");
                setError(null);
                setResetKey((k) => k + 1);
              }}
              className="font-sans font-medium text-ink6 hover:text-ink hover:underline"
            >
              {labels.changeEmail}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
