"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { waToCustomer } from "@/lib/core/whatsapp";
import { getOrderWhatsAppMessage } from "./wa-templates";
import type { ShipAddress } from "@/lib/domain/types";
import type { OrderStatus, Locale } from "@/lib/domain/enums";

export type CustomerCardProps = {
  name: string;
  phone: string;
  email: string;
  shipAddress: ShipAddress;
  orderNumber: string;
  status: OrderStatus;
  locale?: Locale;
  energizationDate?: string | null;
  courier?: string | null;
  awb?: string | null;
  trackingUrl?: string | null;
};

export function CustomerCard({
  name,
  phone,
  email,
  shipAddress,
  orderNumber,
  status,
  locale = "en",
  energizationDate,
  courier,
  awb,
  trackingUrl,
}: CustomerCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const formattedAddress = [
    shipAddress.name,
    shipAddress.line1,
    shipAddress.line2,
    shipAddress.landmark,
    `${shipAddress.city}, ${shipAddress.state} - ${shipAddress.pincode}`,
    `Phone: ${shipAddress.phone}`,
  ]
    .filter(Boolean)
    .join("\n");

  const copyAddress = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(formattedAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Delivery address copied to clipboard",
        tone: "ok",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy address",
        tone: "danger",
      });
    }
  };

  const waText = getOrderWhatsAppMessage({
    customerName: name,
    orderNumber,
    status,
    locale,
    energizationDate,
    courier,
    awb,
    trackingUrl,
  });

  const waUrl = waToCustomer(phone, waText);

  return (
    <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-s2 pb-3">
        <h3 className="font-sans text-sm font-bold text-ink flex items-center gap-2">
          <div className="h-4 w-4 text-em7">
            <AdminIcon name="user" sw={2} />
          </div>
          Customer & Delivery
        </h3>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-btn bg-[#25D366]/15 border border-[#25D366]/40 px-2.5 py-1 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/25 transition-colors"
        >
          <div className="h-3.5 w-3.5">
            <AdminIcon name="whatsapp" sw={2} />
          </div>
          WhatsApp
        </a>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold text-ink6">Name: </span>
          <span className="font-bold text-ink">{name}</span>
        </div>
        <div>
          <span className="font-semibold text-ink6">Phone: </span>
          <a
            href={`tel:${phone}`}
            className="font-mono font-semibold text-em7 hover:underline"
          >
            {phone}
          </a>
        </div>
        <div>
          <span className="font-semibold text-ink6">Email: </span>
          <a
            href={`mailto:${email}`}
            className="font-semibold text-em7 hover:underline"
          >
            {email}
          </a>
        </div>
      </div>

      <div className="border-t border-s2 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink6">
            Shipping Address
          </span>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-em7 hover:underline cursor-pointer"
          >
            <div className="h-3 w-3">
              <AdminIcon name="copy" sw={2} />
            </div>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="rounded-field bg-cream/50 p-2.5 font-sans text-xs leading-relaxed text-ink border border-s2/60">
          <p className="font-semibold">{shipAddress.name}</p>
          <p>{shipAddress.line1}</p>
          {shipAddress.line2 && <p>{shipAddress.line2}</p>}
          {shipAddress.landmark && (
            <p className="text-ink6">Landmark: {shipAddress.landmark}</p>
          )}
          <p>
            {shipAddress.city}, {shipAddress.state} -{" "}
            <span className="font-mono font-bold">{shipAddress.pincode}</span>
          </p>
          <p className="text-ink6 font-mono text-[11px] mt-1">
            Tel: {shipAddress.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
