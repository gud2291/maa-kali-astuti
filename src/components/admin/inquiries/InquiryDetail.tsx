"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { toast } from "@/components/admin/ui/toast";
import { InquiryPipeline, statusTone, statusLabel } from "./InquiryPipeline";
import { PaymentLinkDialog } from "./PaymentLinkDialog";
import { InquiryNotes } from "./InquiryNotes";
import {
  setInquiryStatusAction,
  assignInquiryAction,
  setNextActionAction,
  setFeeAction,
} from "@/server/inquiries/admin-actions";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import { waLinkTo } from "@/lib/core/commerce";
import type { InquiryDetailAdmin } from "@/server/inquiries/admin";
import { INQUIRY_STATUS, type InquiryStatus } from "@/lib/domain/enums";
import type { CourseSettings } from "@/lib/validation/settings";

export type InquiryDetailProps = {
  inquiry: InquiryDetailAdmin;
  staffUsers: { id: number; name: string | null; role: string }[];
  courseSettings?: CourseSettings | null;
};

export function InquiryDetail({
  inquiry,
  staffUsers,
  courseSettings,
}: InquiryDetailProps): React.JSX.Element {
  const router = useRouter();

  // Management controls state
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>(inquiry.status);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    inquiry.assignedTo ? String(inquiry.assignedTo) : "",
  );
  const [nextActionDate, setNextActionDate] = useState<string>(
    inquiry.nextActionAt ? inquiry.nextActionAt.toISOString().slice(0, 10) : "",
  );

  // Fee state
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState<string>(
    inquiry.feeInr != null ? String(inquiry.feeInr) : "",
  );

  // Payment Link Dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  // Saving states
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignee, setSavingAssignee] = useState(false);
  const [savingNextAction, setSavingNextAction] = useState(false);
  const [savingFee, setSavingFee] = useState(false);

  const handleStatusUpdate = async (newStatus: InquiryStatus): Promise<void> => {
    setSelectedStatus(newStatus);
    setSavingStatus(true);
    try {
      const res = await setInquiryStatusAction(inquiry.id, newStatus);
      if (!res.ok) {
        toast.err(res.message || "Failed to update status");
        setSelectedStatus(inquiry.status);
        return;
      }
      toast.ok("Status Updated");
      router.refresh();
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssigneeUpdate = async (val: string): Promise<void> => {
    setSelectedAssignee(val);
    setSavingAssignee(true);
    const userId = val ? parseInt(val, 10) : null;
    try {
      const res = await assignInquiryAction(inquiry.id, userId);
      if (!res.ok) {
        toast.err(res.message || "Could not assign inquiry");
        setSelectedAssignee(inquiry.assignedTo ? String(inquiry.assignedTo) : "");
        return;
      }
      toast.ok("Assignee Updated");
      router.refresh();
    } finally {
      setSavingAssignee(false);
    }
  };

  const handleNextActionUpdate = async (val: string): Promise<void> => {
    setNextActionDate(val);
    setSavingNextAction(true);
    try {
      const res = await setNextActionAction(inquiry.id, val ? new Date(val).toISOString() : null);
      if (!res.ok) {
        toast.err(res.message || "Could not set next action date");
        return;
      }
      toast.ok("Next Action Scheduled");
      router.refresh();
    } finally {
      setSavingNextAction(false);
    }
  };

  const handleSaveFee = async (): Promise<void> => {
    setSavingFee(true);
    const parsedFee = feeInput.trim() ? parseInt(feeInput, 10) : null;
    try {
      const res = await setFeeAction(inquiry.id, parsedFee);
      if (!res.ok) {
        toast.err(res.message || "Could not update fee");
        return;
      }
      toast.ok("Fee Saved");
      setIsEditingFee(false);
      router.refresh();
    } finally {
      setSavingFee(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.ok("Copied to Clipboard");
    } catch {
      toast.err("Failed to Copy");
    }
  };

  const courseOrRitualLabel =
    inquiry.kind === "course"
      ? inquiry.courseKey
        ? `${inquiry.courseKey.charAt(0).toUpperCase() + inquiry.courseKey.slice(1)} Sadhana Course`
        : "Course Inquiry"
      : `Special Ritual (${inquiry.area || "General"})`;

  // Pre-fill amount for link dialog: if fee set, use remaining balance or instalment amount from settings
  const remainingDue = inquiry.feeInr ? Math.max(0, inquiry.feeInr - inquiry.paidInr) : null;
  const defaultLinkAmount =
    remainingDue && remainingDue > 0
      ? remainingDue
      : courseSettings?.instalments?.amountInr ?? 16667;

  const defaultLinkPurpose =
    inquiry.kind === "course"
      ? `${inquiry.courseKey || "Sadhana"} Course Fee`
      : `Ritual Fee - ${inquiry.area || "Service"}`;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inquiries"
            className="flex size-9 items-center justify-center rounded-btn border border-s2 bg-cream text-ink hover:bg-s1 transition-colors"
          >
            <div className="size-4">
              <AdminIcon name="arrowL" sw={2} />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[22px] font-bold text-ink">
                {inquiry.ref}
              </h1>
              <StatusBadge tone={statusTone(inquiry.status)}>
                {statusLabel(inquiry.status)}
              </StatusBadge>
              <span className="rounded-pill bg-s1 px-2.5 py-0.5 text-[11px] font-semibold text-ink6 capitalize">
                {inquiry.kind}
              </span>
            </div>
            <p className="text-[12px] text-ink6">
              Submitted on {formatIst(inquiry.createdAt)} (Site Locale: {inquiry.locale.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Quick contact buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:+91${inquiry.phone}`}
            className="flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-white px-3 font-sans text-[13px] font-semibold text-ink hover:bg-s1 transition-colors"
          >
            <div className="size-3.5 text-em7">
              <AdminIcon name="phone" sw={2} />
            </div>
            <span>Call (+91 {inquiry.phone})</span>
          </a>
          <a
            href={waLinkTo(
              inquiry.phone,
              `Pranam ${inquiry.name}, thank you for contacting Maa Kali Astuti regarding ${courseOrRitualLabel} (Ref: ${inquiry.ref}).`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-btn bg-[#25D366] px-3.5 font-sans text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <div className="size-3.5">
              <AdminIcon name="whatsapp" sw={2} />
            </div>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Visual Pipeline Progression */}
      <InquiryPipeline inquiryId={inquiry.id} currentStatus={inquiry.status} />

      {/* Main Grid: Details Left, Management & Links Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Seeker & Answers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seeker Information Card */}
          <div className="rounded-btn border border-s2 bg-cream p-5 space-y-4">
            <h2 className="font-display text-[16px] font-bold text-ink border-b border-s2 pb-2">
              Seeker Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Name</span>
                <span className="font-semibold text-ink">{inquiry.name}</span>
              </div>
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Phone</span>
                <span className="font-mono font-medium text-ink">+91 {inquiry.phone}</span>
              </div>
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Email</span>
                <span className="text-ink">{inquiry.email || "—"}</span>
              </div>
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">City</span>
                <span className="text-ink">{inquiry.city}</span>
              </div>
            </div>
          </div>

          {/* Inquiry Answers Card */}
          <div className="rounded-btn border border-s2 bg-cream p-5 space-y-4">
            <h2 className="font-display text-[16px] font-bold text-ink border-b border-s2 pb-2">
              Inquiry Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Category</span>
                <span className="font-medium text-ink capitalize">{inquiry.kind}</span>
              </div>
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">
                  {inquiry.kind === "course" ? "Course" : "Area of Concern"}
                </span>
                <span className="font-semibold text-em7">
                  {inquiry.kind === "course" ? inquiry.courseKey || "—" : inquiry.area || "—"}
                </span>
              </div>
              {inquiry.kind === "course" && (
                <div>
                  <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Experience</span>
                  <span className="text-ink capitalize">{inquiry.exp || "—"}</span>
                </div>
              )}
              <div>
                <span className="block text-ink6 text-[11.5px] uppercase font-semibold">Preferred Call Language</span>
                <span className="text-ink capitalize">{inquiry.lang}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-s2">
              <span className="block text-ink6 text-[11.5px] uppercase font-semibold mb-1">
                Message / Situation (Why)
              </span>
              <div className="rounded-field border border-s2/60 bg-white p-3.5 text-[13.5px] leading-relaxed text-ink whitespace-pre-wrap">
                {inquiry.why}
              </div>
            </div>

            {inquiry.ip && (
              <div className="text-[11px] text-ink6">
                Client IP: <span className="font-mono">{inquiry.ip}</span>
              </div>
            )}
          </div>

          {/* Notes & Timeline */}
          <InquiryNotes inquiryId={inquiry.id} events={inquiry.events} />
        </div>

        {/* Right Column (1 Col): Pipeline Controls & Payment Links */}
        <div className="space-y-6">
          {/* Pipeline Management Controls */}
          <div className="rounded-btn border border-s2 bg-cream p-5 space-y-4">
            <h2 className="font-display text-[16px] font-bold text-ink border-b border-s2 pb-2">
              Inquiry Management
            </h2>

            {/* Status Select */}
            <div>
              <label htmlFor="inq-status" className="block text-[12px] font-semibold text-ink mb-1">
                Status
              </label>
              <select
                id="inq-status"
                disabled={savingStatus}
                value={selectedStatus}
                onChange={(e) => handleStatusUpdate(e.target.value as InquiryStatus)}
                className="h-10 w-full rounded-field border border-s2 bg-white px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7 cursor-pointer"
              >
                {INQUIRY_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label htmlFor="inq-assignee" className="block text-[12px] font-semibold text-ink mb-1">
                Assignee
              </label>
              <select
                id="inq-assignee"
                disabled={savingAssignee}
                value={selectedAssignee}
                onChange={(e) => handleAssigneeUpdate(e.target.value)}
                className="h-10 w-full rounded-field border border-s2 bg-white px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {staffUsers.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name || `User #${st.id}`} ({st.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Next Action Date */}
            <div>
              <label htmlFor="inq-next-action" className="block text-[12px] font-semibold text-ink mb-1">
                Next Action Date
              </label>
              <div className="flex gap-2">
                <input
                  id="inq-next-action"
                  type="date"
                  disabled={savingNextAction}
                  value={nextActionDate}
                  onChange={(e) => handleNextActionUpdate(e.target.value)}
                  className="h-10 flex-1 rounded-field border border-s2 bg-white px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7"
                />
                {nextActionDate && (
                  <button
                    type="button"
                    title="Clear date"
                    onClick={() => handleNextActionUpdate("")}
                    className="size-10 flex items-center justify-center rounded-field border border-s2 bg-white text-ink6 hover:text-sin cursor-pointer"
                  >
                    <div className="size-4">
                      <AdminIcon name="close" sw={2} />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fees & Payment Links Card */}
          <div className="rounded-btn border border-s2 bg-cream p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-s2 pb-2">
              <h2 className="font-display text-[16px] font-bold text-ink">
                Payments & Links
              </h2>
              <button
                type="button"
                onClick={() => setLinkDialogOpen(true)}
                className="flex h-8 items-center gap-1 rounded-btn bg-em7 px-3 text-[12px] font-semibold text-iv hover:bg-em9 transition-colors cursor-pointer"
              >
                <div className="size-3">
                  <AdminIcon name="plus" sw={2.5} />
                </div>
                <span>Send Link</span>
              </button>
            </div>

            {/* Fee and Paid Summary */}
            <div className="rounded-field border border-s2/60 bg-white p-3 space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-ink6 font-medium">Agreed Fee:</span>
                {isEditingFee ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      placeholder="e.g. 50000"
                      className="h-7 w-24 rounded-sm border border-s2 px-1.5 text-[12px] outline-none"
                    />
                    <button
                      type="button"
                      disabled={savingFee}
                      onClick={handleSaveFee}
                      className="px-2 py-0.5 rounded-sm bg-em7 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingFee(false)}
                      className="px-1.5 py-0.5 text-ink6 text-[11px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">
                      {inquiry.feeInr != null ? fmt(inquiry.feeInr) : "Not Set"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeeInput(inquiry.feeInr != null ? String(inquiry.feeInr) : "");
                        setIsEditingFee(true);
                      }}
                      className="text-[11px] text-em7 underline cursor-pointer hover:text-em9"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink6 font-medium">Paid So Far:</span>
                <span className="font-bold text-ok">{fmt(inquiry.paidInr)}</span>
              </div>

              {inquiry.feeInr != null && (
                <div className="flex items-center justify-between border-t border-s2/40 pt-1 text-[12px]">
                  <span className="text-ink6">Balance Due:</span>
                  <span className="font-semibold text-ink">
                    {fmt(Math.max(0, inquiry.feeInr - inquiry.paidInr))}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Links List */}
            <div className="space-y-2.5">
              <span className="block text-[12px] font-semibold text-ink">
                Generated Links ({inquiry.links.length})
              </span>

              {inquiry.links.length === 0 ? (
                <p className="text-[12px] text-ink6 text-center py-3 bg-white/50 rounded-field border border-dashed border-s2">
                  No payment links generated yet.
                </p>
              ) : (
                inquiry.links.map((link) => {
                  const isPaid = link.status === "paid";
                  return (
                    <div
                      key={link.id}
                      className="rounded-field border border-s2/70 bg-white p-3 space-y-2 text-[12.5px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{fmt(link.amountInr)}</span>
                        <StatusBadge tone={isPaid ? "ok" : "warn"}>
                          {link.status}
                        </StatusBadge>
                      </div>

                      <p className="text-[12px] text-ink6 line-clamp-1">{link.purpose}</p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          readOnly
                          value={link.shortUrl}
                          className="h-7 flex-1 rounded-sm border border-s2 bg-s1/30 px-2 font-mono text-[11px] text-ink outline-none select-all"
                        />
                        <button
                          type="button"
                          title="Copy Link"
                          onClick={() => copyToClipboard(link.shortUrl)}
                          className="size-7 flex items-center justify-center rounded-sm border border-s2 bg-white text-ink hover:bg-s1 transition-colors cursor-pointer"
                        >
                          <div className="size-3.5">
                            <AdminIcon name="share" sw={2} />
                          </div>
                        </button>
                        <a
                          href={waLinkTo(
                            inquiry.phone,
                            `Pranam ${inquiry.name}, here is your payment link for ${link.purpose} (₹${link.amountInr}): ${link.shortUrl}`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Share on WhatsApp"
                          className="size-7 flex items-center justify-center rounded-sm bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                        >
                          <div className="size-3.5">
                            <AdminIcon name="whatsapp" sw={2} />
                          </div>
                        </a>
                      </div>

                      <div className="text-[10.5px] text-ink6 font-mono">
                        {isPaid && link.paidAt
                          ? `Paid on ${formatIst(link.paidAt)}`
                          : `Created on ${formatIst(link.createdAt)}`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Link Modal Dialog */}
      <PaymentLinkDialog
        inquiryId={inquiry.id}
        customerName={inquiry.name}
        customerPhone={inquiry.phone}
        defaultAmount={defaultLinkAmount}
        defaultPurpose={defaultLinkPurpose}
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
