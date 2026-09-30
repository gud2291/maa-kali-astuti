import { Icon, type IconName } from "@/components/icons/Icon";
import { Starfield } from "@/components/signature/Starfield";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { cn } from "@/lib/utils/cn";

/* Booking summary aside (Booking.dc.html 366–390), ≥1024 only, sticky 88px under the checkout
   bar. Night card: a small sky (16 seeded stars "bk-sum" + a faint mandala, top right) behind the
   service icon and names; the Package / Mode / When / Language rows ("Not chosen yet" in muted
   sage); the gold total; the three reassurance lines on the deeper band. */

export type SummaryRow = { k: string; v: string; muted?: boolean };
export type SummaryData = {
  icon: IconName;
  name: string;
  hi: string;
  price: string;
  /** "Detailed · 90 min · Phone call" (mobile bottom bar). */
  short: string;
  rows: SummaryRow[];
};

export function BookingSummary({
  sum,
  labels,
  trust,
}: {
  sum: SummaryData;
  labels: { aria: string; total: string; taxes: string };
  trust: { icon: IconName; t: string }[];
}) {
  return (
    <aside
      aria-label={labels.aria}
      className="sticky top-[88px] flex flex-col overflow-hidden rounded-btn bg-n9 text-em1 shadow-[0_30px_60px_-34px_rgba(10,31,26,.6),inset_0_0_0_1px_rgba(217,185,106,.35)] max-lg:hidden"
    >
      <div className="relative overflow-hidden px-7 pt-7 pb-[22px]">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
          <span className="absolute inset-0 block">
            <Starfield seed="bk-sum" n={16} w={420} h={160} />
          </span>
          <svg
            viewBox="0 0 420 160"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 block"
          >
            <g transform="translate(380 40)" opacity=".16">
              <MandalaG R={120} col="#D9B96A" sw={0.8} />
            </g>
          </svg>
        </span>
        <div className="relative flex items-center gap-3.5">
          <span className="grid size-[54px] flex-none place-items-center rounded-pill bg-n8 text-g3 shadow-ring-gold">
            <Icon name={sum.icon} className="size-[26px]" />
          </span>
          <span className="flex flex-col gap-1">
            <span lang="hi" className="font-deva text-[15px] leading-[1.3] text-g3">
              {sum.hi}
            </span>
            <span lang="en" className="font-display text-[25px] leading-[1.1] font-normal text-iv font-soft">
              {sum.name}
            </span>
          </span>
        </div>
      </div>
      <dl className="m-0 px-7">
        {sum.rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-4 border-t border-[rgba(217,185,106,.2)] py-3.5">
            <dt className="font-sans text-[10.5px] leading-[1.5] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
              {r.k}
            </dt>
            <dd
              className={cn(
                "m-0 text-right font-sans text-[14px] leading-[1.45] font-semibold",
                r.muted ? "text-sg5" : "text-iv",
              )}
            >
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mx-7 flex items-end justify-between gap-4 border-t border-[rgba(217,185,106,.45)] pt-[18px] pb-[22px]">
        <span className="flex flex-col gap-1">
          <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
            {labels.total}
          </span>
          <span className="font-sans text-[12.5px] leading-none font-medium text-sg3">{labels.taxes}</span>
        </span>
        <span className="font-sans text-[32px] leading-none font-bold tracking-[-.01em] text-g3 tabular">
          {sum.price}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 bg-n8 px-7 pt-[18px] pb-6">
        {trust.map((x) => (
          <li
            key={x.t}
            className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 font-sans text-[13px] leading-[1.5] font-medium text-sg3"
          >
            <Icon name={x.icon} className="size-[18px] text-g3" />
            {x.t}
          </li>
        ))}
      </ul>
    </aside>
  );
}
