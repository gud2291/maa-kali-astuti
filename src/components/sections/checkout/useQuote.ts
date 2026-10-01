"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { quoteAction } from "@/server/cart/actions";
import { useCart } from "@/stores/cart";
import { useCheckout } from "./useCheckout";
import type { Quote } from "@/server/cart/quote";
import type { QuoteInput } from "@/lib/validation/checkout";

export type UseQuoteReturn = {
  quote: Quote | null;
  pending: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useQuote(): UseQuoteReturn {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const delivery = useCheckout((s) => s.delivery);
  const method = useCheckout((s) => s.method);
  const gift = useCheckout((s) => s.gift);
  const email = useCheckout((s) => s.contact.email);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef<number>(0);
  const isFirstMountRef = useRef<boolean>(true);

  const runQuote = useCallback(async () => {
    if (!lines || lines.length === 0) {
      setQuote(null);
      setPending(false);
      setError(null);
      return;
    }

    const currentReqId = ++reqIdRef.current;
    setPending(true);

    try {
      const input: QuoteInput = {
        lines: lines.map((l) => ({
          pid: l.pid,
          qty: l.qty,
          variant: l.variant ?? null,
          energ: l.energ ?? null,
        })),
        delivery,
        method,
        gift,
        couponCode: coupon?.code ?? null,
        email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
      };

      const res = await quoteAction(input);

      if (currentReqId === reqIdRef.current) {
        if (res.ok) {
          setQuote(res.data);
          setError(null);
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      if (currentReqId === reqIdRef.current) {
        setError(err instanceof Error ? err.message : "Failed to get quote");
      }
    } finally {
      if (currentReqId === reqIdRef.current) {
        setPending(false);
      }
    }
  }, [lines, coupon, delivery, method, gift, email]);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      void runQuote();
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void runQuote();
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [runQuote]);

  return { quote, pending, error, refetch: runQuote };
}
