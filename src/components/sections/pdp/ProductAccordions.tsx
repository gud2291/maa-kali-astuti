import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import type { ProductContent } from "@/lib/domain/types";
import type { StoreSettings } from "@/lib/validation/settings";

type Props = {
  content: ProductContent;
  locale: string;
  store: StoreSettings;
  labels: {
    desc: string;
    benefits: string;
    howToWear: string;
    specs: string;
    shipping: string;
    shippingText: string;
    authenticity: string;
    authenticityText: string;
  };
  /** Omit the "Authenticity & certification" item (third-party products). */
  hideAuthenticity?: boolean;
};

type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

export function ProductAccordions({ content, locale, store, labels, hideAuthenticity }: Props) {
  const isHi = locale === "hi";
  const items: AccordionItem[] = [];

  // 1. Description
  const descText = isHi
    ? content.description?.hi || content.description?.en
    : content.description?.en || content.description?.hi;
  if (descText && descText.trim()) {
    items.push({
      title: labels.desc,
      content: <p className="m-0 whitespace-pre-line">{descText}</p>,
    });
  }

  // 2. Benefits
  if (content.benefits && content.benefits.length > 0) {
    const list = content.benefits
      .map((b) => (isHi ? b.hi || b.en : b.en || b.hi))
      .filter((b) => Boolean(b && b.trim()));

    if (list.length > 0) {
      items.push({
        title: labels.benefits,
        content: (
          <ul className="m-0 list-disc pl-5 flex flex-col gap-2">
            {list.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ),
      });
    }
  }

  // 3. How to wear
  const htwText = isHi
    ? content.howToWear?.hi || content.howToWear?.en
    : content.howToWear?.en || content.howToWear?.hi;
  if (htwText && htwText.trim()) {
    items.push({
      title: labels.howToWear,
      content: <p className="m-0 whitespace-pre-line">{htwText}</p>,
    });
  }

  // 4. Specifications
  if (content.specs && content.specs.length > 0) {
    const validSpecs = content.specs.filter(
      (s) => (s.k.en || s.k.hi) && (s.v.en || s.v.hi),
    );
    if (validSpecs.length > 0) {
      items.push({
        title: labels.specs,
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border-t border-s2/70 pt-2">
            {validSpecs.map((s, i) => {
              const k = isHi ? s.k.hi || s.k.en : s.k.en || s.k.hi;
              const v = isHi ? s.v.hi || s.v.en : s.v.en || s.v.hi;
              return (
                <div key={i} className="flex justify-between border-b border-s2/40 py-2 text-[14px]">
                  <span className="font-semibold text-em9">{k}</span>
                  <span className="text-ink6">{v}</span>
                </div>
              );
            })}
          </div>
        ),
      });
    }
  }

  // 5. Shipping & returns
  items.push({
    title: labels.shipping,
    content: <p className="m-0 leading-[1.7]">{labels.shippingText}</p>,
  });

  // 6. Authenticity
  if (!hideAuthenticity)
    items.push({
      title: labels.authenticity,
      content: <p className="m-0 leading-[1.7]">{labels.authenticityText}</p>,
    });

  return (
    <div className="flex flex-col border-t border-s2">
      {items.map((item, index) => (
        <details
          key={item.title}
          open={index === 0}
          className="group border-b border-s2"
        >
          <summary className="grid w-full cursor-pointer list-none grid-cols-[32px_minmax(0,1fr)_30px] items-center gap-2.5 py-4.5 text-left text-em9 transition-colors duration-150 hover:text-em5 select-none [&::-webkit-details-marker]:hidden">
            <span className="font-sans text-[11px] leading-none font-semibold tracking-[.14em] text-g7 tabular">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-[clamp(17px,1.6vw,20px)] leading-[1.35] font-normal text-pretty font-soft">
              {item.title}
            </span>
            <span
              className={cn(
                "grid size-[30px] place-items-center rounded-pill text-em7 transition-all duration-300",
                "bg-transparent shadow-[inset_0_0_0_1px_#EAE0CA]",
                "group-open:rotate-45 group-open:bg-em1 group-open:shadow-[inset_0_0_0_1px_#1C6B54]",
              )}
            >
              <Icon name="plus" className="size-3.5" />
            </span>
          </summary>
          <div className="max-w-[780px] pr-8 pb-5 pl-[42px] font-sans text-[15px] leading-[1.7] text-pretty text-ink6">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
