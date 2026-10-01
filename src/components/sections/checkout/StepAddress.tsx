"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { addressSchema } from "@/lib/validation/checkout";
import { INDIAN_STATES, type IndianState } from "@/lib/domain/india";
import { usePincode } from "@/lib/hooks/usePincode";
import { useCheckout } from "./useCheckout";
import { FIELD_LABEL, inputCls, ErrorRow } from "@/components/sections/booking/ui";
import { Icon } from "@/components/icons/Icon";

export function StepAddress({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("checkout");
  const { address, setAddress } = useCheckout();
  const { check: checkPincode, state: pincodeState } = usePincode();

  const [errors, setErrors] = useState<Partial<Record<keyof typeof address, string>>>({});

  // Auto-check pincode if already present
  useEffect(() => {
    if (address.pincode && /^[1-9]\d{5}$/.test(address.pincode)) {
      void checkPincode(address.pincode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When pincode lookup finishes, auto-populate city and state
  useEffect(() => {
    if (pincodeState.status === "ready" && pincodeState.data) {
      const updates: Partial<typeof address> = {};
      if (pincodeState.data.city && !address.city) {
        updates.city = pincodeState.data.city;
      }
      if (
        pincodeState.data.state &&
        INDIAN_STATES.includes(pincodeState.data.state as IndianState)
      ) {
        updates.state = pincodeState.data.state as IndianState;
      }
      if (Object.keys(updates).length > 0) {
        setAddress(updates);
      }
    }
  }, [pincodeState.status, pincodeState.data, address.city, setAddress]);

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setAddress({ pincode: clean });
    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));

    if (/^[1-9]\d{5}$/.test(clean)) {
      void checkPincode(clean);
    }
  };

  const validate = () => {
    const res = addressSchema.safeParse(address);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof typeof address, string>> = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as keyof typeof address;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="m-0 font-title text-[22px] leading-tight font-normal text-em9">
          {t("addressTitle")}
        </h2>
        <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
          {t("addressSub")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* PIN Code first */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-pincode" className={FIELD_LABEL}>
            {t("fields.pincode")} <span className="text-sin">*</span>
          </label>
          <div className="relative">
            <input
              id="chk-pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={address.pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder={t("placeholders.pincode")}
              className={inputCls(Boolean(errors.pincode))}
              aria-invalid={Boolean(errors.pincode)}
              aria-describedby={errors.pincode ? "err-chk-pincode" : undefined}
            />
            {pincodeState.status === "loading" && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-sans text-[12px] text-ink6">
                {t("checking")}
              </span>
            )}
            {pincodeState.status === "ready" && pincodeState.data && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 font-sans text-[12px] text-ok">
                <Icon name="check" className="size-4" />
                {pincodeState.data.city}
              </span>
            )}
          </div>
          {errors.pincode && <ErrorRow id="err-chk-pincode">{errors.pincode}</ErrorRow>}
        </div>

        {/* Line 1 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-line1" className={FIELD_LABEL}>
            {t("fields.line1")} <span className="text-sin">*</span>
          </label>
          <input
            id="chk-line1"
            name="line1"
            type="text"
            autoComplete="address-line1"
            value={address.line1}
            onChange={(e) => {
              setAddress({ line1: e.target.value });
              if (errors.line1) setErrors((prev) => ({ ...prev, line1: undefined }));
            }}
            placeholder={t("placeholders.line1")}
            className={inputCls(Boolean(errors.line1))}
            aria-invalid={Boolean(errors.line1)}
            aria-describedby={errors.line1 ? "err-chk-line1" : undefined}
          />
          {errors.line1 && <ErrorRow id="err-chk-line1">{errors.line1}</ErrorRow>}
        </div>

        {/* Line 2 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-line2" className={FIELD_LABEL}>
            {t("fields.line2")}
          </label>
          <input
            id="chk-line2"
            name="line2"
            type="text"
            autoComplete="address-line2"
            value={address.line2}
            onChange={(e) => setAddress({ line2: e.target.value })}
            placeholder={t("placeholders.line2")}
            className={inputCls()}
          />
        </div>

        {/* Landmark */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chk-landmark" className={FIELD_LABEL}>
            {t("fields.landmark")}
          </label>
          <input
            id="chk-landmark"
            name="landmark"
            type="text"
            value={address.landmark}
            onChange={(e) => setAddress({ landmark: e.target.value })}
            placeholder={t("placeholders.landmark")}
            className={inputCls()}
          />
        </div>

        {/* City & State (2 columns) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="chk-city" className={FIELD_LABEL}>
              {t("fields.city")} <span className="text-sin">*</span>
            </label>
            <input
              id="chk-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={address.city}
              onChange={(e) => {
                setAddress({ city: e.target.value });
                if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
              }}
              placeholder={t("placeholders.city")}
              className={inputCls(Boolean(errors.city))}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "err-chk-city" : undefined}
            />
            {errors.city && <ErrorRow id="err-chk-city">{errors.city}</ErrorRow>}
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="chk-state" className={FIELD_LABEL}>
              {t("fields.state")} <span className="text-sin">*</span>
            </label>
            <select
              id="chk-state"
              name="state"
              autoComplete="address-level1"
              value={address.state}
              onChange={(e) => {
                setAddress({ state: e.target.value as IndianState });
                if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
              }}
              className={`${inputCls(Boolean(errors.state))} h-[52px] cursor-pointer`}
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? "err-chk-state" : undefined}
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && <ErrorRow id="err-chk-state">{errors.state}</ErrorRow>}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[52px] items-center gap-1.5 rounded-btn px-4 font-sans text-[14px] font-semibold text-em7 hover:bg-em1 transition-colors cursor-pointer"
        >
          <span className="block size-4">
            <Icon name="arrowL" />
          </span>
          {t("back")}
        </button>
        <button
          type="submit"
          className="flex h-[52px] flex-1 items-center justify-center rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer"
        >
          {t("continueToDelivery")}
        </button>
      </div>
    </form>
  );
}
