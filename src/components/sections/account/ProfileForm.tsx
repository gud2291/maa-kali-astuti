"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerProfile } from "@/server/account/queries";
import type { Locale } from "@/lib/domain/enums";
import type { ProfileInput } from "@/lib/validation/account";
import { profileSchema } from "@/lib/validation/account";
import { updateProfileAction } from "@/server/account/actions";
import { logoutAction } from "@/server/auth/actions";
import { Icon } from "@/components/icons/Icon";
import { FIELD_LABEL, inputCls, ErrorRow } from "@/components/sections/booking/ui";
import { buttonClass } from "@/components/ui/Button";

export function ProfileForm({
  profile,
  locale = "en",
}: {
  profile: CustomerProfile | null;
  locale?: Locale;
}): React.JSX.Element {
  const router = useRouter();
  const isHi = locale === "hi";

  const [formData, setFormData] = useState<ProfileInput>({
    name: profile?.name || "",
    phone: profile?.phone || "",
    marketingOptIn: profile?.marketingOptIn ?? false,
    birth: profile?.birth
      ? {
          name: profile.birth.name || profile.name || "",
          dob: profile.birth.dob || "",
          tob: profile.birth.tob || null,
          tobUnknown: profile.birth.tobUnknown ?? false,
          place: profile.birth.place || "",
          lat: profile.birth.lat ?? null,
          lon: profile.birth.lon ?? null,
          tz: profile.birth.tz ?? null,
        }
      : null,
  });

  const [hasBirthDetails, setHasBirthDetails] = useState<boolean>(
    Boolean(profile?.birth),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleBirthDetails = (enabled: boolean) => {
    setHasBirthDetails(enabled);
    if (!enabled) {
      setFormData((p) => ({ ...p, birth: null }));
    } else {
      setFormData((p) => ({
        ...p,
        birth: {
          name: p.name || "",
          dob: "",
          tob: "12:00",
          tobUnknown: false,
          place: "",
          lat: null,
          lon: null,
          tz: "Asia/Kolkata",
        },
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setErrors({});

    const parseRes = profileSchema.safeParse(formData);
    if (!parseRes.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseRes.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsPending(true);
    try {
      const res = await updateProfileAction(formData);
      if (res.ok) {
        setSuccessMsg(
          isHi
            ? "प्रोफ़ाइल सफलतापूर्वक सहेज ली गई।"
            : "Profile and birth details updated successfully.",
        );
        router.refresh();
      } else {
        setErrorMsg(res.code || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving profile.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logoutAction("customer");
      window.location.href = "/account";
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-s2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-title text-2xl font-normal text-em9 sm:text-3xl">
            {isHi ? "प्रोफ़ाइल एवं जन्म विवरण" : "Profile & Birth Details"}
          </h1>
          <p className="mt-1 font-sans text-xs text-ink6 sm:text-sm">
            {isHi
              ? "अपनी व्यक्तिगत जानकारी और पूजा संकल्प हेतु जन्म विवरण प्रबंधित करें।"
              : "Manage your personal information and saved birth details for rituals & consultations."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={buttonClass(
            "outline",
            "sm",
            "cursor-pointer flex items-center gap-1.5 self-start sm:self-auto text-sin border-sin/30 hover:bg-sin/10",
          )}
        >
          <Icon name="arrowR" className="size-4" />
          <span>{isSigningOut ? "Signing out..." : isHi ? "लॉग आउट करें" : "Sign Out"}</span>
        </button>
      </div>

      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-field bg-ok/10 p-3.5 font-sans text-xs font-semibold text-ok border border-ok/20"
        >
          <Icon name="check" className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-field bg-sin/10 p-3.5 font-sans text-xs font-semibold text-sin border border-sin/20"
        >
          <Icon name="alert" className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} noValidate className="space-y-6">
        {/* Account Details Card */}
        <div className="rounded-xl border border-s2 bg-cream p-5 sm:p-7 shadow-sm space-y-4">
          <h2 className="font-sans text-base font-bold text-ink">
            {isHi ? "खाता जानकारी" : "Personal Information"}
          </h2>

          {/* Email (Read-only verified) */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className={FIELD_LABEL}>{isHi ? "ईमेल पता" : "Email Address"}</label>
            <div className="flex items-center justify-between rounded-field border border-s2 bg-s1 px-3.5 py-2.5 text-xs">
              <span className="font-mono text-ink font-medium">{profile?.email}</span>
              <span className="inline-flex items-center gap-1 text-ok font-semibold">
                <Icon name="check" className="size-3.5" />
                <span>Verified</span>
              </span>
            </div>
            <span className="text-[11px] text-ink6">
              {isHi
                ? "लॉगिन और ऑर्डर सूचनाएं इस ईमेल पर भेजी जाती हैं।"
                : "Primary email used for passwordless login and order notifications."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="prof-name" className={FIELD_LABEL}>
                {isHi ? "पूरा नाम" : "Full Name"} <span className="text-sin">*</span>
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, name: e.target.value }));
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                }}
                className={inputCls(Boolean(errors.name))}
                placeholder="e.g. Rahul Sharma"
              />
              {errors.name && <ErrorRow id="err-prof-name">{errors.name}</ErrorRow>}
            </div>

            {/* Mobile Phone */}
            <div className="flex flex-col gap-1">
              <label htmlFor="prof-phone" className={FIELD_LABEL}>
                {isHi ? "मोबाइल नंबर" : "Phone Number"}
              </label>
              <div className="flex items-center">
                <span className="flex h-[48px] items-center rounded-l-field border-r border-s2 bg-s1 px-3 text-xs font-semibold text-ink6">
                  +91
                </span>
                <input
                  id="prof-phone"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData((p) => ({ ...p, phone: clean }));
                    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={`${inputCls(Boolean(errors.phone))} h-[48px] rounded-l-none`}
                  placeholder="10-digit mobile number"
                />
              </div>
              {errors.phone && <ErrorRow id="err-prof-phone">{errors.phone}</ErrorRow>}
            </div>
          </div>
        </div>

        {/* Vedic Birth Details Card */}
        <div className="rounded-xl border border-s2 bg-cream p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-sans text-base font-bold text-ink">
                {isHi ? "वैदिक जन्म विवरण" : "Sacred Birth Details (Kundali & Sankalpa)"}
              </h2>
              <p className="mt-0.5 text-xs text-ink6">
                {isHi
                  ? "ज्योतिषीय परामर्श एवं पूजा संकल्प के लिए अपना जन्म विवरण सहेजें।"
                  : "Saved birth details allow 1-click consultation bookings and accurate Vedic rites."}
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={hasBirthDetails}
                onChange={(e) => handleToggleBirthDetails(e.target.checked)}
                className="size-4 rounded border-s2 text-em7 focus:ring-g5 cursor-pointer"
              />
              <span className="font-sans text-xs font-semibold text-ink">
                {isHi ? "जन्म विवरण सक्षम करें" : "Save Birth Details"}
              </span>
            </label>
          </div>

          {hasBirthDetails && formData.birth && (
            <div className="space-y-4 pt-2 border-t border-s2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
                {/* Full Name for Sankalp */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label htmlFor="birth-name" className={FIELD_LABEL}>
                    {isHi ? "जन्म नाम / संकल्प हेतु नाम" : "Name at Birth / for Sankalpa"}{" "}
                    <span className="text-sin">*</span>
                  </label>
                  <input
                    id="birth-name"
                    type="text"
                    required
                    value={formData.birth.name}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        birth: p.birth ? { ...p.birth, name: e.target.value } : null,
                      }))
                    }
                    className={inputCls(Boolean(errors["birth.name"]))}
                    placeholder="e.g. Rahul Sharma"
                  />
                  {errors["birth.name"] && (
                    <ErrorRow id="err-birth-name">{errors["birth.name"]}</ErrorRow>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="birth-dob" className={FIELD_LABEL}>
                    {isHi ? "जन्म तिथि (Date of Birth)" : "Date of Birth"}{" "}
                    <span className="text-sin">*</span>
                  </label>
                  <input
                    id="birth-dob"
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    value={formData.birth.dob}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        birth: p.birth ? { ...p.birth, dob: e.target.value } : null,
                      }))
                    }
                    className={inputCls(Boolean(errors["birth.dob"]))}
                  />
                  {errors["birth.dob"] && (
                    <ErrorRow id="err-birth-dob">{errors["birth.dob"]}</ErrorRow>
                  )}
                </div>

                {/* Time of Birth */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="birth-tob" className={FIELD_LABEL}>
                      {isHi ? "जन्म समय (Time of Birth)" : "Time of Birth"}
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.birth.tobUnknown}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            birth: p.birth
                              ? {
                                  ...p.birth,
                                  tobUnknown: e.target.checked,
                                  tob: e.target.checked ? null : "12:00",
                                }
                              : null,
                          }))
                        }
                        className="size-3 rounded border-s2 text-em7 focus:ring-g5 cursor-pointer"
                      />
                      <span className="text-[11px] text-ink6">
                        {isHi ? "समय अज्ञात है" : "Time unknown"}
                      </span>
                    </label>
                  </div>
                  <input
                    id="birth-tob"
                    type="time"
                    disabled={formData.birth.tobUnknown}
                    value={formData.birth.tob || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        birth: p.birth ? { ...p.birth, tob: e.target.value } : null,
                      }))
                    }
                    className={`${inputCls(Boolean(errors["birth.tob"]))} disabled:bg-s1 disabled:text-ink6`}
                  />
                  {errors["birth.tob"] && (
                    <ErrorRow id="err-birth-tob">{errors["birth.tob"]}</ErrorRow>
                  )}
                </div>

                {/* Place of Birth */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label htmlFor="birth-place" className={FIELD_LABEL}>
                    {isHi ? "जन्म स्थान (City, State)" : "Place of Birth (City, State)"}{" "}
                    <span className="text-sin">*</span>
                  </label>
                  <input
                    id="birth-place"
                    type="text"
                    required
                    value={formData.birth.place}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        birth: p.birth ? { ...p.birth, place: e.target.value } : null,
                      }))
                    }
                    className={inputCls(Boolean(errors["birth.place"]))}
                    placeholder="e.g. Varanasi, Uttar Pradesh"
                  />
                  {errors["birth.place"] && (
                    <ErrorRow id="err-birth-place">{errors["birth.place"]}</ErrorRow>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Marketing / Spiritual Updates */}
        <div className="rounded-xl border border-s2 bg-cream p-5 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.marketingOptIn}
              onChange={(e) =>
                setFormData((p) => ({ ...p, marketingOptIn: e.target.checked }))
              }
              className="mt-0.5 size-4 rounded border-s2 text-em7 focus:ring-g5 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-ink">
                {isHi
                  ? "शुभ मुहूर्त, त्योहार व विशेष पूजा अनुष्ठान की सूचनाएं प्राप्त करें"
                  : "Receive sacred Muhurat alerts, festival updates, and Vedic puja invitations"}
              </span>
              <p className="mt-0.5 text-ink6">
                {isHi
                  ? "हम कभी भी स्पैम नहीं भेजते। केवल महत्वपूर्ण ज्योतिषीय व आध्यात्मिक तिथियां साझा की जाती हैं।"
                  : "We never spam. You will only receive timely astrological insights and spiritual guidance."}
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className={buttonClass("primary", "md", "cursor-pointer min-w-[160px]")}
          >
            {isPending
              ? isHi
                ? "सहेज रहे हैं..."
                : "Saving..."
              : isHi
                ? "प्रोफ़ाइल सहेजें"
                : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
