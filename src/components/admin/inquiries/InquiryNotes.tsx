"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { addInquiryNoteAction } from "@/server/inquiries/admin-actions";
import { formatIst } from "@/lib/core/ist";
import type { InquiryEventAdmin } from "@/server/inquiries/admin";
import { cn } from "@/lib/utils/cn";

export type InquiryNotesProps = {
  inquiryId: number;
  events: InquiryEventAdmin[];
};

function eventIcon(type: string): "chat" | "check" | "link" | "calendar" | "user" | "tag" | "info" {
  switch (type) {
    case "note":
      return "chat";
    case "status":
      return "check";
    case "payment_link":
      return "link";
    case "payment":
      return "check";
    case "next_action":
      return "calendar";
    case "assigned":
      return "user";
    case "fee":
      return "tag";
    default:
      return "info";
  }
}

export function InquiryNotes({ inquiryId, events }: InquiryNotesProps): React.JSX.Element {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await addInquiryNoteAction(inquiryId, trimmed);
      if (!res.ok) {
        toast({
          title: "Failed to Add Note",
          description: res.message || "Could not save note",
          tone: "danger",
        });
        return;
      }

      toast({
        title: "Note Added",
        description: "Your note was added to the timeline",
        tone: "ok",
      });
      setNote("");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-btn border border-s2 bg-cream p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-s2 pb-3">
        <h3 className="font-display text-[16px] font-bold text-ink flex items-center gap-2">
          <div className="size-4 text-em7">
            <AdminIcon name="chat" sw={2} />
          </div>
          Timeline & Notes ({events.length})
        </h3>
      </div>

      {/* Add note input */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an internal note or record call summary…"
          className="w-full rounded-field border border-s2 bg-white p-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7 resize-y"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !note.trim()}
            className="flex h-9 items-center justify-center gap-1.5 rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <div className="size-3.5">
                <AdminIcon name="plus" sw={2.5} />
              </div>
            )}
            <span>Add Note</span>
          </button>
        </div>
      </form>

      {/* Events timeline */}
      <div className="space-y-4 pt-2">
        {events.length === 0 ? (
          <div className="text-center py-6 text-[13px] text-ink6">
            No events recorded yet.
          </div>
        ) : (
          events.map((ev) => {
            const iconName = eventIcon(ev.type);
            const isNote = ev.type === "note";

            return (
              <div key={ev.id} className="relative flex gap-3 text-left">
                {/* Icon bubble */}
                <div
                  className={cn(
                    "flex size-7 flex-none items-center justify-center rounded-full mt-0.5",
                    isNote ? "bg-em1 text-em7" : "bg-s1 text-ink6",
                  )}
                >
                  <div className="size-3.5">
                    <AdminIcon name={iconName} sw={2} />
                  </div>
                </div>

                {/* Event body */}
                <div className="flex-1 rounded-field border border-s2/60 bg-white p-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="font-semibold text-ink">
                      {ev.actorName ? `${ev.actorName}` : "System"}
                    </span>
                    <span className="text-ink6 font-mono text-[11px]">
                      {formatIst(ev.createdAt)}
                    </span>
                  </div>

                  <p className="text-[13px] leading-relaxed text-ink/90 whitespace-pre-wrap">
                    {ev.message || `Event: ${ev.type}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
