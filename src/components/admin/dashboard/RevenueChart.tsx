import type { RevenueSeriesDay } from "@/server/dashboard/queries";
import { fmt } from "@/lib/core/format";

export type RevenueChartProps = {
  data: RevenueSeriesDay[];
};

export function RevenueChart({ data }: RevenueChartProps): React.JSX.Element {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.ordersCount, 0);

  const rawMax = Math.max(0, ...data.map((d) => d.revenue));
  // Round up max to a clean multiple
  const maxRevenue = rawMax > 0 ? Math.ceil(rawMax / 5000) * 5000 : 10000;

  const width = 760;
  const height = 240;
  const padLeft = 64;
  const padRight = 20;
  const padTop = 24;
  const padBottom = 42;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const slotW = chartW / 30;
  const barW = Math.max(10, Math.floor(slotW * 0.65));
  const barOffset = (slotW - barW) / 2;

  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2">
      {/* Chart Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-s2 pb-4">
        <div>
          <h3 className="font-serif text-[18px] font-bold text-ink">
            30-Day Revenue Trend
          </h3>
          <p className="mt-0.5 font-sans text-[12px] text-ink6">
            Daily orders & revenue (IST calendar days)
          </p>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="font-display text-[22px] font-bold text-g7 sm:text-[26px]">
            {fmt(totalRevenue)}
          </div>
          <div className="font-sans text-[12.5px] font-medium text-ink6">
            ({totalOrders} order{totalOrders === 1 ? "" : "s"})
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="mt-4 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="w-full h-auto select-none"
          role="img"
          aria-label={`30-day revenue chart, total ${fmt(totalRevenue)} across ${totalOrders} orders`}
        >
          {/* Y-axis gridlines & labels */}
          {[1, 0.5, 0].map((ratio) => {
            const y = padTop + chartH * (1 - ratio);
            const val = Math.round(maxRevenue * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(217, 185, 106, 0.25)"
                  strokeDasharray={ratio === 0 ? undefined : "3 3"}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#786c5e"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `₹${val}`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = padLeft + i * slotW + barOffset;
            const barH =
              d.revenue > 0
                ? Math.max(4, (d.revenue / maxRevenue) * chartH)
                : 2;
            const y = padTop + chartH - barH;
            const isZero = d.revenue === 0;

            const isLabelDay = i % 5 === 0 || i === data.length - 1;

            return (
              <g key={d.dayKey}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="2"
                  fill={isZero ? "rgba(217, 185, 106, 0.2)" : "#d9b96a"}
                  className={
                    isZero
                      ? "transition-colors"
                      : "transition-colors hover:fill-[#b89535] cursor-pointer"
                  }
                >
                  <title>
                    {`${d.label}: ${fmt(d.revenue)} (${d.ordersCount} order${d.ordersCount === 1 ? "" : "s"})`}
                  </title>
                </rect>

                {/* X-axis label every 5 days + last day */}
                {isLabelDay && (
                  <text
                    x={x + barW / 2}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    fill="#786c5e"
                    fontSize="9.5"
                    fontFamily="sans-serif"
                  >
                    {d.dayKey.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Visually hidden data table for screen readers */}
        <table className="sr-only">
          <caption>30-day revenue and order counts</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Revenue</th>
              <th scope="col">Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.dayKey}>
                <td>{d.label}</td>
                <td>{fmt(d.revenue)}</td>
                <td>{d.ordersCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
