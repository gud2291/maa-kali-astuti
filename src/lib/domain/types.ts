import type { Loc } from "./loc";
import { emptyLoc } from "./loc";
import type { MediaRef } from "./media";
import type { CategoryKey, WristSize } from "./enums";
import type { Product } from "@/types/product";

export type { Loc };

export type MediaVariant = { w: number; h: number; key: string; bytes: number };

export type ProductContent = {
  description: Loc;
  benefits: Loc[];
  howToWear: Loc;
  specs: { k: Loc; v: Loc }[];
  placement: Loc[];
  certificateMediaId: number | null;
  youtubeId: string | null;
};

export const EMPTY_PRODUCT_CONTENT: ProductContent = {
  description: emptyLoc(),
  benefits: [],
  howToWear: emptyLoc(),
  specs: [],
  placement: [],
  certificateMediaId: null,
  youtubeId: null,
};

export type ServiceContent = {
  line: Loc;
  deliver: Loc;
  get: Loc;
  modesLine: Loc;
  covered: { icon: string; t: Loc; d: Loc }[];
  samples: { kind: string; cap: Loc }[];
};

export type CourseContent = {
  essence: Loc;
  overview: Loc;
  niyam: Loc;
  attain: Loc[];
};

export type ShipAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

export type BirthProfile = {
  name: string;
  dob: string;
  tob: string | null;
  tobUnknown: boolean;
  place: string;
  lat: number | null;
  lon: number | null;
  tz: string | null;
};

export type BookingDetailsRecord = {
  dob: string;
  tob: string;
  unknown: boolean;
  place: string;
  q: string;
  lang: "hi" | "en";
  mobile: string;
  biz: string;
};

export type CartLineInput = {
  pid: string;
  variant: WristSize | null;
  qty: number;
  energ: { name: string; gotra: string } | null;
};

export type RichMark = {
  type: "bold" | "italic" | "link";
  attrs?: { href: string };
};

export type RichNode = {
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "blockquote"
    | "horizontalRule"
    | "image"
    | "text"
    | "hardBreak";
  attrs?: Record<string, string | number | null>;
  content?: RichNode[];
  text?: string;
  marks?: RichMark[];
};

export type RichDoc = {
  type: "doc";
  content: RichNode[];
};

export type HeroSlideText = {
  eyebrow: Loc;
  l1: Loc;
  l2: Loc;
  sub: Loc;
  body: Loc;
  cta1: Loc;
  cta2: Loc;
  mediaId: number | null;
};

export type CatalogSnapshot = {
  v: number;
  products: ProductLite[];
  categories: { key: CategoryKey; slug: string; name: Loc; short: Loc }[];
  services: { key: string; slug: string; name: Loc; icon: string; line: Loc; price: number; dur: string }[];
  articles: { slug: string; title: Loc; category: string; mins: number; pid: string | null }[];
  trending: string[];
  fees: {
    freeShippingInr: number;
    shippingInr: number;
    expressInr: number;
    codFeeInr: number;
    codEnabled: boolean;
    giftWrapInr: number;
    energizationInr: number;
    maxLineQty: number;
  };
};

export type ProductLite = Pick<
  Product,
  | "id"
  | "slug"
  | "cat"
  | "name"
  | "hi"
  | "price"
  | "mrp"
  | "stock"
  | "sizes"
  | "art"
  | "photo"
  | "photo2"
  | "badges"
  | "rating"
  | "reviews"
  | "intent"
  | "ik"
  | "sub"
  | "mukhi"
  | "stone"
  | "stoneName"
  | "catName"
  | "buyUrl"
> & { images: MediaRef[]; catShort: string };
