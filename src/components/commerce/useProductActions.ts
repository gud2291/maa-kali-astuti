"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getCartCount, useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { useUi } from "@/stores/ui";
import { burst, flyToCart } from "./fx";
import type { Product, WristSize } from "@/types/product";

/** Add-to-cart morph: idle → loading (380 ms) → added (1.5 s) → idle. */
export type AddPhase = "idle" | "loading" | "added";

/**
 * Card / PDP actions ported from ProductCard.dc.html 86–98 and 128–135.
 * `imgRef` is the element that flies to the cart.
 */
export function useProductActions(p: Product, imgRef: RefObject<HTMLElement | null>) {
  const [ph, setPh] = useState<AddPhase>("idle");
  const t = useTranslations("toast");
  const hi = useLocale() === "hi";
  const name = hi ? p.hi : p.name;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Mirrors `ph` synchronously so a double click can't start two adds before the re-render.
  const phRef = useRef<AddPhase>("idle");
  const setPhase = useCallback((v: AddPhase) => {
    phRef.current = v;
    setPh(v);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const oos = p.stock === 0;

  /** Direct add (with a size when chosen on the card). */
  const doAdd = useCallback(
    (variant: WristSize | null) => {
      if (oos || phRef.current !== "idle") return;
      setPhase("loading");
      timers.current.push(
        setTimeout(() => {
          useCart.getState().add(p.id, { variant });
          flyToCart(imgRef.current);
          const ui = useUi.getState();
          ui.toast({
            msg: variant ? t("addedSize", { name, size: variant }) : t("added", { name }),
            tone: "ok",
            action: { kind: "cart", label: t("viewCart") },
          });
          // The first item in an empty cart opens the drawer (gotcha 3).
          if (getCartCount() === 1) ui.openCart();
          setPhase("added");
          timers.current.push(setTimeout(() => setPhase("idle"), 1500));
        }, 380),
      );
    },
    [oos, p.id, imgRef, name, t, setPhase],
  );

  /** Main button: sold out → WhatsApp notice; sized product → quick-add sheet; else add. */
  const add = useCallback(() => {
    if (oos) {
      useUi.getState().toast({ msg: t("notifyBack"), tone: "info" });
      return;
    }
    if (p.sizes) {
      useUi.getState().openQuick(p.id);
      return;
    }
    doAdd(null);
  }, [oos, p.sizes, p.id, doAdd, t]);

  /** Mobile "+" (never shown when sold out). */
  const addMobile = useCallback(() => {
    if (p.sizes) useUi.getState().openQuick(p.id);
    else doAdd(null);
  }, [p.sizes, p.id, doAdd]);

  const toggleWish = useCallback(
    (heart: HTMLElement | null) => {
      const now = useWishlist.getState().toggle(p.id);
      if (now) {
        burst(heart);
        useUi
          .getState()
          .toast({ msg: t("saved"), tone: "ok", action: { kind: "href", label: t("view"), href: "/wishlist" } });
      }
    },
    [p.id, t],
  );

  const moveToCart = useCallback(() => {
    if (p.sizes) {
      useUi.getState().openQuick(p.id, true);
      return;
    }
    useCart.getState().add(p.id);
    flyToCart(imgRef.current);
    useWishlist.getState().toggle(p.id);
    useUi.getState().toast({ msg: t("moved", { name }), tone: "ok", action: { kind: "cart", label: t("viewCart") } });
  }, [p.sizes, p.id, imgRef, name, t]);

  const removeWish = useCallback(() => {
    const wl = useWishlist.getState();
    wl.toggle(p.id);
    useUi.getState().toast({
      msg: t("removedWish"),
      tone: "info",
      action: { kind: "undo", run: () => useWishlist.getState().toggle(p.id) },
    });
  }, [p.id, t]);

  return { ph, oos, doAdd, add, addMobile, toggleWish, moveToCart, removeWish };
}
