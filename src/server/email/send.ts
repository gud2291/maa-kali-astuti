import "server-only";
import type { ReactElement } from "react";
import { render } from "@react-email/components";
import { env } from "@/server/env";
import { AppError } from "@/server/result";
import { log } from "@/server/log";

export type EmailAttachment = {
  filename: string;
  /** Raw file content (text or bytes); base64-encoded here for the Resend REST API. */
  content?: string | Buffer;
  path?: string;
};

function toBase64(content: string | Buffer): string {
  return (typeof content === "string" ? Buffer.from(content, "utf8") : content).toString("base64");
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  attachments?: EmailAttachment[];
  devNote?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
  attachments,
  devNote,
}: SendEmailParams): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    if (env.NODE_ENV === "production") {
      throw new AppError("NOT_CONFIGURED");
    }
    log.info("email.dev_fallback", {
      to,
      subject,
      devNote,
    });
    return;
  }

  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);

  const recipients = Array.isArray(to) ? to : [to];
  const payload: Record<string, unknown> = {
    from: env.EMAIL_FROM,
    to: recipients,
    subject,
    html,
    text,
  };

  const reply = replyTo ?? env.EMAIL_REPLY_TO;
  if (reply) {
    payload.reply_to = reply;
  }

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((a) => ({
      filename: a.filename,
      ...(a.content != null ? { content: toBase64(a.content) } : {}),
      ...(a.path ? { path: a.path } : {}),
    }));
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    log.error("email.resend_error", { status: res.status, body: errText });
    throw new Error(`resend ${res.status}`);
  }
}
