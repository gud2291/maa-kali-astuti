import "server-only";
import { env } from "@/server/env";
import type { MediaRef } from "@/lib/domain/media";
import type { MediaVariant } from "@/lib/domain/types";

export type MediaRowInput = {
  id: number;
  variants: MediaVariant[];
  width: number | null;
  height: number | null;
  blur: string | null;
  altEn: string | null;
  altHi: string | null;
};

export function toMediaRef(row: MediaRowInput): MediaRef {
  const rawBase = env.NEXT_PUBLIC_MEDIA_URL ?? "";
  const base = rawBase.replace(/\/+$/, "");
  const urlFor = (key: string): string => {
    const cleanKey = key.replace(/^\/+/, "");
    return base ? `${base}/${cleanKey}` : `/${cleanKey}`;
  };

  const sorted = [...(row.variants ?? [])].sort((a, b) => a.w - b.w);
  const alt = row.altEn != null ? { en: row.altEn, hi: row.altHi ?? "" } : null;

  if (sorted.length === 0) {
    return {
      id: row.id,
      w: row.width ?? 0,
      h: row.height ?? 0,
      src: "",
      srcSet: "",
      blur: row.blur ?? null,
      alt,
    };
  }

  const exact960 = sorted.find((v) => v.w === 960);
  const upTo960 = sorted.filter((v) => v.w <= 960);
  const selected =
    exact960 ?? (upTo960.length > 0 ? upTo960[upTo960.length - 1] : sorted[sorted.length - 1]);
  const largest = sorted[sorted.length - 1];

  return {
    id: row.id,
    w: largest.w,
    h: largest.h,
    src: urlFor(selected.key),
    srcSet: sorted.map((v) => `${urlFor(v.key)} ${v.w}w`).join(", "),
    blur: row.blur ?? null,
    alt,
  };
}
