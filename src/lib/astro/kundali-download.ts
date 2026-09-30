/* Kundali ₹99 "Download your report" (Kundali-99.dc.html download 437–445). The prototype saves a
   single-page 800×1060 SVG: the Lagna chart in emerald on ivory, Lagna / Rashi / Nakshatra and the
   planet table (INV gotcha 7). The full 28-page PDF is phase B. Client-only (Blob + object URL).
   The markup is only ever written into a downloaded file, never into the page; every piece of
   visitor text is XML-escaped. */
import { CHART_LINES, chartLayout } from "./chart";
import type { Kundali } from "./kundali";
import { RASHI } from "./rashi";

const esc = (t: string) =>
  String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/** Inner markup of A.chart(K, { col, ink, sub, fs, sw, hi }) — mka-astro.js 118–133, without <svg>. */
function chartInner(K: Kundali, o: { col: string; ink: string; sub: string; fs: number; sw: number; hi: boolean }) {
  const { signs, items } = chartLayout(K, o.hi);
  let s = `<g fill="none" stroke="${o.col}" stroke-width="${o.sw}" stroke-linejoin="round">`;
  s += CHART_LINES.map((d) => `<path d="${d}"/>`).join("") + "</g>";
  s += signs
    .map(
      (g) =>
        `<text x="${g.x}" y="${g.y}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="11.5" font-weight="600" fill="${o.sub}">${g.n}</text>`,
    )
    .join("");
  const fam = o.hi ? "'Tiro Devanagari Hindi',serif" : "Manrope,sans-serif";
  s += items
    .map(
      (it) =>
        `<text x="${it.x}" y="${it.y}" text-anchor="middle" font-family="${fam}" font-size="${it.asc ? o.fs - 3 : o.fs}" font-weight="${o.hi ? 400 : 700}" letter-spacing="${it.asc && !o.hi ? 1 : 0}" fill="${it.asc ? o.col : o.ink}">${esc(it.t)}${it.r ? `<tspan font-size="${o.fs - 6}" dx="1" dy="-5">R</tspan>` : ""}</text>`,
    )
    .join("");
  return s;
}

export type KundaliDownload = {
  K: Kundali;
  name: string;
  /** The preview's birth line: "12 Nov 1986 · 6:40 am · Varanasi". */
  birthLine: string;
  hi: boolean;
};

/** The one-page chart SVG (800×1060), 1:1 with the prototype's layout. */
export function kundaliSvg({ K, name, birthLine, hi }: KundaliDownload): string {
  const R = RASHI;
  const inner = chartInner(K, { col: "#164E3F", ink: "#0E3B30", sub: "#7A5C1C", fs: 16, sw: 1.6, hi });
  const rows = K.planets
    .map((p, i) => {
      const y = 772 + i * 26;
      return `<text x="90" y="${y}">${p.en}${p.retro ? " (R)" : ""}</text><text x="250" y="${y}">${R[p.sign].en}</text><text x="410" y="${y}">${p.house}</text><text x="490" y="${y}">${p.degS}</text><text x="590" y="${y}">${p.nak}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1060" width="800" height="1060" font-family="Georgia,serif"><rect width="800" height="1060" fill="#FFFDF7"/><rect x="24" y="24" width="752" height="1012" fill="none" stroke="#B8923A"/><text x="400" y="92" text-anchor="middle" font-size="30" fill="#0E3B30">Janam Kundali</text><text x="400" y="124" text-anchor="middle" font-size="14" letter-spacing="2" fill="#7A5C1C" font-family="Arial,sans-serif">${esc(name.toUpperCase())}</text><text x="400" y="150" text-anchor="middle" font-size="13" fill="#5B6A61" font-family="Arial,sans-serif">${esc(birthLine)}</text><g transform="translate(200 184)">${inner}</g><g font-family="Arial,sans-serif" font-size="14" fill="#0E3B30"><text x="90" y="640">Lagna: ${R[K.lagna].en} ${K.lagnaDeg}</text><text x="90" y="666">Rashi (Moon sign): ${R[K.rashi].en}</text><text x="90" y="692">Nakshatra: ${K.nak}, pada ${K.pada}</text></g><g font-family="Arial,sans-serif" font-size="13" fill="#1F2A24"><g font-weight="700" fill="#7A5C1C" font-size="11" letter-spacing="1.5"><text x="90" y="742">GRAHA</text><text x="250" y="742">SIGN</text><text x="410" y="742">HOUSE</text><text x="490" y="742">DEGREE</text><text x="590" y="742">NAKSHATRA</text></g>${rows}</g><text x="400" y="1012" text-anchor="middle" font-size="10" letter-spacing="2" fill="#7A5C1C" font-family="Arial,sans-serif">MAA KALI ASTUTI · SADHAKPAWANPANDEY.COM</text></svg>`;
}

/** Saves `Janam-Kundali-<Name>.svg`. */
export function downloadKundali(o: KundaliDownload) {
  const url = URL.createObjectURL(new Blob([kundaliSvg(o)], { type: "image/svg+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `Janam-Kundali-${o.name.trim().replace(/\s+/g, "-") || "report"}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
