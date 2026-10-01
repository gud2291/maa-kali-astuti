import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getBookingAdmin } from "@/server/bookings/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { BookingDetail } from "@/components/admin/bookings/BookingDetail";
import { BookingActions } from "@/components/admin/bookings/BookingActions";
import { AdminIcon } from "@/components/admin/AdminIcon";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("bookings.view");
  const { id } = await params;
  const bookingId = parseInt(id, 10);

  if (isNaN(bookingId)) {
    notFound();
  }

  const booking = await getBookingAdmin(bookingId);
  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-ink6 hover:text-em7 no-underline mb-2"
        >
          <span className="size-4">
            <AdminIcon name="arrowL" />
          </span>
          <span>Back to Bookings</span>
        </Link>

        <PageHeader
          title={`Booking ${booking.ref}`}
          description={`Consultation appointment for ${booking.name} (${booking.serviceKey} · ${booking.mode}).`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Details, Birth profile, Palm photos */}
        <div className="lg:col-span-2 space-y-6">
          <BookingDetail booking={booking} />
        </div>

        {/* Right Column (1 col): Status changes, Meeting link, Reschedule, Report upload */}
        <div className="space-y-6">
          <BookingActions booking={booking} />
        </div>
      </div>
    </div>
  );
}
