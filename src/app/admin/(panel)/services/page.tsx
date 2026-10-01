import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listServicesAdmin } from "@/server/consult/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";

export default async function AdminServicesPage(): Promise<React.JSX.Element> {
  await requireAdminPage("consult.edit");
  const services = await listServicesAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Services"
        description="Manage consultation offerings, descriptions, modes, and tiered package pricing."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {services.map((svc) => (
          <Link
            key={svc.key}
            href={`/admin/services/${svc.key}`}
            className="group flex flex-col justify-between rounded-btn border border-s2 bg-cream p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-em7/50 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-g7 uppercase">
                    /{svc.slug}
                  </span>
                  {svc.guarantee && (
                    <StatusBadge tone="accent">Guarantee</StatusBadge>
                  )}
                </div>
                <StatusBadge tone={svc.visible ? "ok" : "muted"}>
                  {svc.visible ? "Visible" : "Hidden"}
                </StatusBadge>
              </div>

              <div className="mt-3">
                <h3 className="font-display text-[18px] font-semibold text-ink transition-colors group-hover:text-em7">
                  {svc.nameEn}
                </h3>
                {svc.nameHi && (
                  <p className="font-deva text-[13.5px] text-ink6">
                    {svc.nameHi}
                  </p>
                )}
                {svc.content?.line?.en && (
                  <p className="mt-1 line-clamp-2 font-sans text-[13px] leading-relaxed text-ink6/80">
                    {svc.content.line.en}
                  </p>
                )}
              </div>

              {/* Modes */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {svc.modes.map((m) => (
                  <span
                    key={m}
                    className="rounded-field border border-s2/70 bg-cream/70 px-2 py-0.5 font-mono text-[11px] font-medium text-ink6 uppercase"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-s2 pt-3 font-sans text-[12.5px]">
              <div>
                <span className="text-ink6">From </span>
                <span className="font-mono text-[14px] font-bold text-em7">
                  ₹{fmt(svc.fromPriceInr)}
                </span>
                <span className="ml-2 text-ink6/70">
                  ({svc.tiers.length} packages)
                </span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-em7 group-hover:text-em5">
                <span>Edit Service</span>
                <span className="size-3.5 transition-transform group-hover:translate-x-0.5">
                  <AdminIcon name="arrowR" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
