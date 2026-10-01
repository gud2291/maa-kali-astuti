"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { addressSchema } from "@/lib/validation/checkout";
import { INDIAN_STATES, type IndianState } from "@/lib/domain/india";
import { usePincode } from "@/lib/hooks/usePincode";
import { useCheckout } from "./useCheckout";
import { FIELD_LABEL, inputCls, ErrorRow } from "@/components/sections/booking/ui";
import { Icon } from "@/components/icons/Icon";
import type { CheckoutPrefill } from "./CheckoutFlow";

export function StepAddress({
  prefill,
  onNext,
  onBack,
}: {
  prefill?: CheckoutPrefill;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("checkout");
  const { address, setAddress, saveAddress, setSaveAddress } = useCheckout();
  const { check: checkPincode, state: pincodeState } = usePincode();

  const savedAddresses = prefill?.addresses ?? [];
  const isSignedIn = prefill?.isSignedIn ?? false;

  const defaultSaved = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">(() => {
    if (savedAddresses.length > 0) {
      // Check if current checkout address matches a saved address
      const matched = savedAddresses.find(
        (a) => a.pincode === address.pincode && a.line1 === address.line1,
      );
      if (matched) return matched.id;
      if (defaultSaved && !address.line1 && !address.pincode) return defaultSaved.id;
    }
    return savedAddresses.length > 0 && !address.line1 ? defaultSaved?.id ?? "new" : "new";
  });

  // When selecting a saved address on initial mount if checkout address is empty
  useEffect(() => {
    if (
      savedAddresses.length > 0 &&
      selectedAddressId !== "new" &&
      typeof selectedAddressId === "number"
    ) {
      const chosen = savedAddresses.find((a) => a.id === selectedAddressId);
      if (chosen && (!address.line1 || !address.pincode)) {
        setAddress({
          line1: chosen.line1,
          line2: chosen.line2 || "",
          landmark: chosen.landmark || "",
          city: chosen.city,
          state: chosen.state as IndianState,
          pincode: chosen.pincode,
        });
        setSaveAddress(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSelectSaved = (id: number) => {
    setSelectedAddressId(id);
    const chosen = savedAddresses.find((a) => a.id === id);
    if (chosen) {
      setAddress({
        line1: chosen.line1,
        line2: chosen.line2 || "",
        landmark: chosen.landmark || "",
        city: chosen.city,
        state: chosen.state as IndianState,
        pincode: chosen.pincode,
      });
      setSaveAddress(false);
      setErrors({});
    }
  };

  const handleSelectNew = () => {
    setSelectedAddressId("new");
    setAddress({
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "Delhi" as IndianState,
      pincode: "",
    });
    setSaveAddress(isSignedIn);
    setErrors({});
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

      {/* Saved Addresses list for signed-in users */}
      {isSignedIn && savedAddresses.length > 0 && (
        <div className="space-y-3">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-ink6">
            Saved Addresses
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSaved(addr.id)}
                  className={`flex cursor-pointer flex-col justify-between rounded-btn border p-3.5 transition-all duration-150 ${
                    isSelected
                      ? "border-g5 bg-iv ring-2 ring-g5/30"
                      : "border-s2 bg-cream hover:border-g5/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="savedAddressChoice"
                      checked={isSelected}
                      onChange={() => handleSelectSaved(addr.id)}
                      className="mt-0.5 size-4 text-em7 focus:ring-g5 cursor-pointer"
                    />
                    <div className="text-xs space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="rounded-pill bg-g1/40 px-2 py-0.5 text-[10px] font-bold text-g7 border border-g5/20">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-ink6 line-clamp-2">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} —{" "}
                        {addr.pincode}
                      </p>
                      <p className="text-ink6 text-[11px]">Phone: {addr.phone}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Option to enter a new address */}
            <div
              onClick={handleSelectNew}
              className={`flex cursor-pointer items-center gap-3 rounded-btn border p-3.5 transition-all duration-150 ${
                selectedAddressId === "new"
                  ? "border-g5 bg-iv ring-2 ring-g5/30"
                  : "border-dashed border-s2 bg-cream hover:border-g5/50"
              }`}
            >
              <input
                type="radio"
                name="savedAddressChoice"
                checked={selectedAddressId === "new"}
                onChange={handleSelectNew}
                className="size-4 text-em7 focus:ring-g5 cursor-pointer"
              />
              <span className="font-sans text-xs font-semibold text-em7">
                + Deliver to a new address
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Address Form inputs (shown when "new" address is selected or no saved addresses exist) */}
      {(selectedAddressId === "new" || savedAddresses.length === 0) && (
        <div className="flex flex-col gap-4 pt-2">
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

          {/* Save this address checkbox (for signed in customers) */}
          {isSignedIn && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="size-4 rounded border-s2 text-em7 focus:ring-g5 cursor-pointer"
                />
                <span className="font-sans text-xs font-semibold text-ink">
                  Save this address to my account for future orders
                </span>
              </label>
            </div>
          )}
        </div>
      )}

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
