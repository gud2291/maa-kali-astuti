"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { setMessageStatusAction } from "@/server/messages/admin-actions";
import { formatIst } from "@/lib/core/ist";
import type { MessageAdminItem } from "@/server/messages/admin";
import type { MessageStatus } from "@/lib/domain/enums";

function statusTone(s: MessageStatus): BadgeTone {
  switch (s) {
    case "new": return "warn";
    case "replied": return "ok";
    case "closed": return "muted";
    default: return "muted";
  }
}

function statusLabel(s: MessageStatus): string {
  switch (s) {
    case "new": return "New";
    case "replied": return "Replied";
    case "closed": return "Closed";
    default: return s;
  }
}

const TOPIC_LABELS: Record<string, string> = {
  order: "Order",
  consultation: "Consultation",
  kundali: "Kundali",
  course: "Course",
  ritual: "Ritual",
  other: "Other",
};

export function MessageList({ items }: { items: MessageAdminItem[] }): React.JSX.Element {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="block size-10 text-ink6">
          <Icon name="mail" />
        </span>
        <span className="font-sans text-[15px] font-semibold text-ink6">No messages found</span>
        <span className="font-sans text-[13px] text-ink6">Messages from the contact form will appear here.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-s2">
      {items.map((msg) => (
        <MessageRow
          key={msg.id}
          msg={msg}
          expanded={expandedId === msg.id}
          onToggle={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
        />
      ))}
    </div>
  );
}

function MessageRow({
  msg,
  expanded,
  onToggle,
}: {
  msg: MessageAdminItem;
  expanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const markAs = (status: MessageStatus) => {
    startTransition(async () => {
      const result = await setMessageStatusAction(msg.id, status);
      if (result.ok) {
        router.refresh();
      }
    });
  };

  const mailSubject = encodeURIComponent(`Re: ${TOPIC_LABELS[msg.topic] || msg.topic} — Maa Kali Astuti`);
  const waNumber = msg.phone ? `91${msg.phone}` : null;

  return (
    <div className="flex flex-col gap-0">
      {/* Header row — clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left transition-colors hover:bg-cream"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="font-sans text-[14px] font-semibold text-ink truncate">
            {msg.name}
          </span>
          <span className="font-sans text-[12px] font-medium text-ink6 truncate">
            {msg.email || (msg.phone ? `+91 ${msg.phone}` : "—")}
          </span>
        </div>
        <span className="hidden font-mono text-[11px] text-ink6 sm:block">
          {TOPIC_LABELS[msg.topic] || msg.topic}
        </span>
        <span className="hidden font-mono text-[11px] text-ink6 md:block">
          {formatIst(msg.createdAt)}
        </span>
        <StatusBadge tone={statusTone(msg.status as MessageStatus)}>
          {statusLabel(msg.status as MessageStatus)}
        </StatusBadge>
        <span className={`block size-4 flex-none text-ink6 transition-transform ${expanded ? "rotate-180" : ""}`}>
          <Icon name="chevD" />
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col gap-4 border-t border-s2 bg-cream px-4 py-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-sans text-[12.5px] font-medium text-ink6">
            <span>Topic: {TOPIC_LABELS[msg.topic] || msg.topic}</span>
            <span>Locale: {msg.locale.toUpperCase()}</span>
            {msg.phone && <span>Phone: +91 {msg.phone}</span>}
            {msg.email && <span>Email: {msg.email}</span>}
            <span>{formatIst(msg.createdAt)}</span>
          </div>

          {/* Message body */}
          <div className="rounded-field border border-s2 bg-iv px-4 py-3 font-sans text-[14px] leading-[1.6] font-medium text-ink whitespace-pre-wrap">
            {msg.body}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {msg.email && (
              <a
                href={`mailto:${msg.email}?subject=${mailSubject}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3.5 font-sans text-[13px] font-semibold text-ink no-underline transition-colors hover:border-em7"
              >
                <Icon name="mail" className="size-3.5" />
                Reply by Email
              </a>
            )}
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3.5 font-sans text-[13px] font-semibold text-ink no-underline transition-colors hover:border-em7"
              >
                <Icon name="whatsapp" className="size-3.5" />
                WhatsApp
              </a>
            )}

            <div className="ml-auto flex gap-2">
              {msg.status !== "replied" && (
                <button
                  type="button"
                  onClick={() => markAs("replied")}
                  disabled={isPending}
                  className="h-9 cursor-pointer rounded-btn border-0 bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv transition-colors hover:bg-em9 disabled:opacity-60"
                >
                  Mark Replied
                </button>
              )}
              {msg.status !== "closed" && (
                <button
                  type="button"
                  onClick={() => markAs("closed")}
                  disabled={isPending}
                  className="h-9 cursor-pointer rounded-btn border border-s2 bg-iv px-3.5 font-sans text-[13px] font-semibold text-ink6 transition-colors hover:border-em7 disabled:opacity-60"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
