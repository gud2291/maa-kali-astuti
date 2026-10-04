"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/components/media/useUpload";
import { attachReportAction } from "@/server/bookings/admin-actions";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";

export type ReportUploadProps = {
  bookingId: number;
  reportUrl: string | null;
  reportMediaId: number | null;
};

export function ReportUpload({
  bookingId,
  reportUrl,
  reportMediaId,
}: ReportUploadProps): React.JSX.Element {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attaching, setAttaching] = useState(false);
  const { state, upload, reset } = useUpload("report");

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.err("Please upload a PDF document (.pdf)");
      return;
    }

    try {
      const res = await upload(file);
      if (!res) {
        toast.err(errorText(state.error || "UPLOAD_INVALID"));
        return;
      }

      setAttaching(true);
      const actionRes = await attachReportAction(bookingId, res.mediaId);
      if (actionRes.ok) {
        toast.ok("Consultation report uploaded & client notified");
        router.refresh();
      } else {
        toast.err(errorText(actionRes.code));
      }
    } catch {
      toast.err("Failed to upload report document");
    } finally {
      setAttaching(false);
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isUploading =
    attaching ||
    state.status === "preparing" ||
    state.status === "uploading" ||
    state.status === "confirming";

  return (
    <div className="rounded-btn border border-s2 bg-cream p-4 space-y-3">
      <div>
        <h4 className="font-display text-[15px] font-semibold text-ink">
          Consultation Report (PDF)
        </h4>
        <p className="font-sans text-[12px] text-ink6">
          Upload Sadhak Ji&apos;s written consultation report. Client receives an email with access.
        </p>
      </div>

      {reportUrl && reportMediaId && (
        <div className="flex items-center justify-between rounded-btn border border-em7/30 bg-em7/5 p-3">
          <div className="flex items-center gap-2">
            <span className="size-4 text-em7">
              <AdminIcon name="report" />
            </span>
            <span className="font-sans text-[13px] font-medium text-ink">
              Report Attached (Media #{reportMediaId})
            </span>
          </div>

          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1.5 rounded-field border border-em7 bg-cream px-2.5 font-sans text-[12px] font-semibold text-em7 hover:bg-em7 hover:text-cream no-underline"
          >
            <span className="size-3.5">
              <AdminIcon name="download" />
            </span>
            <span>Download PDF</span>
          </a>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          disabled={isUploading}
          onChange={handleFileChange}
          className="hidden"
          id={`report-upload-${bookingId}`}
        />

        <label
          htmlFor={`report-upload-${bookingId}`}
          className={`inline-flex h-9 items-center gap-2 rounded-btn border border-dashed border-em7 bg-cream/60 px-4 font-sans text-[13px] font-semibold text-em7 hover:bg-cream transition-colors cursor-pointer ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <span className="size-4">
            <AdminIcon name="upload" />
          </span>
          <span>
            {isUploading
              ? `Uploading Report (${state.progress}%)...`
              : reportMediaId
                ? "Replace Report (PDF)"
                : "Upload Report (PDF)"}
          </span>
        </label>
      </div>
    </div>
  );
}
