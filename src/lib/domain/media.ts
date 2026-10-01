import type { Loc } from "./loc";

export type MediaRef = {
  id: number;
  w: number;
  h: number;
  src: string;
  srcSet: string;
  blur: string | null;
  alt: Loc | null;
};
