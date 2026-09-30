import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { getAllProducts, getIntents } from "@/lib/api/catalog";
import type { IntentKey, Product } from "@/types/product";
import { INTENT_RX } from "./home-data";
import { IntentPicker } from "./IntentPicker";

/* §9 "08 Shop by intention" (Home.dc.html 622–645, vIntent 1233–1247). Sand band with floating
   gemstones that lean toward the mouse (desktop), seven intention pills and the four most
   popular products for the picked intention. The lists are resolved here; the client island
   only swaps between them. */
export async function Intentions() {
  const t = await getTranslations("home.intent");
  const [all, intents] = await Promise.all([getAllProducts(), getIntents()]);

  const lists = Object.fromEntries(
    intents.map((i) => [
      i.key,
      all
        .filter((p) => p.ik === i.key || INTENT_RX[i.key].test(p.intent))
        .sort((a, b) => b.pop - a.pop)
        .slice(0, 4),
    ]),
  ) as Record<IntentKey, Product[]>;

  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <IntentPicker intents={intents} lists={lists}>
      <MaskText className="flex flex-col items-center gap-3">
        <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
          {t("eyebrow")}
        </span>
        <h2 className="m-0 font-display text-[clamp(36px,5vw,68px)] leading-[1.04] font-normal tracking-[-.022em] text-em9 font-soft">
          <MaskLine>{t("l1")}</MaskLine>
          <MaskLine>{t.rich("l2", { em })}</MaskLine>
        </h2>
        <span lang="hi" className="font-deva text-[clamp(20px,2vw,24px)] leading-[1.35] text-g7">
          {t("deva")}
        </span>
      </MaskText>
    </IntentPicker>
  );
}
