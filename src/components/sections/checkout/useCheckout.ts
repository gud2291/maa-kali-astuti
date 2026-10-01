"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ContactInput, AddressInput } from "@/lib/validation/checkout";
import type { DeliveryOption, PaymentMethod, PayPref } from "@/lib/domain/enums";
import type { IndianState } from "@/lib/domain/india";

export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

export type CheckoutState = {
  step: CheckoutStep;
  contact: ContactInput;
  address: AddressInput;
  saveAddress: boolean;
  delivery: DeliveryOption;
  method: PaymentMethod;
  payPref: PayPref | null;
  gift: boolean;
  giftMessage: string | null;
  note: string | null;
  draftToken: string | null;
  pendingOrder: { number: string; accessKey: string } | null;

  setStep: (step: CheckoutStep) => void;
  setContact: (contact: Partial<ContactInput>) => void;
  setAddress: (address: Partial<AddressInput>) => void;
  setSaveAddress: (saveAddress: boolean) => void;
  setDelivery: (delivery: DeliveryOption) => void;
  setMethod: (method: PaymentMethod) => void;
  setPayPref: (payPref: PayPref | null) => void;
  setGift: (gift: boolean) => void;
  setGiftMessage: (msg: string | null) => void;
  setNote: (note: string | null) => void;
  setDraftToken: (token: string | null) => void;
  setPendingOrder: (order: { number: string; accessKey: string } | null) => void;
  reset: () => void;
};

const INITIAL_CONTACT: ContactInput = {
  name: "",
  phone: "",
  email: "",
};

const INITIAL_ADDRESS: AddressInput = {
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "Delhi" as IndianState,
  pincode: "",
};

export const CHECKOUT_STORAGE_KEY = "mka.checkout";

export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      step: 1,
      contact: INITIAL_CONTACT,
      address: INITIAL_ADDRESS,
      saveAddress: false,
      delivery: "standard",
      method: "cod",
      payPref: null,
      gift: false,
      giftMessage: null,
      note: null,
      draftToken: null,
      pendingOrder: null,

      setStep: (step) => set({ step }),
      setContact: (patch) => set((s) => ({ contact: { ...s.contact, ...patch } })),
      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),
      setSaveAddress: (saveAddress) => set({ saveAddress }),
      setDelivery: (delivery) => set({ delivery }),
      setMethod: (method) => set({ method }),
      setPayPref: (payPref) => set({ payPref }),
      setGift: (gift) => set({ gift }),
      setGiftMessage: (giftMessage) => set({ giftMessage }),
      setNote: (note) => set({ note }),
      setDraftToken: (draftToken) => set({ draftToken }),
      setPendingOrder: (pendingOrder) => set({ pendingOrder }),
      reset: () =>
        set({
          step: 1,
          contact: INITIAL_CONTACT,
          address: INITIAL_ADDRESS,
          saveAddress: false,
          delivery: "standard",
          method: "cod",
          payPref: null,
          gift: false,
          giftMessage: null,
          note: null,
          draftToken: null,
          pendingOrder: null,
        }),
    }),
    {
      name: CHECKOUT_STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.sessionStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
      ),
    },
  ),
);
