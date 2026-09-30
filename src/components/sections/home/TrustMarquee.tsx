import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { Marquee } from "@/components/motion/Marquee";
import { cn } from "@/lib/utils/cn";

/* §2 Trust marquee (Home.dc.html 186–195, vHero 1420–1423): sand band between gold hairlines,
   seven promises separated by lotus marks, looping every 56 s; hover pauses it. */
export async function TrustMarquee() {
  const t = await getTranslations("home.marquee");
  const hi = (await getLocale()) === "hi";
  const items = t.raw("items") as string[];

  return (
    <section
      aria-label={t("label")}
      className="relative overflow-hidden bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.6),inset_0_-1px_0_rgba(184,146,58,.6)]"
    >
      <Marquee>
        {items.map((item) => (
          <span key={item} className="flex items-center gap-[26px] py-[17px] pr-[26px] whitespace-nowrap">
            <span
              className={cn(
                "text-em7",
                hi
                  ? "font-hi text-[16px] leading-none font-medium"
                  : "font-sans text-[12.5px] leading-none font-semibold tracking-[.14em] uppercase",
              )}
            >
              {item}
            </span>
            <span aria-hidden="true" className="block size-4 text-g5">
              <Icon name="lotus" />
            </span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
