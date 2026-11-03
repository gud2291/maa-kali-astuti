"use client";

import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { updateSettingAction } from "@/server/settings/admin-actions";
import type { SettingsMap } from "@/lib/validation/settings";

const locSchema = z.object({
  en: z.string().max(4000),
  hi: z.string().max(4000),
});

const contactFormSchema = z.object({
  phoneDisplay: z.string().min(1, "Phone display is required").max(30),
  phoneTel: z.string().min(1, "Tel link is required").max(20),
  whatsapp: z.string().min(1, "WhatsApp number is required").max(20),
  email: z.string().min(1, "Email is required").email("Valid email required").max(120),
  addressEn: z.string().max(4000).default(""),
  addressHi: z.string().max(4000).default(""),
  hoursEn: z.string().max(4000).default(""),
  hoursHi: z.string().max(4000).default(""),
});

const socialFormSchema = z.object({
  youtube: z.string().max(200).nullable().optional(),
  instagram: z.string().max(200).nullable().optional(),
  facebook: z.string().max(200).nullable().optional(),
  whatsappChannel: z.string().max(200).nullable().optional(),
  youtubeHandle: z.string().max(100).default(""),
  youtubeSubsEn: z.string().max(4000).default(""),
  youtubeSubsHi: z.string().max(4000).default(""),
});

export type ContactFormProps = {
  initialContact: SettingsMap["contact"];
  initialSocial: SettingsMap["social"];
};

