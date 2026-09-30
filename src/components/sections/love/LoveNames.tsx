"use client";
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

/* The two names typed into the Love Calculator. Shared so "How it works" (Love-Calculator.dc.html
   101–138) can follow them live, as in the design where both read the page state. */

type Names = {
  a: string;
  b: string;
  setA: Dispatch<SetStateAction<string>>;
  setB: Dispatch<SetStateAction<string>>;
};

const Ctx = createContext<Names | null>(null);

export function LoveNamesProvider({ children }: { children: ReactNode }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  return <Ctx.Provider value={{ a, b, setA, setB }}>{children}</Ctx.Provider>;
}

export function useLoveNames(): Names {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLoveNames needs <LoveNamesProvider>");
  return v;
}
