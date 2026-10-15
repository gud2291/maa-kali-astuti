import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV === "development";

/* ── CSP origins from optional services ──────────────────────────────── */

let mediaOrigin = "";
try {
  const raw = process.env.NEXT_PUBLIC_MEDIA_URL;
  if (raw) mediaOrigin = new URL(raw).origin;
} catch { /* invalid or unset — leave empty */ }

const r2Origin = process.env.CF_ACCOUNT_ID
  ? "https://" + process.env.CF_ACCOUNT_ID + ".r2.cloudflarestorage.com"
  : "";

/** Join non-empty parts with a space. */
const join = (...parts: string[]): string => parts.filter(Boolean).join(" ");

/* Phase-B CSP (docs/backend/ARCHITECTURE.md §7, §8).
   Static pages, no nonce. Razorpay, Turnstile, R2 and media origins. */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  join("img-src 'self' data: blob: https://i.ytimg.com https://cdn.razorpay.com", mediaOrigin),
  "font-src 'self'",
  join("frame-src https://www.youtube-nocookie.com https://www.youtube.com https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com"),
  join(`connect-src 'self'${isDev ? " ws: wss:" : ""} https://api.razorpay.com https://lumberjack.razorpay.com https://challenges.cloudflare.com`, r2Origin, mediaOrigin),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Fewer static-generation workers: 11 parallel workers ran the build machine out of memory.
    cpus: 2,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
