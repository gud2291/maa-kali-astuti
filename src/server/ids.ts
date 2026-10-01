import "server-only";
import { randomBytes, createHash, createHmac, timingSafeEqual, randomInt } from "node:crypto";
import { env } from "@/server/env";
import { istDayKey } from "@/lib/core/ist";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function hmacHex(s: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(s).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function randomDigits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += randomInt(0, 10).toString();
  }
  return out;
}

export function randomCrockford(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += CROCKFORD[randomInt(0, 32)];
  }
  return out;
}

export function refCode(prefix: string, n: number): string {
  return prefix + randomCrockford(n);
}

export function orderNumber(now = new Date()): string {
  const day = istDayKey(now);
  const yymmdd = day.slice(2, 4) + day.slice(5, 7) + day.slice(8, 10);
  return "MKA-" + yymmdd + "-" + randomCrockford(4);
}

export function newProductId(): string {
  return "p" + randomCrockford(8).toLowerCase();
}
