import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listCoursesAdmin } from "@/server/courses/admin";
import { getSetting } from "@/server/settings/queries";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";

export default async function AdminCoursesPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const [courses, coursesSetting] = await Promise.all([
    listCoursesAdmin(),
    getSetting("courses"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sadhana Courses"
        description="The six traditional sadhanas with personal diksha and weekly guidance from Sadhak Ji."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const fee = c.feeInr ?? coursesSetting.feeInr;
          const isCustomFee = c.feeInr != null;

          return (
            <div
              key={c.key}
              className="flex flex-col justify-between rounded-btn border border-s2 bg-cream p-5 shadow-sm transition-[border-color,box-shadow] hover:border-em7/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-g7 uppercase tracking-wider">
                    {c.slug}
                  </span>
                  <StatusBadge tone={c.visible ? "ok" : "muted"}>
                    {c.visible ? "Visible" : "Hidden"}
                  </StatusBadge>
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-[18px] font-semibold text-ink">
                    {c.nameEn}
                  </h3>
                  <p className="font-deva text-[13.5px] text-ink6">
                    {c.nameHi}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] text-ink6">
                  <span className="rounded bg-s1 px-2 py-0.5 font-medium">
                    Deity: <strong className="text-ink">{c.deity}</strong>
                  </span>
                  <span className="rounded bg-s1 px-2 py-0.5 font-medium">
                    {c.days} Days
                  </span>
                </div>

                <div className="mt-4 border-t border-s2 pt-3">
                  <span className="block font-sans text-[11px] font-medium text-ink6 uppercase">
                    Course Fee
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-[18px] font-semibold text-ink">
                      {fmt(fee)}
                    </span>
                    {isCustomFee ? (
                      <span className="text-[11px] text-g7 font-medium">
                        (Custom fee)
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink6">
                        (Default setting)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-s2 pt-3">
                <Link
                  href={`/admin/content/courses/${c.key}`}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-btn bg-em9 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 no-underline cursor-pointer"
                >
                  <span className="size-4">
                    <AdminIcon name="edit" />
                  </span>
                  <span>Edit Curriculum & Texts</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
