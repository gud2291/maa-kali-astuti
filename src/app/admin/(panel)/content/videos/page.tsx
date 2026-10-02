import { requireAdminPage } from "@/server/auth/guards";
import { listVideosAdmin } from "@/server/videos/admin";
import { getSetting } from "@/server/settings/queries";
import { VideosManager } from "@/components/admin/content/VideoForm";

export default async function AdminVideosPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const [allVideos, videoSetting] = await Promise.all([
    listVideosAdmin(),
    getSetting("videos"),
  ]);

  return (
    <VideosManager
      initialVideos={allVideos}
      categories={videoSetting.categories}
    />
  );
}