export function ContactForm({
  initialContact,
  initialSocial,
}: ContactFormProps): React.JSX.Element {
  /* ── Contact Section Form ────────────────────────────────────────── */
  const contactForm = useActionForm({
    schema: contactFormSchema,
    defaultValues: {
      phoneDisplay: initialContact.phoneDisplay,
      phoneTel: initialContact.phoneTel,
      whatsapp: initialContact.whatsapp,
      email: initialContact.email,
      addressEn: initialContact.address.en,
      addressHi: initialContact.address.hi,
      hoursEn: initialContact.hours.en,
      hoursHi: initialContact.hours.hi,
    },
    action: async (values) => {
      return await updateSettingAction({
        key: "contact",
        value: {
          phoneDisplay: values.phoneDisplay,
          phoneTel: values.phoneTel,
          whatsapp: values.whatsapp,
          email: values.email,
          address: { en: values.addressEn, hi: values.addressHi },
          hours: { en: values.hoursEn, hi: values.hoursHi },
        },
      });
    },
    successMessage: "Contact settings saved successfully",
  });

  /* ── Social Section Form ─────────────────────────────────────────── */
  const socialForm = useActionForm({
    schema: socialFormSchema,
    defaultValues: {
      youtube: initialSocial.youtube ?? "",
      instagram: initialSocial.instagram ?? "",
      facebook: initialSocial.facebook ?? "",
      whatsappChannel: initialSocial.whatsappChannel ?? "",
      youtubeHandle: initialSocial.youtubeHandle,
      youtubeSubsEn: initialSocial.youtubeSubs.en,
      youtubeSubsHi: initialSocial.youtubeSubs.hi,
    },
    action: async (values) => {
      const clean = (s: string | null | undefined): string | null =>
        s && s.trim() !== "" ? s.trim() : null;

      return await updateSettingAction({
        key: "social",
        value: {
          youtube: clean(values.youtube),
          instagram: clean(values.instagram),
          facebook: clean(values.facebook),
          whatsappChannel: clean(values.whatsappChannel),
          youtubeHandle: values.youtubeHandle,
          youtubeSubs: { en: values.youtubeSubsEn, hi: values.youtubeSubsHi },
        },
      });
    },
    successMessage: "Social media settings saved successfully",
  });

  const contactDirty = contactForm.form.formState.isDirty;
  const socialDirty = socialForm.form.formState.isDirty;
  useLeaveGuard(contactDirty || socialDirty);

  return (
    <div className="space-y-10 pb-24">
      {/* ── Contact Info Form ───────────────────────────────────────── */}
      <form onSubmit={contactForm.submit} className="space-y-6">
        <Card>
          <CardHeader
            title="Store Contact Information"
            description="Official support telephone, WhatsApp helpline, and email addresses shown to customers."
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="phoneDisplay"
                control={contactForm.form.control}
                label="Phone Display Text"
                hint="Formatted for readability (e.g. +91 93553 19051)"
                required
              />
              <TextField
                name="phoneTel"
                control={contactForm.form.control}
                label="Phone Dial URL"
                hint="Standard tel format (e.g. +919355319051)"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="whatsapp"
                control={contactForm.form.control}
                label="WhatsApp Number"
                hint="Without + or spaces (e.g. 919355319051)"
                required
              />
              <TextField
                name="email"
                control={contactForm.form.control}
                label="Official Email Address"
                hint="Customer care address (e.g. support@sadhakpawanpandey.com)"
                required
              />
            </div>

            <div className="pt-2 border-t border-s2">
              <p className="text-[13px] font-semibold text-ink mb-2">Operating Hours</p>
              <LocaleTabs
                hiEmpty={!contactForm.form.watch("hoursHi")}
                en={
                  <TextField
                    name="hoursEn"
                    control={contactForm.form.control}
                    label="Working Hours (English)"
                    hint="e.g. Mon–Sat · 10:00–19:00 IST"
                  />
                }
                hi={
                  <TextField
                    name="hoursHi"
                    control={contactForm.form.control}
                    label="कार्य समय (हिंदी)"
                    hint="उदा. सोम–शनि · 10:00–19:00 IST"
                  />
                }
              />
            </div>

            <div className="pt-2 border-t border-s2">
              <p className="text-[13px] font-semibold text-ink mb-2">Physical Ashram / Office Address</p>
              <LocaleTabs
                hiEmpty={!contactForm.form.watch("addressHi")}
                en={
                  <TextArea
                    name="addressEn"
                    control={contactForm.form.control}
                    label="Address (English)"
                    rows={2}
                  />
                }
                hi={
                  <TextArea
                    name="addressHi"
                    control={contactForm.form.control}
                    label="पता (हिंदी)"
                    rows={2}
                  />
                }
              />
            </div>
          </CardBody>
        </Card>

        <FormBar
          pending={contactForm.pending}
          dirty={contactDirty}
          cancelHref="/admin/settings?tab=contact"
          saveLabel="Save Contact Info"
        />
      </form>

      {/* ── Social Profiles Form ────────────────────────────────────── */}
      <form onSubmit={socialForm.submit} className="space-y-6">
        <Card>
          <CardHeader
            title="Social Media Channels"
            description="YouTube channel details, subscriber count display, and social profile links."
          />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                name="youtubeHandle"
                control={socialForm.form.control}
                label="YouTube Handle"
                hint="e.g. @SadhakPawanPandey"
                required
              />
              <TextField
                name="youtube"
                control={socialForm.form.control}
                label="YouTube Channel URL"
                hint="Full channel link"
              />
            </div>

            <div className="pt-2 border-t border-s2">
              <p className="text-[13px] font-semibold text-ink mb-2">YouTube Subscriber Count Badge</p>
              <LocaleTabs
                hiEmpty={!socialForm.form.watch("youtubeSubsHi")}
                en={
                  <TextField
                    name="youtubeSubsEn"
                    control={socialForm.form.control}
                    label="Subscribers Display (English)"
                    hint="e.g. 1.2 lakh subscribers"
                  />
                }
                hi={
                  <TextField
                    name="youtubeSubsHi"
                    control={socialForm.form.control}
                    label="सब्सक्राइबर संख्या (हिंदी)"
                    hint="उदा. 1.2 लाख सब्सक्राइबर"
                  />
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-s2">
              <TextField
                name="instagram"
                control={socialForm.form.control}
                label="Instagram Profile URL"
              />
              <TextField
                name="facebook"
                control={socialForm.form.control}
                label="Facebook Page URL"
              />
              <TextField
                name="whatsappChannel"
                control={socialForm.form.control}
                label="WhatsApp Channel URL"
              />
            </div>
          </CardBody>
        </Card>

        <FormBar
          pending={socialForm.pending}
          dirty={socialDirty}
          cancelHref="/admin/settings?tab=contact"
          saveLabel="Save Social Profiles"
        />
      </form>
    </div>
  );
}
