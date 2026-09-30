/** Roving-focus target for a tablist: ←/→ wrap, Home/End jump. Returns −1 for other keys. */
export function rovingTarget(key: string, i: number, n: number): number {
  if (key === "ArrowRight") return (i + 1) % n;
  if (key === "ArrowLeft") return (i - 1 + n) % n;
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  return -1;
}
