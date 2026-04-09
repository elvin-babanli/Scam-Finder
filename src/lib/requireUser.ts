import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

