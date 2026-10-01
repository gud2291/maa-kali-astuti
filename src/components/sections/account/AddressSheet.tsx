"use client";

import { useEffect, useState } from "react";
import { usePincode } from "@/lib/hooks/usePincode";
import { INDIAN_STATES, type IndianState } from "@/lib/domain/india";
import { addressInputSchema, type AddressFormInput } from "@/lib/validation/account";
import { saveAddressAction } from "@/server/account/actions";
import type { SavedAddress } from "@/server/account/queries";
import type { Locale } from "@/lib/domain/enums";
import { Icon } from "@/components/icons/Icon";
import { FIELD_LABEL, inputCls, ErrorRow } from "@/components/sections/booking/ui";
import { buttonClass } from "@/components/ui/Button";

export function AddressSheet({
  open,
  onClose,
  initialData,
  onSaved,
  locale = "en",
}: {
  open: boolean;
  onClose: () => void;
  initialData?: SavedAddress | null;
  onSaved: () => void;
  locale?: Locale;
}): React.JSX.Element | null {
  const isHi = locale === "hi";

  const [formData, setFormData] = useState<AddressFormInput>({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "Delhi" as IndianState,
    pincode: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormInput, string>>>({});
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { check: checkPincode, state: pincodeState } = usePincode();

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        phone: initialData.phone,
        line1: initialData.line1,
        line2: initialData.line2,
        landmark: initialData.landmark,
        city: initialData.city,
        state: initialData.state as IndianState,
        pincode: initialData.pincode,
        isDefault: initialData.isDefault,
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        line1: "",
        line2: "",
        landmark: "",
        city: "",
        state: "Delhi" as IndianState,
        pincode: "",
        isDefault: false,
      });
    }
    setErrors({});
    setFormError(null);
  }, [initialData, open]);

  // Autofill city and state on successful pincode lookup
  useEffect(() => {
    if (pincodeState.status === "ready" && pincodeState.data) {
      setFormData((prev) => ({
        ...prev,
        city: pincodeState.data?.city || prev.city,
        state: (pincodeState.data?.state &&
        INDIAN_STATES.includes(pincodeState.data.state as IndianState)
          ? pincodeState.data.state
          : prev.state) as IndianState,
      }));
    }
  }, [pincodeState.status, pincodeState.data]);

  if (!open) return null;

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: clean }));
    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));

    if (/^[1-9]\d{5}$/.test(clean)) {
      void checkPincode(clean);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = addressInputSchema.safeParse(formData);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof AddressFormInput, string>> = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as keyof AddressFormInput;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      const actionRes = await saveAddressAction(formData);
      if (actionRes.ok) {
        onSaved();
        onClose();
      } else {
        setFormError(actionRes.code || "Failed to save address");
      }
    } catch {
      setFormError("An unexpected error occurred while saving the address.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-s2 bg-cream p-6 shadow-card sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-s2 pb-4">
          <h2 className="font-title text-xl font-normal text-em9">
            {initialData
              ? isHi
                ? "पता संपादित करें"
                : "Edit Address"
              : isHi
                ? "नया पता जोड़ें"
                : "Add New Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ink6 hover:bg-s2 hover:text-ink cursor-pointer"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-field bg-sin/10 p-3 font-sans text-xs font-semibold text-sin"
          >
            <Icon name="alert" className="size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-name" className={FIELD_LABEL}>
              {isHi ? "पूरा नाम" : "Full Name"} <span className="text-sin">*</span>
            </label>
            <input
              id="addr-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={inputCls(Boolean(errors.name))}
              placeholder="e.g. Rahul Sharma"
            />
            {errors.name && <ErrorRow id="err-addr-name">{errors.name}</ErrorRow>}
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-phone" className={FIELD_LABEL}>
              {isHi ? "मोबाइल नंबर" : "Phone Number"} <span className="text-sin">*</span>
            </label>
            <div className="flex items-center">
              <span className="flex h-[48px] items-center rounded-l-field border-r border-s2 bg-s1 px-3 text-xs font-semibold text-ink6">
                +91
              </span>
              <input
                id="addr-phone"
                type="tel"
                maxLength={10}
                required
                value={formData.phone}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((p) => ({ ...p, phone: clean }));
                  if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                }}
                className={`${inputCls(Boolean(errors.phone))} h-[48px] rounded-l-none`}
                placeholder="10-digit mobile number"
              />
            </div>
            {errors.phone && <ErrorRow id="err-addr-phone">{errors.phone}</ErrorRow>}
          </div>

          {/* Pincode */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-pincode" className={FIELD_LABEL}>
              {isHi ? "पिन कोड" : "PIN Code"} <span className="text-sin">*</span>
            </label>
            <div className="relative">
              <input
                id="addr-pincode"
                type="text"
                maxLength={6}
                required
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className={inputCls(Boolean(errors.pincode))}
                placeholder="6-digit pincode"
              />
              {pincodeState.status === "loading" && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink6">
                  Checking…
                </span>
              )}
              {pincodeState.status === "ready" && pincodeState.data && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-ok">
                  <Icon name="check" className="size-3.5" />
                  {pincodeState.data.city}
                </span>
              )}
            </div>
            {errors.pincode && <ErrorRow id="err-addr-pincode">{errors.pincode}</ErrorRow>}
          </div>

          {/* Line 1 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-line1" className={FIELD_LABEL}>
              {isHi ? "पता पंक्ति 1 (मकान सं., भवन, सड़क)" : "Address Line 1 (Flat, House, Building)"}{" "}
              <span className="text-sin">*</span>
            </label>
            <input
              id="addr-line1"
              type="text"
              required
              value={formData.line1}
              onChange={(e) => {
                setFormData((p) => ({ ...p, line1: e.target.value }));
                if (errors.line1) setErrors((p) => ({ ...p, line1: undefined }));
              }}
              className={inputCls(Boolean(errors.line1))}
              placeholder="e.g. 104, Shanti Kunj, Near Kali Temple"
            />
            {errors.line1 && <ErrorRow id="err-addr-line1">{errors.line1}</ErrorRow>}
          </div>

          {/* Line 2 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-line2" className={FIELD_LABEL}>
              {isHi ? "पता पंक्ति 2 (क्षेत्र, कॉलोनी)" : "Address Line 2 (Area, Colony)"}
            </label>
            <input
              id="addr-line2"
              type="text"
              value={formData.line2}
              onChange={(e) => setFormData((p) => ({ ...p, line2: e.target.value }))}
              className={inputCls()}
              placeholder="e.g. Sector 14"
            />
          </div>

          {/* Landmark */}
          <div className="flex flex-col gap-1">
            <label htmlFor="addr-landmark" className={FIELD_LABEL}>
              {isHi ? "प्रमुख पहचान (Landmark)" : "Landmark"}
            </label>
            <input
              id="addr-landmark"
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
              className={inputCls()}
              placeholder="e.g. Near Shiv Temple"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="addr-city" className={FIELD_LABEL}>
                {isHi ? "शहर" : "City"} <span className="text-sin">*</span>
              </label>
              <input
                id="addr-city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, city: e.target.value }));
                  if (errors.city) setErrors((p) => ({ ...p, city: undefined }));
                }}
                className={inputCls(Boolean(errors.city))}
                placeholder="Enter city"
              />
              {errors.city && <ErrorRow id="err-addr-city">{errors.city}</ErrorRow>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="addr-state" className={FIELD_LABEL}>
                {isHi ? "राज्य" : "State"} <span className="text-sin">*</span>
              </label>
              <select
                id="addr-state"
                value={formData.state}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, state: e.target.value as IndianState }));
                  if (errors.state) setErrors((p) => ({ ...p, state: undefined }));
                }}
                className={`${inputCls(Boolean(errors.state))} h-[48px] cursor-pointer`}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Is Default Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, isDefault: e.target.checked }))
                }
                className="size-4 rounded border-s2 text-em7 focus:ring-g5 cursor-pointer"
              />
              <span className="font-sans text-xs font-semibold text-ink">
                {isHi ? "इसे प्राथमिक (डिफ़ॉल्ट) पता बनाएं" : "Make this my default address"}
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-s2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={buttonClass("secondary", "md", "cursor-pointer")}
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={buttonClass("primary", "md", "cursor-pointer")}
            >
              {isPending
                ? isHi
                  ? "सहेज रहे हैं..."
                  : "Saving..."
                : isHi
                  ? "पता सहेजें"
                  : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
