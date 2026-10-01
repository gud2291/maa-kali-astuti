import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon, type IconName } from "@/components/icons/Icon";
import type { Loc } from "@/lib/domain/types";

type Props = {
  placement: Loc[];
  locale: string;
  labels: {
    eyebrow: string;
    title: string;
    temple: string;
    locker: string;
    office: string;
  };
};

const CARDS: { icon: IconName; key: "temple" | "locker" | "office" }[] = [
  { icon: "temple", key: "temple" },
  { icon: "locker", key: "locker" },
  { icon: "office", key: "office" },
];

export function PlacementGuide({ placement, locale, labels }: Props) {
  if (!placement || placement.length === 0) return null;

  const isHi = locale === "hi";

  return (
    <section className="flex flex-col gap-6 py-6 border-t border-s2">
      <SectionHeader
        eyebrow={labels.eyebrow}
        title={labels.title}
        size="sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map((card, i) => {
          const locObj = placement[i] ?? placement[0];
          const text = isHi ? locObj.hi || locObj.en : locObj.en || locObj.hi;
          if (!text) return null;

          return (
            <div
              key={card.key}
              className="flex flex-col gap-3 rounded-btn border border-s2 bg-cream/70 p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="grid size-12 place-items-center rounded-pill bg-em1 text-em7 shadow-[inset_0_0_0_1px_#1C6B54]">
                <Icon name={card.icon} className="size-6" />
              </div>
              <h3 className="m-0 font-title text-[18px] leading-[1.25] font-normal text-em9">
                {labels[card.key]}
              </h3>
              <p className="m-0 font-sans text-[14px] leading-[1.6] text-ink6">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
