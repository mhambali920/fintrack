import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllCategories, type CategoryRecord } from "@/lib/finance";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let categories: CategoryRecord[] = [];
  try {
    categories = await getAllCategories();
  } catch {
    categories = [];
  }

  return (
    <DashboardShell
      userEmail={user.email ?? "Signed in user"}
      initialCategories={categories}
    >
      {children}
    </DashboardShell>
  );
}
