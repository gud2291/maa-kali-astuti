import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { AdminIcon } from "@/components/admin/AdminIcon";

export default function AdminNotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-s1 text-em7">
        <AdminIcon name="alert" className="size-7" />
      </div>
      <p className="font-sans text-[12px] font-bold uppercase tracking-widest text-g7">
        404 Error
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md font-sans text-[14.5px] text-ink6">
        The requested admin page does not exist or may have been relocated.
      </p>
      <div className="mt-6">
        <Link href="/admin" className={buttonClass("primary", "md")}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
