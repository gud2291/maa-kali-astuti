"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Chakra } from "@/components/signature/Chakra";
import { kundaliStatusAction } from "@/server/kundali/actions";
import { waLinkTo } from "@/lib/site";
import { useSiteSettings } from "@/components/layout/SiteSettingsProvider";

type Props = {
  refCode: string;
  accessKey: string;
  name: string;
  hi?: boolean;
};

export function ReportStatus({ refCode, accessKey, name, hi = false }: Props): React.JSX.Element {
  const { contact } = useSiteSettings();
  const [status, setStatus] = useState<"generating" | "ready" | "failed" | "timeout">("generating");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Kick off generate endpoint once
    fetch(`/api/kundali/${refCode}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: accessKey }),
    }).catch(() => {});

    // 2. Poll status every 3 seconds up to 90 seconds (30 polls)
    let count = 0;
    const checkStatus = async () => {
      count++;
      setAttempts(count);

      try {
        const res = await kundaliStatusAction({ ref: refCode, k: accessKey });
        if (res.ok) {
          if (res.data.status === "ready") {
            setStatus("ready");
            setPdfUrl(res.data.pdfUrl ?? null);
            if (pollTimer.current) clearInterval(pollTimer.current);
            return;
          }
          if (res.data.status === "failed") {
            setStatus("failed");
            if (pollTimer.current) clearInterval(pollTimer.current);
            return;
          }
        }
      } catch {
        // network blip, continue polling
      }

      if (count >= 30) {
        setStatus("timeout");
        if (pollTimer.current) clearInterval(pollTimer.current);
      }
    };

    // Initial check after 2 seconds
    const initialTimeout = setTimeout(() => {
      void checkStatus();
      pollTimer.current = setInterval(checkStatus, 3000);
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [refCode, accessKey]);

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRetry = () => {
    setStatus("generating");
    setAttempts(0);
    fetch(`/api/kundali/${refCode}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: accessKey }),
    }).catch(() => {});

    let count = 0;
    pollTimer.current = setInterval(async () => {
      count++;
      setAttempts(count);
      try {
        const res = await kundaliStatusAction({ ref: refCode, k: accessKey });
        if (res.ok && res.data.status === "ready") {
          setStatus("ready");
          setPdfUrl(res.data.pdfUrl ?? null);
          if (pollTimer.current) clearInterval(pollTimer.current);
        } else if (res.ok && res.data.status === "failed") {
          setStatus("failed");
          if (pollTimer.current) clearInterval(pollTimer.current);
        }
      } catch {}
      if (count >= 20) {
        setStatus("timeout");
        if (pollTimer.current) clearInterval(pollTimer.current);
      }
    }, 3000);
  };

  if (status === "ready") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-btn border border-ok/30 bg-ok/5 p-6 text-center">
        <span className="grid size-12 place-items-center rounded-pill bg-ok text-iv">
          <span className="block size-6">
            <Icon name="check" />
          </span>
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-title text-[22px] leading-tight text-em9">
            {hi ? "आपकी वैदिक जन्मपत्री तैयार है!" : "Your Janam Kundali is Ready!"}
          </h3>
          <p className="font-sans text-[14px] leading-relaxed text-ink6">
            {hi
              ? "28 पृष्ठों का संपूर्ण प्रतिवेदन तैयार कर दिया गया है। आप इसे तुरंत डाउनलोड कर सकते हैं।"
              : "Your comprehensive 28-page PDF report has been generated. You can download it now or view it online."}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {pdfUrl ? (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-[48px] cursor-pointer items-center justify-center gap-2 rounded-btn border-none bg-em7 px-6 font-sans text-[14.5px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
            >
              <span className="block size-4">
                <Icon name="download" />
              </span>
              {hi ? "PDF डाउनलोड करें" : "Download PDF"}
            </button>
          ) : null}

          <Link
            href={`/kundali/report/${refCode}?k=${accessKey}`}
            target="_blank"
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-btn border border-em7 bg-iv px-5 font-sans text-[14.5px] leading-none font-semibold text-em7 no-underline hover:bg-s1"
          >
            <span className="block size-4">
              <Icon name="eye" />
            </span>
            {hi ? "ऑनलाइन देखें" : "View Online"}
          </Link>
        </div>

        <span className="font-sans text-[12.5px] leading-normal text-ink6">
          📧 {hi ? "प्रतिवेदन आपकी ईमेल पर भी भेज दिया गया है।" : "Also emailed to your registered email address."}
        </span>
      </div>
    );
  }

  if (status === "failed" || status === "timeout") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-btn border border-s2 bg-iv p-6 text-center">
        <span className="grid size-12 place-items-center rounded-pill bg-sin/10 text-sin">
          <span className="block size-6">
            <Icon name="alert" />
          </span>
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-title text-[20px] leading-tight text-em9">
            {hi ? "रिपोर्ट बनने में थोड़ा समय लग रहा है" : "Report preparation in progress"}
          </h3>
          <p className="font-sans text-[13.5px] leading-relaxed text-ink6">
            {hi
              ? "आपका भुगतान प्राप्त हो गया है। हमारी प्रणाली प्रतिवेदन तैयार कर रही है। यह जल्द ही आपकी ईमेल पर पहुंच जाएगा।"
              : "Your payment was confirmed. The engine is finalizing your detailed charts. It will be emailed to you shortly, or you can find it under My Kundali."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-btn border-none bg-em7 px-5 font-sans text-[14px] font-semibold text-iv hover:bg-em5"
          >
            {hi ? "पुनः जांचें" : "Check Again"}
          </button>
          <a
            href={waLinkTo(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[44px] items-center gap-2 rounded-btn border border-em7 px-4 font-sans text-[14px] font-semibold text-em7 no-underline hover:bg-s1"
          >
            <span className="block size-4">
              <Icon name="whatsapp" />
            </span>
            {hi ? "सहायता चाहिए" : "Need Help"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-btn border border-s2 bg-iv p-6 text-center">
      <Chakra
        mode="spin"
        spin={[
          ["outer", 6],
          ["inner", -4],
        ]}
        inset="8%"
        className="size-16 rounded-pill bg-n9"
      />
      <div className="flex flex-col gap-1">
        <h3 className="font-title text-[20px] leading-tight text-em9">
          {hi ? "आपकी वैदिक जन्मपत्री तैयार हो रही है..." : "Preparing your Vedic Janampatri..."}
        </h3>
        <p className="font-sans text-[13.5px] leading-relaxed text-ink6">
          {hi
            ? "ग्रह स्थिति, 120-वर्षीय दशा काल, मंगलिक-कालसर्प एवं उपाय प्रतिवेदन संकलित किए जा रहे हैं (~15–20 सेकंड)"
            : "Calculating 28 pages of planetary charts, 120-year dasha timeline, and personalized remedies (~15–20s)"}
        </p>
      </div>
      <span className="font-sans text-[12px] text-ink6">
        {hi ? `प्रतीक्षा करें... (${attempts * 3}s)` : `Please wait... (${attempts * 3}s)`}
      </span>
    </div>
  );
}
