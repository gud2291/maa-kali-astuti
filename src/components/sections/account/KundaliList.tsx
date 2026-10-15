"use client";

import { useState } from "react";
import Link from "next/link";
import type { KundaliListItem } from "@/server/kundali/queries";
import type { Locale } from "@/lib/domain/enums";
import { Icon } from "@/components/icons/Icon";
import { kundaliPdfLinkAction } from "@/server/kundali/actions";
import { cn } from "@/lib/utils/cn";

export function KundaliList({
  orders,
  locale = "en",
}: {
  orders: KundaliListItem[];
  locale?: Locale;
}): React.JSX.Element {
  const isHi = locale === "hi";
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const statusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return {
          label: isHi ? "तैयार" : "Ready",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "generating":
        return {
          label: isHi ? "तैयार हो रही है" : "Generating",
          cls: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "paid":
        return {
          label: isHi ? "कतार में" : "Queued",
          cls: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "failed":
        return {
          label: isHi ? "अधूरी" : "Failed",
          cls: "bg-red-50 text-red-800 border-red-200",
        };
      default:
        return {
          label: isHi ? "भुगतान लंबित" : "Pending Payment",
          cls: "bg-gray-50 text-gray-800 border-gray-200",
        };
    }
  };

  const handleDownload = async (order: KundaliListItem) => {
    setDownloadingId(order.id);
    try {
      const res = await kundaliPdfLinkAction({ ref: order.ref });
      if (res.ok && res.data.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // download action failed
    } finally {
      setDownloadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-btn border border-s2 bg-iv p-12 text-center shadow-sm">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-pill bg-em9/10 text-em9">
          <Icon name="kundali" className="size-7" />
        </span>
        <h2 className="font-title text-[22px] text-em9">
          {isHi ? "कोई जन्मपत्री ऑर्डर नहीं मिला" : "No Kundali Orders Yet"}
        </h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-[14px] leading-relaxed text-ink6">
          {isHi
            ? "वैदिक ज्योतिष के अनुसार अपने जीवन की संपूर्ण 28 पृष्ठों की जन्मपत्री प्राप्त करें।"
            : "Get your comprehensive 28-page Vedic Janampatri report calculated via sidereal Lahiri astrology."}
        </p>
        <div className="mt-6">
          <Link
            href="/kundali-99"
            className="inline-flex h-[46px] items-center justify-center rounded-btn bg-em7 px-6 font-sans text-[14.5px] font-semibold text-iv no-underline shadow hover:bg-em5"
          >
            {isHi ? "मुफ़्त कुंडली बनवाएं" : "Get your free Janam Kundali"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-title text-[24px] text-em9">
          {isHi ? "मेरी जन्मपत्री" : "My Kundali Reports"}
        </h2>
        <Link
          href="/kundali-99"
          className="inline-flex h-[38px] items-center gap-1.5 rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv no-underline hover:bg-em5"
        >
          <Icon name="plus" className="size-3.5" />
          {isHi ? "नई कुंडली" : "New Kundali"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {orders.map((order) => {
          const badge = statusBadge(order.status);
          const isReady = order.status === "ready";
          const isBusy = downloadingId === order.id;

          return (
            <div
              key={order.id}
              className="flex flex-col justify-between rounded-btn border border-s2 bg-iv p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-g7">
                      {order.ref}
                    </span>
                    <h3 className="font-title text-[20px] text-em9">{order.name}</h3>
                  </div>
                  <span
                    className={cn(
                      "inline-flex rounded-pill border px-2.5 py-0.5 font-sans text-[11.5px] font-semibold",
                      badge.cls,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-1 text-[13px] text-ink6">
                  <div>
                    <span className="font-medium text-ink">
                      {isHi ? "जन्म तिथि: " : "Date of Birth: "}
                    </span>
                    {order.dob}
                  </div>
                  <div>
                    <span className="font-medium text-ink">
                      {isHi ? "स्थान: " : "Place: "}
                    </span>
                    {order.place}
                  </div>
                  <div>
                    <span className="font-medium text-ink">
                      {isHi ? "भाषा: " : "Language: "}
                    </span>
                    {order.reportLang === "hi" ? "हिंदी (Hindi)" : "English"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-s2 pt-4">
                <Link
                  href={`/kundali/report/${order.ref}`}
                  target="_blank"
                  className="inline-flex h-[38px] items-center gap-1.5 rounded-btn border border-em7 bg-iv px-3.5 font-sans text-[13px] font-semibold text-em7 no-underline hover:bg-s1"
                >
                  <Icon name="eye" className="size-4" />
                  {isHi ? "ऑनलाइन देखें" : "View Online"}
                </Link>

                {isReady && (
                  <button
                    type="button"
                    onClick={() => handleDownload(order)}
                    disabled={isBusy}
                    className="inline-flex h-[38px] cursor-pointer items-center gap-1.5 rounded-btn border-none bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow hover:bg-em5 disabled:opacity-50"
                  >
                    <Icon name="download" className="size-4" />
                    {isBusy ? (isHi ? "तैयार हो रहा है..." : "Fetching...") : (isHi ? "PDF डाउनलोड" : "Download PDF")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
