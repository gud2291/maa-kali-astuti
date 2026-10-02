import "server-only";

import { env, isConfigured } from "@/server/env";
import { AppError } from "@/server/result";

/**
 * Renders HTML into a PDF buffer via Cloudflare Browser Rendering.
 */
export async function renderPdf(html: string): Promise<Uint8Array> {
  if (!isConfigured("pdf") || !env.CF_ACCOUNT_ID || !env.CF_BROWSER_TOKEN) {
    throw new AppError("NOT_CONFIGURED", "PDF rendering is not configured");
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-rendering/pdf`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_BROWSER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html,
      gotoOptions: {
        waitUntil: "networkidle0",
      },
      pdfOptions: {
        format: "a4",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`PDF rendering failed with status ${res.status}: ${errorText.slice(0, 300)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/pdf") && !contentType.includes("octet-stream")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare Browser Rendering returned non-PDF content-type (${contentType}): ${text.slice(0, 300)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
