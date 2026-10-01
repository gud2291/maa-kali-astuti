"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          action?: string;
          appearance?: "always" | "execute" | "interaction-only";
          size?: "normal" | "compact" | "flexible";
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (errorCode?: string) => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  action: string;
  resetKey?: number;
};

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Turnstile load failed")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Turnstile script load error"));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export function TurnstileWidget({
  onToken,
  action,
  resetKey,
}: TurnstileWidgetProps): React.JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      onTokenRef.current("dev");
      return;
    }

    let active = true;

    loadTurnstileScript()
      .then(() => {
        if (!active || !containerRef.current || !window.turnstile) return;

        // Clean up any existing widget in this container
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          appearance: "interaction-only",
          size: "flexible",
          theme: "light",
          callback: (token: string) => {
            if (active) onTokenRef.current(token);
          },
          "expired-callback": () => {
            if (active) onTokenRef.current(null);
          },
          "error-callback": () => {
            if (active) onTokenRef.current(null);
          },
        });

        widgetIdRef.current = id;
      })
      .catch(() => {
        if (active) onTokenRef.current(null);
      });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action]);

  const prevResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // ignore
        }
        onTokenRef.current(null);
      }
    }
  }, [resetKey]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className="my-2 min-h-[48px]" />;
}
