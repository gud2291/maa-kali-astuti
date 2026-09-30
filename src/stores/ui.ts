/* UI store — replaces the prototype's `mka:ui` event bus (mka-core.js 446–450) and the
   overlay / toast state of SiteChrome (SiteChrome.dc.html 421–436). Not persisted. */
import { create } from "zustand";
import { isReduced } from "@/lib/hooks/useReducedMotion";

export type ToastTone = "ok" | "err" | "info";

export type ToastAction =
  /** Opens the cart drawer. */
  | { kind: "cart"; label: string }
  /** Navigates (locale-aware) to an internal path. */
  | { kind: "href"; label: string; href: string }
  /** Runs `run` (restore a removed line, re-save a wish). The label defaults to "Undo". */
  | { kind: "undo"; run: () => void; label?: string };

export type Toast = { id: string; msg: string; tone: ToastTone; action?: ToastAction; leaving?: boolean };
export type ToastInput = Omit<Toast, "id" | "leaving">;

export type QuickAdd = { pid: string; fromWish?: boolean };

/** Per-page chrome flags the toaster needs for its mobile offset (SiteChrome 542). */
export type ChromeFlags = { tabbar: boolean; checkout: boolean };

type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  searchQ: string;
  menuOpen: boolean;
  quick: QuickAdd | null;
  toasts: Toast[];
  chrome: ChromeFlags;
  /** A multi-step page (Booking) reached its done screen: pages with `flowFooter` show the footer. */
  flowDone: boolean;
  openCart: () => void;
  setCartOpen: (open: boolean) => void;
  openSearch: (q?: string) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  openQuick: (pid: string, fromWish?: boolean) => void;
  closeQuick: () => void;
  /** Shows a toast (max 3 on screen). Auto-dismiss: 6 s with Undo, else 4 s. Returns its id. */
  toast: (t: ToastInput) => string;
  /** Starts the 220 ms exit, then removes. */
  dismiss: (id: string) => void;
  setChrome: (c: Partial<ChromeFlags>) => void;
  setFlowDone: (done: boolean) => void;
  /** Esc from the chrome: closes every overlay. */
  closeAll: () => void;
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const EXIT_MS = 220;
let seq = 0;

export const useUi = create<UiState>()((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  searchQ: "",
  menuOpen: false,
  quick: null,
  toasts: [],
  chrome: { tabbar: true, checkout: false },
  flowDone: false,

  openCart: () => set({ cartOpen: true, menuOpen: false, searchOpen: false }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  openSearch: (q = "") => set({ searchOpen: true, searchQ: q }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  openQuick: (pid, fromWish) => set({ quick: { pid, fromWish } }),
  closeQuick: () => set({ quick: null }),

  toast: (t) => {
    const id = `t${Date.now().toString(36)}${(seq++).toString(36)}`;
    const next = [...get().toasts, { ...t, id }];
    // Keep the newest three; older ones leave without an exit animation (as in the design).
    const dropped = next.slice(0, Math.max(0, next.length - 3));
    dropped.forEach((d) => clearTimeout(timers.get(d.id)));
    dropped.forEach((d) => timers.delete(d.id));
    set({ toasts: next.slice(-3) });
    timers.set(
      id,
      setTimeout(() => get().dismiss(id), t.action?.kind === "undo" ? 6000 : 4000),
    );
    return id;
  },
  dismiss: (id) => {
    clearTimeout(timers.get(id));
    if (!get().toasts.some((t) => t.id === id && !t.leaving)) return;
    set({ toasts: get().toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) });
    timers.set(
      id,
      setTimeout(
        () => {
          timers.delete(id);
          set({ toasts: get().toasts.filter((t) => t.id !== id) });
        },
        isReduced() ? 0 : EXIT_MS,
      ),
    );
  },
  setChrome: (c) => set({ chrome: { ...get().chrome, ...c } }),
  setFlowDone: (flowDone) => set({ flowDone }),
  closeAll: () => set({ cartOpen: false, searchOpen: false, menuOpen: false, quick: null }),
}));
