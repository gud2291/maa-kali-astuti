import "server-only";
import { headers } from "next/headers";
import { env } from "@/server/env";

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip") ?? "0.0.0.0";
  return ip.slice(0, 45);
}

export async function userAgent(): Promise<string> {
  const h = await headers();
  return (h.get("user-agent") ?? "").slice(0, 200);
}

export function absoluteUrl(path: string): string {
  return new URL(path, env.APP_URL).toString();
}

export function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label + " timed out")), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
