import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getCustomer } from "@/server/auth/guards";
import { getKundaliReportView } from "@/server/kundali/queries";
import { buildReportModel } from "@/server/kundali/report/model";
import { ReportDocument } from "@/server/kundali/report/ReportDocument";
import { signedPrivateUrl } from "@/server/media/service";
import { Icon } from "@/components/icons/Icon";
import { computeChart } from "@/server/kundali/engine";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; ref: string }>;
  searchParams: Promise<{ k?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  return {
    title: `Janam Kundali (${ref}) — Maa Kali Astuti`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function KundaliReportPage({
  params,
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const { locale, ref } = await params;
  const { k } = await searchParams;

  setRequestLocale(locale);

  const customer = await getCustomer();
  const order = await getKundaliReportView(ref, k, customer?.id);

  if (!order) {
    notFound();
  }

  const isHi = order.reportLang === "hi";

  // Pending payment state: prompt user to complete payment
  if (order.status === "pending_payment") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-btn border border-s2 bg-iv p-8 text-center shadow-lg">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-pill bg-em9/10 text-em9">
            <Icon name="lock" className="size-6" />
          </span>
          <h1 className="font-title text-[24px] text-em9">
            {isHi ? "भुगतान प्रतीक्षित है" : "Payment Required"}
          </h1>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink6">
            {isHi
              ? `${order.name} की जन्मपत्री देखने के लिए कृपया भुगतान पूर्ण करें।`
              : `To access the full Janam Kundali for ${order.name}, please complete your payment of ₹${order.priceInr}.`}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/kundali-99"
              className="inline-flex h-[48px] items-center justify-center rounded-btn bg-em7 px-6 font-sans text-[15px] font-semibold text-iv no-underline hover:bg-em5"
            >
              {isHi ? "कुंडली पेज पर जाएं" : "Return to Kundali Page"}
            </Link>
            <Link
              href={routes.home}
              className="font-sans text-[13px] text-ink6 no-underline hover:text-em9"
            >
              {isHi ? "मुख्य पृष्ठ" : "Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ready, generating, or paid: render ReportDocument
  let chart = order.chart;
  if (!chart) {
    chart = computeChart({
      name: order.name,
      dob: order.dob,
      tob: order.tob,
      tobUnknown: order.tobUnknown,
      place: order.place,
      lat: order.lat,
      lon: order.lon,
      tz: order.tz,
    });
  }

  const model = buildReportModel({
    chart,
    lang: order.reportLang,
    name: order.name,
    place: order.place,
    generatedAt: order.paidAt ?? order.createdAt,
  });

  let downloadUrl: string | null = null;
  if (order.status === "ready" && order.pdfMediaId) {
    try {
      const safeFilename = `Janam-Kundali-${order.name.trim().replace(/\s+/g, "-")}.pdf`;
      downloadUrl = await signedPrivateUrl(order.pdfMediaId, safeFilename);
    } catch {
      // url signing failed
    }
  }

  return (
    <div className="min-h-screen bg-[#1F2A24] py-6 sm:py-10">
      <div className="mx-auto max-w-[860px] px-3 sm:px-6">
        {/* Sticky top action bar */}
        <div className="sticky top-4 z-40 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-btn border border-g3/30 bg-em9/95 px-5 py-3.5 text-iv shadow-2xl backdrop-blur-md">
          <div className="flex flex-col">
            <span className="font-title text-[18px] text-iv sm:text-[20px]">
              {order.name} — {isHi ? "वैदिक जन्मपत्री" : "Vedic Janampatri"}
            </span>
            <span className="font-sans text-[12px] text-sg3">
              Ref: {order.ref} · {order.place} · {order.dob}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[40px] items-center gap-2 rounded-btn bg-g3 px-4 font-sans text-[13.5px] font-semibold text-n9 no-underline shadow hover:bg-g4"
              >
                <Icon name="download" className="size-4" />
                {isHi ? "PDF डाउनलोड करें" : "Download PDF"}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill bg-em7 px-3 py-1 font-sans text-[12px] font-medium text-g3">
                <span className="size-2 animate-ping rounded-pill bg-g3" />
                {isHi ? "PDF तैयार हो रही है..." : "PDF Generating..."}
              </span>
            )}
          </div>
        </div>

        {/* The 28-Page Report Document */}
        <div className="overflow-hidden rounded-lg bg-iv shadow-2xl">
          <ReportDocument model={model} />
        </div>
      </div>
    </div>
  );
}
