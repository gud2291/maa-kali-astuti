"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { LocListEditor } from "@/components/admin/products/LocListEditor";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { updateCourseAction } from "@/server/courses/admin-actions";
import { fmt } from "@/lib/core/format";
import type { CourseAdminRow } from "@/server/courses/admin";
import type { Loc } from "@/lib/domain/loc";

export type CourseFormProps = {
  course: CourseAdminRow;
  defaultFeeInr: number;
};

export function CourseForm({
  course,
  defaultFeeInr,
}: CourseFormProps): React.JSX.Element {
  const router = useRouter();

  const [nameEn, setNameEn] = useState(course.nameEn);
  const [nameHi, setNameHi] = useState(course.nameHi);
  const [deity, setDeity] = useState(course.deity);
  const [days, setDays] = useState(course.days);
  const [feeInr, setFeeInr] = useState<string>(
    course.feeInr != null ? String(course.feeInr) : "",
  );
  const [visible, setVisible] = useState(course.visible);

  const [essence, setEssence] = useState<Loc>(course.content.essence ?? { en: "", hi: "" });
  const [overview, setOverview] = useState<Loc>(course.content.overview ?? { en: "", hi: "" });
  const [niyam, setNiyam] = useState<Loc>(course.content.niyam ?? { en: "", hi: "" });
  const [attain, setAttain] = useState<Loc[]>(course.content.attain ?? []);

  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!nameEn.trim()) {
      toast.err("Course name is required");
      return;
    }

    setPending(true);
    try {
      const parsedFee = feeInr.trim() ? Number(feeInr.trim()) : null;
      const payload = {
        nameEn: nameEn.trim(),
        nameHi: nameHi.trim(),
        deity: deity.trim(),
        days: Number(days),
        feeInr: parsedFee,
        visible,
        content: {
          essence: { en: essence.en.trim(), hi: essence.hi.trim() },
          overview: { en: overview.en.trim(), hi: overview.hi.trim() },
          niyam: { en: niyam.en.trim(), hi: niyam.hi.trim() },
          attain: attain.map((a) => ({ en: a.en.trim(), hi: a.hi.trim() })),
        },
      };

      const res = await updateCourseAction(course.key, payload);
      if (res.ok) {
        toast.ok(`Course "${course.nameEn}" updated successfully`);
        router.push("/admin/content/courses");
        router.refresh();
      } else {
        toast.err(res.message ?? "Failed to update course");
      }
    } catch {
      toast.err("An error occurred while saving");
    } finally {
      setPending(false);
    }
  };

  const hiEmpty = !essence.hi || !overview.hi || !niyam.hi;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${course.nameEn}`}
        description={`Manage course curriculum, spiritual essence, attainment items, and fee for ${course.slug}.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/content/courses"
              className="flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-3.5 font-sans text-[13px] font-semibold text-ink shadow-sm hover:bg-s1 no-underline"
            >
              <span className="size-3.5">
                <AdminIcon name="chevL" />
              </span>
              <span>Back to Courses</span>
            </Link>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Basic Course Info */}
        <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
          <h2 className="font-display text-[16px] font-semibold text-ink border-b border-s2 pb-2">
            Course Essentials
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                Course Key (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={course.key}
                className="h-9 w-full rounded-field border border-s2 bg-s1/60 px-3 font-mono text-[13px] text-ink6"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                URL Slug (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={course.slug}
                className="h-9 w-full rounded-field border border-s2 bg-s1/60 px-3 font-mono text-[13px] text-ink6"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                English Name *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                Hindi Name *
              </label>
              <input
                type="text"
                required
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                Presiding Deity *
              </label>
              <input
                type="text"
                required
                value={deity}
                onChange={(e) => setDeity(e.target.value)}
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                Duration (Days) * (1–120)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                Course Fee (₹ INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={feeInr}
                  onChange={(e) => setFeeInr(e.target.value)}
                  placeholder={`Default: ₹${defaultFeeInr}`}
                  className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink6">
                Leave empty to use global course fee ({fmt(defaultFeeInr)}) from Settings.
              </p>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="size-4 rounded-field accent-em7"
                />
                <span className="font-sans text-[13px] font-medium text-ink">
                  Visible on Storefront
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Localized Texts: Essence, Overview, Niyam */}
        <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-s2 pb-2">
            <h2 className="font-display text-[16px] font-semibold text-ink">
              Spiritual Texts & Philosophy
            </h2>
          </div>

          <LocaleTabs
            hiEmpty={hiEmpty}
            en={
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    Essence (English)
                  </label>
                  <textarea
                    rows={3}
                    value={essence.en}
                    onChange={(e) =>
                      setEssence((prev) => ({ ...prev, en: e.target.value }))
                    }
                    placeholder="Short core essence of the sadhana..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    Overview (English)
                  </label>
                  <textarea
                    rows={4}
                    value={overview.en}
                    onChange={(e) =>
                      setOverview((prev) => ({ ...prev, en: e.target.value }))
                    }
                    placeholder="Detailed explanation of the course path..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    Specific Niyam (English)
                  </label>
                  <textarea
                    rows={3}
                    value={niyam.en}
                    onChange={(e) =>
                      setNiyam((prev) => ({ ...prev, en: e.target.value }))
                    }
                    placeholder="Rules, diet, vidhi requirements..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>
            }
            hi={
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    साधना का मूल भाव (हिंदी)
                  </label>
                  <textarea
                    rows={3}
                    value={essence.hi}
                    onChange={(e) =>
                      setEssence((prev) => ({ ...prev, hi: e.target.value }))
                    }
                    placeholder="साधना का संक्षिप्त मूल तत्व..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    विस्तृत परिचय (हिंदी)
                  </label>
                  <textarea
                    rows={4}
                    value={overview.hi}
                    onChange={(e) =>
                      setOverview((prev) => ({ ...prev, hi: e.target.value }))
                    }
                    placeholder="साधना मार्ग का संपूर्ण विवरण..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
                    विशिष्ट नियम (हिंदी)
                  </label>
                  <textarea
                    rows={3}
                    value={niyam.hi}
                    onChange={(e) =>
                      setNiyam((prev) => ({ ...prev, hi: e.target.value }))
                    }
                    placeholder="आहार, नियम, संकल्प विधि..."
                    className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>
            }
          />
        </div>

        {/* What You Attain (LocListEditor, up to 8 items) */}
        <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-s2 pb-2">
            <div>
              <h2 className="font-display text-[16px] font-semibold text-ink">
                What You Attain (Prāpti)
              </h2>
              <p className="font-sans text-[12px] text-ink6">
                Bullet attainments shown in the Sadhana milestones section (maximum 8)
              </p>
            </div>
            <span className="font-mono text-[12px] text-ink6">
              {attain.length}/8
            </span>
          </div>

          <LocListEditor
            value={attain}
            onChange={setAttain}
            label="Attainment"
            max={8}
            disabled={pending}
          />
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/content/courses"
            className="flex h-10 items-center justify-center rounded-btn border border-s2 bg-cream px-5 font-sans text-[13px] font-medium text-ink hover:bg-s1 no-underline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center justify-center gap-2 rounded-btn bg-em9 px-6 font-sans text-[14px] font-semibold text-em1 shadow-sm hover:bg-em7 disabled:opacity-50 cursor-pointer"
          >
            {pending && (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>Save Course</span>
          </button>
        </div>
      </form>
    </div>
  );
}
