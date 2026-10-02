import { requireAdminPage } from "@/server/auth/guards";
import { listTestimonialsAdmin } from "@/server/testimonials/admin";
import { TestimonialsManager } from "@/components/admin/content/TestimonialForm";

export default async function AdminTestimonialsPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const testimonials = await listTestimonialsAdmin();

  return <TestimonialsManager initialTestimonials={testimonials} />;
}
