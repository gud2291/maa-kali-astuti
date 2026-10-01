"use client";

import { Dialog } from "radix-ui";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SizeGuide({ open, onOpenChange }: Props) {
  const t = useTranslations("pdp");
  const tq = useTranslations("quick");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          aria-describedby="size-guide-desc"
          className={cn(
            "fixed z-60 max-w-full bg-iv px-6 py-5 shadow-2xl outline-none",
            "inset-x-0 bottom-0 w-full rounded-t-[10px] pb-[calc(24px+env(safe-area-inset-bottom))]",
            "md:inset-auto md:top-1/2 md:left-1/2 md:w-[480px] md:[transform:translate(-50%,-50%)] md:rounded-[8px]",
          )}
        >
          <div className="flex items-center justify-between border-b border-s2 pb-3">
            <Dialog.Title className="m-0 font-title text-[20px] font-normal text-em9">
              {t("sizeGuideTitle")}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("close")}
              className="grid size-9 cursor-pointer place-items-center rounded-pill border-0 bg-transparent text-em7 hover:bg-s1"
            >
              <Icon name="close" className="size-4" />
            </Dialog.Close>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 rounded-btn bg-s1 p-3.5 border border-s2">
              <WristArt />
              <p id="size-guide-desc" className="m-0 font-sans text-[13.5px] leading-[1.6] text-ink6">
                {t("sizeGuideDesc")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border border-s2 rounded-btn overflow-hidden bg-cream">
              <div className="grid grid-cols-2 bg-s2 px-3.5 py-2 font-sans text-[12px] font-bold tracking-wider text-em9 uppercase">
                <span>{t("sizeLabel")}</span>
                <span>Circumference</span>
              </div>
              <div className="grid grid-cols-2 border-b border-s2/60 px-3.5 py-2.5 font-sans text-[13.5px]">
                <span className="font-bold text-em9">S (Small)</span>
                <span className="text-ink6">{tq("S")}</span>
              </div>
              <div className="grid grid-cols-2 border-b border-s2/60 px-3.5 py-2.5 font-sans text-[13.5px]">
                <span className="font-bold text-em9">M (Medium)</span>
                <span className="text-ink6">{tq("M")}</span>
              </div>
              <div className="grid grid-cols-2 px-3.5 py-2.5 font-sans text-[13.5px]">
                <span className="font-bold text-em9">L (Large)</span>
                <span className="text-ink6">{tq("L")}</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function WristArt() {
  return (
    <svg
      viewBox="0 0 120 80"
      width="120"
      height="80"
      fill="none"
      stroke="#7A5C1C"
      strokeWidth={1.3}
      strokeLinecap="round"
      aria-hidden
      className="block flex-none"
    >
      <path d="M8 58c14-6 26-8 40-8h40c10 0 18 4 24 10M8 30c14 6 26 8 40 8h40c10 0 18-4 24-10" />
      <ellipse cx="62" cy="44" rx="7" ry="18" stroke="#B8923A" strokeWidth={2} />
      <path d="M62 26v-8M58 18h8" stroke="#B8923A" />
      <text x="74" y="16" fontSize="8" fill="#7A5C1C" stroke="none" className="font-sans">
        +1 cm
      </text>
    </svg>
  );
}
