import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getServiceAdmin } from "@/server/consult/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ServiceForm } from "@/components/admin/consult/ServiceForm";
import { TierEditor } from "@/components/admin/consult/TierEditor";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { ServiceKey } from "@/lib/domain/enums";

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("consult.edit");
  const { key } = await params;

  const service = await getServiceAdmin(key as ServiceKey);
  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-ink6 hover:text-em7 no-underline mb-2"
        >
          <span className="size-4">
            <AdminIcon name="arrowL" />
          </span>
          <span>Back to Services</span>
        </Link>

        <PageHeader
          title={`Edit ${service.nameEn}`}
          description={`Configure service copy, available modes, topics covered, and tier pricing for ${service.key}.`}
        />
      </div>

      {/* Service Details Form */}
      <section className="space-y-4">
        <h2 className="font-display text-[18px] font-semibold text-ink">
          Service Information
        </h2>
        <ServiceForm service={service} />
      </section>

      {/* Tiers Editors */}
      <section className="space-y-4 pt-4 border-t border-s2">
        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            Pricing Packages (Tiers)
          </h2>
          <p className="font-sans text-[13px] text-ink6">
            Exactly one tier is marked as &quot;Recommended&quot;. Setting a tier as recommended automatically unselects other tiers.
          </p>
        </div>

        <div className="space-y-5">
          {service.tiers.map((tier) => (
            <TierEditor
              key={tier.tierKey}
              serviceKey={service.key}
              tier={tier}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
