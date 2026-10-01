import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/server/env";
import { safeEqualHex } from "@/server/ids";
import { AppError } from "@/server/result";
import { log } from "@/server/log";

export type RzpOrder = {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
};

export type RzpPayment = {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  description: string | null;
  email: string | null;
  contact: string | null;
  error_code: string | null;
  error_description: string | null;
  notes: Record<string, string>;
  created_at: number;
};

export type RzpRefund = {
  id: string;
  entity: "refund";
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  status: string;
  created_at: number;
};

export type RzpPaymentLink = {
  id: string;
  entity: "payment_link";
  amount: number;
  currency: string;
  status: string;
  short_url: string;
  description: string;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes: Record<string, string>;
  created_at: number;
};

function safeHexCompare(expected: string, actual: string): boolean {
  if (!actual || expected.length !== actual.length) return false;
  try {
    return safeEqualHex(expected.toLowerCase(), actual.toLowerCase());
  } catch {
    return false;
  }
}

async function rzpFetch<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError("NOT_CONFIGURED", "Razorpay credentials not configured");
  }

  const auth = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
  const url = `https://api.razorpay.com/v1${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    log.error("razorpay.fetch_network_error", {
      endpoint,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new AppError("PAYMENT_FAILED", "Failed to communicate with Razorpay");
  }

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    log.error("razorpay.api_error", {
      endpoint,
      status: res.status,
      error: errBody,
    });
    throw new AppError("PAYMENT_FAILED", "Razorpay payment request failed");
  }

  return (await res.json()) as T;
}

export function verifyCheckoutSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeHexCompare(expected, signature);
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return safeHexCompare(expected, signature);
}

export async function createRzpOrder(opts: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RzpOrder> {
  const amountPaise = Math.round(opts.amountInr * 100);
  return rzpFetch<RzpOrder>("/orders", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      receipt: opts.receipt,
      notes: opts.notes,
    },
  });
}

export async function fetchPayment(paymentId: string): Promise<RzpPayment> {
  return rzpFetch<RzpPayment>(`/payments/${paymentId}`);
}

export async function refundPayment(opts: {
  paymentId: string;
  amountInr?: number;
  notes?: Record<string, string>;
}): Promise<RzpRefund> {
  const body: Record<string, unknown> = {};
  if (opts.amountInr != null) {
    body.amount = Math.round(opts.amountInr * 100);
  }
  if (opts.notes) {
    body.notes = opts.notes;
  }
  return rzpFetch<RzpRefund>(`/payments/${opts.paymentId}/refund`, {
    method: "POST",
    body: Object.keys(body).length > 0 ? body : undefined,
  });
}

export async function createPaymentLink(opts: {
  amountInr: number;
  description: string;
  customer?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
}): Promise<RzpPaymentLink> {
  const amountPaise = Math.round(opts.amountInr * 100);
  return rzpFetch<RzpPaymentLink>("/payment_links", {
    method: "POST",
    body: {
      amount: amountPaise,
      currency: "INR",
      description: opts.description,
      customer: opts.customer,
      notes: opts.notes,
    },
  });
}
