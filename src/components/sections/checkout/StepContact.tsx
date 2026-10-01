"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { contactSchema } from "@/lib/validation/checkout";
import { saveDraftAction } from "@/server/cart/actions";
import { useCart } from "@/stores/cart";
import { useCheckout } from "./useCheckout";
import { FIELD_LABEL, inputCls, ErrorRow } from "@/components/sections/booking/ui";
import type { Quote } from "@/server/cart/quote";

export function StepContact({
  quote,
  onNext,
}: {
  quote: Quote | null;
  onNext: () => void;
}) {
  const t = useTranslations("checkout");
  const locale = (useLocale() === "hi" ? "hi" : "en") as "en" | "hi";
  const lines = useCart((s) => s.lines);
  const { contact, setContact, draftToken, setDraftToken } = useCheckout();

  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const validate = () => {
    const res = contactSchema.safeParse(contact);
    if (!res.success) {
      const fieldErrors: { name?: string; phone?: string; email?: string } = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as "name" | "phone" | "email";
        if (!fieldErrors[field]) {
          fieldErrors[field] = t(`errors.${field}`);
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save draft asynchronously without blocking navigation
    if (lines.length > 0) {
      void saveDraftAction({
        token: draftToken,
        email: contact.email.trim(),
        phone: contact.phone.trim() || undefined,
        name: contact.name.trim() || undefined,
        locale,
        lines: lines.map((l) => ({
          pid: l.pid,
          qty: l.qty,
          variant: l.variant ?? null,
          energ: l.energ ?? null,
        })),
        totalInr: quote?.totals.total ?? 0,
      }).then((res) => {
        if (res.ok && res.data.token) {
          setDraftToken(res.data.token);
        }
      });
    }

    onNext();
  };

  return (
    <form onSubmit={handleContinue} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="m-0 font-title text-[22px] leading-tight font-normal text-em9">
          {t("contactTitle")}
        </h2>
        <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
          {t("contactSub")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-name" className={FIELD_LABEL}>
            {t("fields.name")} <span className="text-sin">*</span>
          </label>
          <input
            id="chk-name"
            name="name"
            type="text"
            autoComplete="name"
            value={contact.name}
            onChange={(e) => {
              setContact({ name: e.target.value });
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder={t("placeholders.name")}
            className={inputCls(Boolean(errors.name))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "err-chk-name" : undefined}
          />
          {errors.name && <ErrorRow id="err-chk-name">{errors.name}</ErrorRow>}
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-phone" className={FIELD_LABEL}>
            {t("fields.phone")} <span className="text-sin">*</span>
          </label>
          <div className="flex items-center">
            <span className="flex h-[52px] items-center rounded-l-field border-r border-s2 bg-s1 px-3.5 font-sans text-[15px] font-semibold text-ink6">
              +91
            </span>
            <input
              id="chk-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={10}
              value={contact.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setContact({ phone: val });
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder={t("placeholders.phone")}
              className={`${inputCls(Boolean(errors.phone))} rounded-l-none`}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "err-chk-phone" : undefined}
            />
          </div>
          {errors.phone && <ErrorRow id="err-chk-phone">{errors.phone}</ErrorRow>}
          <span className="font-sans text-[11.5px] text-ink6">{t("phoneHelp")}</span>
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-email" className={FIELD_LABEL}>
            {t("fields.email")} <span className="text-sin">*</span>
          </label>
          <input
            id="chk-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={contact.email}
            onChange={(e) => {
              setContact({ email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder={t("placeholders.email")}
            className={inputCls(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "err-chk-email" : undefined}
          />
          {errors.email && <ErrorRow id="err-chk-email">{errors.email}</ErrorRow>}
        </div>
      </div>

      <div className="mt-2">
        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer"
        >
          {t("continueToAddress")}
        </button>
      </div>
    </form>
  );
}
