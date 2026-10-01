import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { media } from "@/server/db/schema/core";
import { requireAdminPage } from "@/server/auth/guards";
import { getSettingsForAdmin } from "@/server/settings/admin";
import { toMediaRef } from "@/server/media/refs";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkTabs, type LinkTab } from "@/components/admin/ui/Tabs";
import { StoreForm } from "@/components/admin/settings/StoreForm";
import { ContactForm } from "@/components/admin/settings/ContactForm";
import { SeoForm } from "@/components/admin/settings/SeoForm";
import { NotifyForm } from "@/components/admin/settings/NotifyForm";
import { OffersForm } from "@/components/admin/settings/OffersForm";
import { InvoiceForm } from "@/components/admin/settings/InvoiceForm";
import type { MediaRef } from "@/lib/domain/media";

const SETTINGS_TABS = [
  { key: "store", label: "Store & Shipping" },
  { key: "contact", label: "Contact & Social" },
  { key: "seo", label: "SEO & Social Share" },
  { key: "notify", label: "Notifications" },
  { key: "offers", label: "Offers & Pricing" },
  { key: "invoice", label: "Invoice & Tax" },
] as const;

type TabKey = (typeof SETTINGS_TABS)[number]["key"];

export default async function SettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("settings.edit");

  const sp = await props.searchParams;
  const currentTab: TabKey =
    SETTINGS_TABS.find((t) => t.key === sp.tab)?.key ?? "store";

  const allSettings = await getSettingsForAdmin();

  let ogMedia: MediaRef | null = null;
  if (allSettings.seo.ogMediaId) {
    const rows = await db
      .select()
      .from(media)
      .where(eq(media.id, allSettings.seo.ogMediaId))
      .limit(1);
    if (rows[0]) {
      ogMedia = toMediaRef(rows[0]);
    }
  }

  const tabs: LinkTab[] = SETTINGS_TABS.map((t) => ({
    href: `/admin/settings?tab=${t.key}`,
    label: t.label,
    active: currentTab === t.key,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage store commerce rules, support channels, metadata, notifications, and invoicing."
      />

      <LinkTabs tabs={tabs} />

      <div>
        {currentTab === "store" && (
          <StoreForm initialValues={allSettings.store} />
        )}
        {currentTab === "contact" && (
          <ContactForm
            initialContact={allSettings.contact}
            initialSocial={allSettings.social}
          />
        )}
        {currentTab === "seo" && (
          <SeoForm
            initialValues={allSettings.seo}
            initialOgMedia={ogMedia}
          />
        )}
        {currentTab === "notify" && (
          <NotifyForm initialValues={allSettings.notify} />
        )}
        {currentTab === "offers" && (
          <OffersForm
            initialKundali={allSettings.kundali}
            initialCourses={allSettings.courses}
          />
        )}
        {currentTab === "invoice" && (
          <InvoiceForm initialValues={allSettings.invoice} />
        )}
      </div>
    </div>
  );
}
