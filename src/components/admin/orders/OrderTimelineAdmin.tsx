import { formatIst } from "@/lib/core/ist";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcon";
import type { orderEvents } from "@/server/db/schema/commerce";

export type OrderTimelineAdminProps = {
  events: (typeof orderEvents.$inferSelect)[];
};

function getEventIcon(type: string): { name: AdminIconName; color: string } {
  switch (type) {
    case "created":
      return { name: "package", color: "text-em7" };
    case "paid":
      return { name: "card", color: "text-ok" };
    case "status":
      return { name: "truck", color: "text-g7" };
    case "tracking":
      return { name: "truck", color: "text-em7" };
    case "note":
      return { name: "tag", color: "text-ink6" };
    case "refund":
      return { name: "returns", color: "text-sin" };
    case "attention":
      return { name: "alert", color: "text-sin" };
    default:
      return { name: "grid", color: "text-ink6" };
  }
}

export function OrderTimelineAdmin({ events }: OrderTimelineAdminProps): React.JSX.Element {
  if (events.length === 0) {
    return (
      <div className="rounded-field border border-s2 bg-iv p-4 text-xs text-ink6 text-center">
        No event history recorded.
      </div>
    );
  }

  return (
    <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-4">
      <h3 className="font-sans text-sm font-bold text-ink flex items-center gap-2 border-b border-s2 pb-3">
        <div className="h-4 w-4 text-em7">
          <AdminIcon name="clock" sw={2} />
        </div>
        Order Timeline & Event Log
      </h3>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-s2">
        {events.map((ev) => {
          const { name, color } = getEventIcon(ev.type);
          return (
            <div key={ev.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-iv border border-s2 ${color} shadow-xs`}
              >
                <div className="h-3 w-3">
                  <AdminIcon name={name} sw={2} />
                </div>
              </div>

              {/* Event Content */}
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink capitalize">
                    {ev.type === "status" && ev.toStatus
                      ? `Status: ${ev.toStatus}`
                      : ev.type}
                  </span>
                  <span className="font-sans text-[11px] text-ink6">
                    {formatIst(ev.createdAt, { time: true })}
                  </span>
                </div>

                {ev.message && (
                  <p className="font-sans text-xs text-ink6 leading-relaxed whitespace-pre-wrap">
                    {ev.message}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                  {ev.public ? (
                    <span className="text-em7 font-semibold">Visible to customer</span>
                  ) : (
                    <span className="text-ink6 font-medium italic">Internal note/event</span>
                  )}
                  {ev.actorId != null && (
                    <span className="text-ink6 font-mono text-[10px]">
                      (Staff ID: {ev.actorId})
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
