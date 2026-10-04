"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { OtpForm, type OtpLabels } from "@/components/auth/OtpForm";
import type { Locale } from "@/lib/domain/enums";
import { ERROR_CODES, type ErrorCode } from "@/lib/domain/errors";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons/Icon";

export function AccountLogin({
  next = "/account",
  locale = "en",
}: {
  next?: string;
  locale?: Locale;
}): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations("auth");

  // One friendly line per error code from the shared `errors` namespace (B09).
  const te = useTranslations("errors");
  const errors = Object.fromEntries(ERROR_CODES.map((k) => [k, te(k)])) as Record<ErrorCode, string>;

  const labels: OtpLabels = {
    title: t("title"),
    emailLabel: t("emailLabel"),
    emailPlaceholder: t("emailPlaceholder"),
    sendCode: t("sendCode"),
    sending: t("sending"),
    enterCode: t("enterCode"),
    codeSentTo: t("codeSentTo"),
    verify: t("verify"),
    verifying: t("verifying"),
    resendCode: t("resendCode"),
    resendIn: t("resendIn"),
    changeEmail: t("changeEmail"),
    errors,
  };

  const handleDone = (dest: string): void => {
    const target = dest || next || "/account";
    router.replace(target);
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center py-8 px-4 sm:py-16 sm:px-6">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-s2 bg-cream shadow-card lg:grid-cols-12">
        {/* Left Side: Brand & Spiritual Illustration Panel */}
        <div className="relative flex flex-col justify-between bg-em9 p-8 text-iv lg:col-span-5 lg:p-10">
          <div className="space-y-4">
            <Logo uid="account-login-logo" className="h-9 w-auto text-g3" />
            <div className="pt-4">
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-g3">
                {locale === "hi" ? "साधक पवन पाण्डेय" : "Sadhak Pawan Pandey"}
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-iv sm:text-3xl">
                {locale === "hi"
                  ? "पवित्र साधना एवं भक्ति का केंद्र"
                  : "Sacred Devotion & Vedic Sanctification"}
              </h2>
              <p className="mt-3 font-sans text-xs leading-relaxed text-iv/80 sm:text-sm">
                {locale === "hi"
                  ? "अपने ऑर्डर, कुंडली परामर्श और अभिमंत्रित वस्तुओं की स्थिति देखने के लिए लॉगिन करें।"
                  : "Sign in with your email OTP to manage your energized orders, birth details, and consultations."}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 border-t border-iv/15 pt-6 text-xs text-iv/75">
            <div className="flex items-center gap-2">
              <Icon name="shield" className="size-4 text-g3 shrink-0" />
              <span>
                {locale === "hi"
                  ? "100% सुरक्षित एवं पासवर्ड-मुक्त ओटीपी प्रवेश"
                  : "100% secure, passwordless instant OTP login"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="bolt" className="size-4 text-g3 shrink-0" />
              <span>
                {locale === "hi"
                  ? "सभी पिछले अतिथि ऑर्डर स्वतः आपके खाते से जुड़ जाते हैं"
                  : "Guest orders with this email are automatically linked"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Centered OTP Form */}
        <div className="flex flex-col items-center justify-center bg-cream p-6 sm:p-10 lg:col-span-7">
          <OtpForm
            purpose="login"
            locale={locale}
            labels={labels}
            next={next}
            onDone={handleDone}
          />
        </div>
      </div>
    </div>
  );
}
