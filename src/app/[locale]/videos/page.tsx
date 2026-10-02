import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubscribeBand } from "@/components/sections/videos/SubscribeBand";
import { VideosLibrary } from "@/components/sections/videos/VideosLibrary";
import { getVideos } from "@/lib/api/content";
import { SHORT_THUMB_SVG, VIDEO_THUMB_SVG } from "@/lib/art/thumbs";
import { pageMeta } from "@/lib/seo/meta";
import { video as videoSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* Videos (design/Videos.dc.html): featured facade player (#player) → library tabs + grid →
   Shorts row / rail + viewer → emerald subscribe band. `?c=<cat>&v=<id>` is read on the client
   (static page). Chrome: active "videos" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videos.meta" });
  return pageMeta({
    locale,
    path: "/videos",
    title: t("title"),
    description: t("description"),
  });
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await getVideos(locale);
  const thumbs = Object.fromEntries(
    data.videos.map((v) => [v.id, VIDEO_THUMB_SVG[v.id as keyof typeof VIDEO_THUMB_SVG] ?? ""]),
  );
  const shortThumbs = Object.fromEntries(
    data.shorts.map((s) => [s.id, SHORT_THUMB_SVG[s.id as keyof typeof SHORT_THUMB_SVG] ?? ""]),
  );

  const realYtVideos = data.videos.filter(
    (v) => v.yt && !v.yt.startsWith("placeholder") && !v.yt.startsWith("v-")
  );
  const videoSchemas = realYtVideos.map((v) => {
    const isHi = locale === "hi";
    const title = isHi ? v.hi.join(" ") : v.en;
    return videoSchema({
      title,
      description: v.desc,
      thumbnailUrl: `https://img.youtube.com/vi/${v.yt}/hqdefault.jpg`,
      uploadDate: new Date(v.date).toISOString().slice(0, 10),
      contentUrl: `https://www.youtube.com/watch?v=${v.yt}`,
      embedUrl: `https://www.youtube.com/embed/${v.yt}`,
    });
  });

  return (
    <>
      {videoSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <VideosLibrary
        cats={data.cats}
        videos={data.videos}
        shorts={data.shorts}
        subs={data.subs}
        thumbs={thumbs}
        shortThumbs={shortThumbs}
      />
      <SubscribeBand subs={data.subs} />
    </>
  );
}
