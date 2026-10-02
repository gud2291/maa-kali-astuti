import "server-only";

import React from "react";
import { notFound } from "next/navigation";
import { env } from "@/server/env";
import { requireAdminPage } from "@/server/auth/guards";
import { computeChart } from "@/server/kundali/engine";
import { searchPlaces } from "@/server/kundali/places";
import { buildReportModel } from "@/server/kundali/report/model";
import { ReportDocument } from "@/server/kundali/report/ReportDocument";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KundaliPreviewPage(props: Props): Promise<React.JSX.Element> {
  if (env.NODE_ENV !== "development") {
    notFound();
  }

  await requireAdminPage("kundali.view");

  const sp = await props.searchParams;

  const name =
    typeof sp.name === "string" && sp.name.trim() ? sp.name.trim() : "Aditi Sharma";
  const dob =
    typeof sp.dob === "string" && sp.dob ? sp.dob : "1990-10-24";
  const tobUnknown =
    sp.tobUnknown === "true" || sp.tobUnknown === "on" || sp.tobUnknown === "1";
  const tob = tobUnknown
    ? null
    : typeof sp.tob === "string" && sp.tob
      ? sp.tob
      : "06:30";
  const placeStr =
    typeof sp.place === "string" && sp.place.trim()
      ? sp.place.trim()
      : "Varanasi, Uttar Pradesh, India";
  const lang = sp.lang === "hi" ? "hi" : "en";

  let lat = typeof sp.lat === "string" ? parseFloat(sp.lat) : NaN;
  let lon = typeof sp.lon === "string" ? parseFloat(sp.lon) : NaN;
  let tz = typeof sp.tz === "string" && sp.tz ? sp.tz : "";

  if (isNaN(lat) || isNaN(lon) || !tz) {
    const matches = searchPlaces(placeStr, 1);
    if (matches.length > 0 && matches[0]) {
      lat = matches[0].lat;
      lon = matches[0].lon;
      tz = matches[0].tz;
    } else {
      lat = 25.3176;
      lon = 82.9739;
      tz = "Asia/Kolkata";
    }
  }

  const chart = computeChart({
    name,
    dob,
    tob,
    tobUnknown,
    place: placeStr,
    lat,
    lon,
    tz,
  });

  const model = buildReportModel({
    chart,
    lang,
    name,
    place: placeStr,
  });

  return (
    <div className="min-h-screen bg-[#EAE6DE]">
      {/* Dev preview control bar (hidden in print) */}
      <div className="no-print sticky top-0 z-50 border-b border-[#C5A265]/40 bg-[#164E3F] px-4 py-3 text-[#FBF7EE] shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#C5A265] px-2 py-0.5 font-mono text-[11px] font-bold text-[#14120E] uppercase">
              Dev Preview
            </span>
            <span className="font-serif text-sm font-semibold tracking-wide">
              Kundali 28-Page Report
            </span>
          </div>

          <form
            method="GET"
            action="/admin/kundali/preview"
            className="flex flex-wrap items-center gap-2.5 text-xs text-[#14120E]"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              defaultValue={name}
              className="h-8 rounded border border-[#C5A265]/50 bg-[#FBF7EE] px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-[#C5A265]"
              style={{ width: "130px" }}
            />
            <input
              type="date"
              name="dob"
              defaultValue={dob}
              className="h-8 rounded border border-[#C5A265]/50 bg-[#FBF7EE] px-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#C5A265]"
            />
            <input
              type="time"
              name="tob"
              defaultValue={tob || "12:00"}
              disabled={tobUnknown}
              className="h-8 rounded border border-[#C5A265]/50 bg-[#FBF7EE] px-2 text-xs font-medium outline-none disabled:opacity-50"
            />
            <label className="flex cursor-pointer items-center gap-1 text-[11px] text-[#FBF7EE]">
              <input
                type="checkbox"
                name="tobUnknown"
                value="true"
                defaultChecked={tobUnknown}
                className="size-3.5 rounded accent-[#C5A265]"
              />
              Unknown time
            </label>
            <input
              type="text"
              name="place"
              placeholder="Place"
              defaultValue={placeStr}
              className="h-8 rounded border border-[#C5A265]/50 bg-[#FBF7EE] px-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-[#C5A265]"
              style={{ width: "150px" }}
            />
            <select
              name="lang"
              defaultValue={lang}
              className="h-8 rounded border border-[#C5A265]/50 bg-[#FBF7EE] px-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#C5A265]"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            <button
              type="submit"
              className="h-8 cursor-pointer rounded bg-[#C5A265] px-3 font-medium text-[#14120E] transition-colors hover:bg-[#D4B982]"
            >
              Update Preview
            </button>
            <span className="text-[11px] text-[#FBF7EE]/80">
              Print / PDF: <kbd className="rounded bg-black/20 px-1 py-0.5 font-mono text-[10px]">Ctrl+P</kbd>
            </span>
          </form>
        </div>
      </div>

      {/* Render the full 28-page report document */}
      <ReportDocument model={model} />
    </div>
  );
}
