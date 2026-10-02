import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getCourseAdmin } from "@/server/courses/admin";
import { getSetting } from "@/server/settings/queries";
import { CourseForm } from "@/components/admin/content/CourseForm";
import { COURSE_KEYS, type CourseKey } from "@/lib/domain/enums";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const { key } = await params;

  if (!COURSE_KEYS.includes(key as CourseKey)) {
    notFound();
  }

  const [course, coursesSetting] = await Promise.all([
    getCourseAdmin(key as CourseKey),
    getSetting("courses"),
  ]);

  return <CourseForm course={course} defaultFeeInr={coursesSetting.feeInr} />;
}
