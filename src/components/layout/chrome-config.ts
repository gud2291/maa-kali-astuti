/* Per-route chrome props. The design passes these on every page's <dc-import name="SiteChrome">
   and <dc-import name="SiteFooter"> (see the table in PROGRESS F4 Done-notes); here they are
   derived from the locale-less pathname so the chrome can live once in the layout. */

export type ChromeActive =
  "shop" | "cart" | "home" | "consult" | "kundali" | "rashifal" | "courses" | "rituals" | "videos" | "about" | "";

export type ChromeConfig = {
  active: ChromeActive;
  /** `checkout` swaps the header for the 64px secure bar and drops the announcement + tab bar. */
  mode: "full" | "checkout";
  /** Mobile bottom tab bar. */
  tabbar: boolean;
  /** Mobile FAB offset when the tab bar is off (the page has its own sticky CTA bar). */
  fabLift: string;
  /** Checkout header. */
  backHref?: string;
  backLabel?: "consultations" | "cart";
  secureLabel?: "booking" | "checkout";
  /** Footer newsletter block (off on Home, which has its own newsletter band). */
  newsletter: boolean;
};

const BASE: ChromeConfig = { active: "", mode: "full", tabbar: true, fabLift: "88px", newsletter: true };

const under = (path: string, base: string) => path === base || path.startsWith(base + "/");

export function chromeFor(path: string): ChromeConfig {
  if (path === "/") return { ...BASE, active: "home", newsletter: false };
  // Booking.dc.html: mode=checkout, active=consult, back to Consultations, "Secure booking".
  if (under(path, "/book"))
    return {
      ...BASE,
      active: "consult",
      mode: "checkout",
      tabbar: false,
      fabLift: "104px",
      backHref: "/consultations",
      backLabel: "consultations",
      secureLabel: "booking",
    };
  // Consultation-Detail: tabbar off (sticky Book bar), FAB lifted to 92px.
  if (path.startsWith("/consultations/")) return { ...BASE, active: "consult", tabbar: false, fabLift: "92px" };
  if (path === "/consultations") return { ...BASE, active: "consult" };
  // Course-Detail: tabbar off (sticky Enquire bar), FAB 92px.
  if (path.startsWith("/sadhana-courses/")) return { ...BASE, active: "courses", tabbar: false, fabLift: "92px" };
  if (path === "/sadhana-courses") return { ...BASE, active: "courses" };
  if (under(path, "/shop")) return { ...BASE, active: "shop" };
  if (path === "/cart") return { ...BASE, active: "cart" };
  if (path === "/kundali-99") return { ...BASE, active: "kundali" };
  if (under(path, "/rashifal")) return { ...BASE, active: "rashifal" };
  if (path === "/rituals") return { ...BASE, active: "rituals" };
  if (path === "/videos") return { ...BASE, active: "videos" };
  if (path === "/about") return { ...BASE, active: "about" };
  return BASE; // Love Calculator (active=""), coming-soon pages, 404
}
