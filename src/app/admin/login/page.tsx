import { redirect } from "next/navigation";
import { getAdmin } from "@/server/auth/guards";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const admin = await getAdmin();
  if (admin) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const nextParam = typeof sp.next === "string" ? sp.next : "/admin";

  return <AdminLogin next={nextParam} />;
}
