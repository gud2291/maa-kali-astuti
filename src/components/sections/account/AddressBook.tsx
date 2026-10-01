"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SavedAddress } from "@/server/account/queries";
import type { Locale } from "@/lib/domain/enums";
import { deleteAddressAction, setDefaultAddressAction } from "@/server/account/actions";
import { AddressSheet } from "./AddressSheet";
import { Icon } from "@/components/icons/Icon";
import { buttonClass } from "@/components/ui/Button";

export function AddressBook({
  initialAddresses,
  locale = "en",
}: {
  initialAddresses: SavedAddress[];
  locale?: Locale;
}): React.JSX.Element {
  const router = useRouter();
  const isHi = locale === "hi";

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    if (initialAddresses.length >= 10) return;
    setEditingAddress(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setSheetOpen(true);
  };

  const handleSetDefault = async (id: number) => {
    setError(null);
    setPendingId(id);
    try {
      const res = await setDefaultAddressAction(id);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.code || "Failed to set default address");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setPendingId(id);
    try {
      const res = await deleteAddressAction(id);
      if (res.ok) {
        setDeletingId(null);
        router.refresh();
      } else {
        setError(res.code || "Failed to delete address");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 border-b border-s2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-title text-2xl font-normal text-em9 sm:text-3xl">
            {isHi ? "सहेजे गए पते" : "Address Book"}
          </h1>
          <p className="mt-1 font-sans text-xs text-ink6 sm:text-sm">
            {isHi
              ? `कुल ${initialAddresses.length} / 10 पते सहेजे गए हैं`
              : `Saved ${initialAddresses.length} of 10 maximum addresses`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          disabled={initialAddresses.length >= 10}
          className={buttonClass(
            "primary",
            "sm",
            "cursor-pointer flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50",
          )}
        >
          <Icon name="plus" className="size-4" />
          <span>{isHi ? "नया पता जोड़ें" : "Add New Address"}</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-field bg-sin/10 p-3 text-xs font-semibold text-sin"
        >
          <Icon name="alert" className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Address Cards Grid */}
      {initialAddresses.length === 0 ? (
        <div className="rounded-xl border border-s2 bg-cream p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-pill bg-s1 text-ink6">
            <Icon name="pin" className="size-6" />
          </div>
          <h2 className="font-sans text-base font-bold text-ink">
            {isHi ? "कोई सहेजा गया पता नहीं मिला" : "No addresses saved yet"}
          </h2>
          <p className="mt-1 font-sans text-xs text-ink6">
            {isHi
              ? "तेज चेकआउट के लिए अपना डिलीवरी पता जोड़ें।"
              : "Add your primary delivery address for faster checkout."}
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className={buttonClass("primary", "sm", "cursor-pointer")}
            >
              {isHi ? "पहला पता जोड़ें" : "Add Your First Address"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {initialAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 ${
                addr.isDefault
                  ? "border-g5 bg-iv ring-1 ring-g5/30"
                  : "border-s2 bg-cream hover:border-s2 hover:shadow-card"
              }`}
            >
              {/* Card Header: Name + Default Badge */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-base font-bold text-ink">
                      {addr.name}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-g1/40 px-2.5 py-0.5 font-sans text-[11px] font-bold text-g7 border border-g5/30">
                        <Icon name="bolt" className="size-3 text-g5" />
                        <span>{isHi ? "डिफ़ॉल्ट" : "DEFAULT"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="font-sans text-xs leading-relaxed text-ink6">
                  <p className="text-ink">{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  {addr.landmark && <p className="italic">Landmark: {addr.landmark}</p>}
                  <p>
                    {addr.city}, {addr.state} —{" "}
                    <span className="font-mono font-semibold text-ink">
                      {addr.pincode}
                    </span>
                  </p>
                  <p className="mt-2 text-ink">
                    <span className="text-ink6">Phone: </span>
                    <span className="font-mono font-medium">{addr.phone}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 border-t border-s2 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      disabled={pendingId === addr.id}
                      onClick={() => handleSetDefault(addr.id)}
                      className="font-sans font-semibold text-em7 hover:text-em9 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {pendingId === addr.id ? "Setting..." : isHi ? "डिफ़ॉल्ट बनाएं" : "Set as default"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="font-sans font-semibold text-ink hover:text-em7 cursor-pointer"
                  >
                    {isHi ? "संपादित करें" : "Edit"}
                  </button>

                  {deletingId === addr.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-sin font-medium">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        disabled={pendingId === addr.id}
                        className="font-sans font-bold text-sin hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="font-sans text-ink6 hover:underline cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(addr.id)}
                      className="font-sans font-semibold text-sin/80 hover:text-sin cursor-pointer"
                    >
                      {isHi ? "हटाएं" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Sheet Modal */}
      <AddressSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSaved={() => router.refresh()}
        locale={locale}
      />
    </div>
  );
}
