"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ArrowLeftRight, Tags } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UiButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: Tags },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLabel = useMemo(
    () => navItems.find((item) => isActivePath(pathname, item.href))?.label ?? "Dashboard",
    [pathname],
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen text-[var(--retro-text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start lg:px-6 lg:py-6">
        <aside className="retro-panel hidden flex-col rounded-[24px] p-4 lg:sticky lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto">
          <div className="relative z-10 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--retro-accent)]">
              FinTrack
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm leading-6 text-[var(--retro-muted)]">
              {userEmail}
            </p>
          </div>

          <nav className="relative z-10 mt-8 flex flex-1 flex-col gap-3">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[18px] border-2 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_var(--retro-shadow)]",
                    active
                      ? "border-[var(--retro-border)] bg-[var(--retro-accent)] !text-[var(--retro-ink)]"
                      : "border-[var(--retro-border)] bg-[var(--retro-surface)] text-[var(--retro-text)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 space-y-3">
            <SignOutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center justify-between rounded-[20px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] px-3 py-2.5 shadow-[6px_6px_0_var(--retro-shadow)] sm:px-4 sm:py-3 lg:hidden">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--retro-accent)] sm:text-[10px] sm:tracking-[0.3em]">
                FinTrack
              </p>
              <h1 className="truncate text-base font-bold text-[var(--retro-text)] sm:text-lg">
                {activeLabel}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UiButton
                type="button"
                variant="secondary"
                className="h-11 w-11 rounded-full p-0"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </UiButton>
            </div>
          </div>

          <main className="retro-panel flex min-h-[calc(100vh-1.5rem)] flex-col rounded-[24px] p-3 sm:p-4 lg:min-h-[calc(100dvh-3rem)] lg:p-8">
            <header className="relative z-10 flex flex-col gap-2.5 border-b-2 border-[var(--retro-border)] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
                  Protected area
                </p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Manage your finances
                </h2>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="w-fit rounded-full border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--retro-accent)] sm:px-4 sm:py-2 sm:text-sm sm:tracking-[0.15em]">
                  Signed in as {userEmail}
                </div>
              </div>
            </header>

            <div className="relative z-10 flex-1 py-4 sm:py-6">{children}</div>
          </main>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-[86vw] max-w-[320px] transform border-r-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[12px_0_0_var(--retro-shadow)] transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--retro-accent)]">
              FinTrack
            </p>
            <h2 className="text-xl font-bold">Menu</h2>
            <p className="text-sm leading-6 text-[var(--retro-muted)]">
              {userEmail}
            </p>
          </div>

          <UiButton
            type="button"
            variant="secondary"
            className="h-11 w-11 rounded-full p-0"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </UiButton>
        </div>

        <nav className="mt-6 space-y-2.5">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] border-2 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                  active
                    ? "border-[var(--retro-border)] bg-[var(--retro-accent)] !text-[var(--retro-ink)]"
                    : "border-[var(--retro-border)] bg-[var(--retro-surface)] text-[var(--retro-text)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4">
          <SignOutButton />
        </div>
      </aside>
    </div>
  );
}
