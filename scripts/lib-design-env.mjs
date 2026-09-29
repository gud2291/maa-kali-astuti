/* Shared jsdom loader for the design runtime (design/mka-core.js → mka-astro.js → mka-home.js).
   Used by scripts/extract-design.mjs. Dev-time only; never shipped. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM } from "jsdom";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DESIGN = path.join(ROOT, "design");

export async function loadDesign() {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://sadhakpawanpandey.com/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  // Browser APIs the design runtime touches at load time.
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.Element.prototype.animate = function () { return { cancel() {}, pause() {}, play() {}, finish() {}, onfinish: null }; };
  w.React = { createElement: (t, p) => ({ t, p }) }; // stub; M.h is never called by the extractor
  for (const f of ["mka-core.js", "mka-astro.js", "mka-home.js"]) {
    w.eval(readFileSync(path.join(DESIGN, f), "utf8"));
  }
  // astro + home poll (20 ms) for their dependency; wait for the last flag.
  const t0 = Date.now();
  while (!w.MKA.homeReady) {
    if (Date.now() - t0 > 10000) throw new Error("design runtime did not reach M.homeReady");
    await new Promise((r) => setTimeout(r, 25));
  }
  return { dom, window: w, M: w.MKA, A: w.MKA.A, H: w.MKA.H };
}
