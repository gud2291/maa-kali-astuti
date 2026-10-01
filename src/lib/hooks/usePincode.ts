"use client";

import { useCallback, useEffect, useState } from "react";

export type PincodeData = {
  pin: string;
  city: string | null;
  state: string | null;
  cod: boolean;
  standard: [string, string];
  express: [string, string] | null;
};

export type PincodeStatus = "idle" | "loading" | "ready" | "error";

export type PincodeState = {
  status: PincodeStatus;
  data: PincodeData | null;
  error: string | null;
};

export const PINCODE_STORAGE_KEY = "mka.pin";

export function usePincode(): {
  check: (pin: string) => Promise<void>;
  state: PincodeState;
} {
  const [state, setState] = useState<PincodeState>({
    status: "idle",
    data: null,
    error: null,
  });

  const check = useCallback(async (pinInput: string) => {
    const pin = pinInput.trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setState({
        status: "error",
        data: null,
        error: "invalid",
      });
      return;
    }

    setState((prev) => ({
      status: "loading",
      data: prev.data,
      error: null,
    }));

    try {
      const res = await fetch(`/api/pincode/${pin}`);
      if (!res.ok) {
        setState({
          status: "error",
          data: null,
          error: "failed",
        });
        return;
      }

      const data = (await res.json()) as PincodeData;
      try {
        localStorage.setItem(PINCODE_STORAGE_KEY, pin);
      } catch {
        // ignore localStorage access errors
      }

      setState({
        status: "ready",
        data,
        error: null,
      });
    } catch {
      setState({
        status: "error",
        data: null,
        error: "network",
      });
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINCODE_STORAGE_KEY);
      if (stored && /^[1-9]\d{5}$/.test(stored.trim())) {
        void check(stored.trim());
      }
    } catch {
      // localStorage may fail
    }
  }, [check]);

  return { check, state };
}
