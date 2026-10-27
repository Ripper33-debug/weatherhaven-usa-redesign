import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth-admin";
import { createClient } from "@/lib/supabase/server";

/** Defense in depth: require signed-in admin operator for all /admin routes. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  return children;
}
