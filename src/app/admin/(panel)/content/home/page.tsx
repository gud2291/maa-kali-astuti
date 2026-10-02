import { requireAdminPage } from "@/server/auth/guards";
import { getHomeAdmin } from "@/server/home/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Tabs } from "@/components/admin/ui/Tabs";
import { SectionToggles } from "@/components/admin/home/SectionToggles";
import { HeroSlidesForm } from "@/components/admin/home/HeroSlidesForm";
import { AnnouncementForm } from "@/components/admin/home/AnnouncementForm";

export default async function AdminHomePage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const data = await getHomeAdmin();

  const tabItems = [
    {
      value: "sections",
      label: "Sections (17)",
      content: <SectionToggles initialSections={data.sections} />,
    },
    {
      value: "hero",
      label: "Hero Slides",
      content: (
        <HeroSlidesForm
          initialHero={data.hero}
          initialMedia={data.heroMedia}
        />
      ),
    },
    {
      value: "announcement",
      label: "Announcement Bar",
      content: (
        <AnnouncementForm initialAnnouncement={data.announcement} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home & Site Content"
        description="Manage home page section visibility, hero slider copy and banners, and top announcement messages."
      />

      <Tabs items={tabItems} defaultValue="sections" />
    </div>
  );
}
