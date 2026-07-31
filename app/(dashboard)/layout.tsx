import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
];

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

  return (
    <div className="min-h-screen text-[var(--retro-text)]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="retro-panel flex flex-col rounded-[26px] p-5">
          <div className="relative z-10 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--retro-accent)]">
              FinTrack
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm leading-6 text-[var(--retro-muted)]">
              {user.email ?? "Signed in user"}
            </p>
          </div>

          <nav className="relative z-10 mt-8 flex flex-1 flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--retro-text)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_var(--retro-shadow)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4">
            <SignOutButton />
          </div>
        </aside>

        <main className="retro-panel flex min-h-[calc(100vh-2rem)] flex-col rounded-[26px] p-4 lg:p-8">
          <header className="relative z-10 flex flex-col gap-3 border-b-2 border-[var(--retro-border)] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--retro-accent)]">
                Protected area
              </p>
              <h2 className="mt-1 text-3xl font-bold">Manage your finances</h2>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ThemeToggle />
              <div className="w-fit rounded-full border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-2 text-sm uppercase tracking-[0.15em] text-[var(--retro-accent)]">
                Signed in as {user.email ?? "user"}
              </div>
            </div>
          </header>

          <div className="relative z-10 flex-1 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
