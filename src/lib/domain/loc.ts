export type Loc = { en: string; hi: string };

export function loc(v: Loc | null | undefined, locale: string): string {
  if (!v) return "";
  if (locale === "hi" && v.hi.trim() !== "") return v.hi;
  return v.en;
}

export function emptyLoc(): Loc {
  return { en: "", hi: "" };
}

export function locOf(en: string, hi = ""): Loc {
  return { en, hi };
}
