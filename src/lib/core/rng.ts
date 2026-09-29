/* Ported 1:1 from mka-core.js 15–19. Same seeds → same sequences as the prototype. */

/** Seeded LCG. `rng("foot")()` returns the same numbers the design used for that seed. */
export function rng(seed: string | number): () => number {
  let s = 7;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** djb2 → base36 (stable short id from a string). */
export function hash(s: string | number): string {
  let h = 5381;
  for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}

/** Mix a #rrggbb colour toward white ('w') or black by t ∈ [0,1]. */
export function mix(hex: string, t: number, to?: "w" | "b"): string {
  const n = parseInt(hex.slice(1), 16);
  const a = [n >> 16, (n >> 8) & 255, n & 255];
  const b = to === "w" ? [255, 255, 255] : [0, 0, 0];
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
