import { create } from "zustand";

export type AdminToastTone = "ok" | "err" | "info";

export type AdminToast = {
  id: string;
  msg: string;
  tone: AdminToastTone;
  leaving?: boolean;
};

type ToastState = {
  toasts: AdminToast[];
  add: (msg: string, tone: AdminToastTone) => string;
  dismiss: (id: string) => void;
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();
let seq = 0;

export const useAdminToast = create<ToastState>((set, get) => ({
  toasts: [],
  add: (msg: string, tone: AdminToastTone): string => {
    const id = `adm-toast-${Date.now()}-${++seq}`;

    set((state) => {
      const active = state.toasts.filter((t) => !t.leaving);
      const keep = active.slice(Math.max(0, active.length - 2));
      return {
        toasts: [...keep, { id, msg, tone }],
      };
    });

    const timer = setTimeout(() => {
      get().dismiss(id);
    }, 4000);
    timers.set(id, timer);

    return id;
  },
  dismiss: (id: string): void => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }

    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 220);
  },
}));

export const toast = {
  ok: (msg: string): string => useAdminToast.getState().add(msg, "ok"),
  err: (msg: string): string => useAdminToast.getState().add(msg, "err"),
  info: (msg: string): string => useAdminToast.getState().add(msg, "info"),
  dismiss: (id: string): void => useAdminToast.getState().dismiss(id),
};
