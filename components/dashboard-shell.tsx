"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Plus,
  PieChart,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UiButton } from "@/components/ui/button";
import { TransactionModal } from "@/components/transaction-modal";
import type { CategoryRecord } from "@/lib/finance";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analisis", icon: PieChart },
  { href: "/categories", label: "Kategori", icon: Tags },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getUserInitials(email: string) {
  if (!email) return "FT";
  const namePart = email.split("@")[0];
  return namePart.slice(0, 2).toUpperCase();
}

export function DashboardShell({
  userEmail,
  children,
  initialCategories = [],
}: {
  userEmail: string;
  children: ReactNode;
  initialCategories?: CategoryRecord[];
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeLabel = useMemo(
    () =>
      navItems.find((item) => isActivePath(pathname, item.href))?.label ??
      "Dashboard",
    [pathname],
  );

  const userInitials = useMemo(() => getUserInitials(userEmail), [userEmail]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen text-foreground pb-24 lg:pb-0 bg-background">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="glass-panel hidden flex-col justify-between rounded-3xl p-5 lg:sticky lg:top-6 lg:flex lg:h-[calc(100dvh-3rem)]">
          <div className="space-y-6">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group px-2 py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-card text-gray-800 shadow-md group-hover:scale-105 transition-transform duration-200">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  FinTrack
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-muted font-medium">
                  AI Pro Workspace
                </span>
              </div>
            </Link>

            {/* Navigation Items */}
            <nav className="flex flex-col gap-1.5 pt-2">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      active
                        ? "gradient-card text-gray-800 font-bold shadow-md"
                        : "text-muted] hover:text-foreground hover:bg-(--surface-hover)",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                          active ? "text-gray-800" : "text-muted",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {active && (
                      <ChevronRight className="h-4 w-4 text-gray-700" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Footer Controls */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 border border-[var(--border)] shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-card text-gray-800 font-bold text-xs shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {userEmail}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Sesi Aktif
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 w-full">
              <ThemeToggle
                showLabel={false}
                className="w-full justify-around"
              />
            </div>

            <SignOutButton />
          </div>
        </aside>

        {/* Main Content Area & Mobile Top Navbar */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Mobile Header Bar */}
          <header className="glass-panel sticky top-3 z-40 flex items-center justify-between rounded-2xl px-4 py-3 shadow-md lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-card text-gray-800 shadow-sm">
                <Wallet className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                  FinTrack AI
                </p>
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  {activeLabel}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UiButton
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5 text-foreground" />
              </UiButton>
            </div>
          </header>

          {/* Page Container */}
          <main className="glass-panel min-h-[calc(100vh-6rem)] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[100] flex w-[85vw] max-w-[300px] flex-col justify-between border-r border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-card text-gray-800 shadow-sm">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold text-foreground">
                  FinTrack
                </span>
                <p className="text-[10px] text-[var(--muted)]">
                  Navigasi Utama
                </p>
              </div>
            </div>

            <UiButton
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </UiButton>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 border border-[var(--border)] shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-card text-gray-800 font-bold text-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {userEmail}
              </p>
              <p className="text-[10px] text-[var(--muted)]">Akun Aktif</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "gradient-card text-gray-800 font-bold shadow-md"
                      : "text-[var(--muted)] hover:text-foreground hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="h-4 w-4 text-gray-700" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <SignOutButton />
        </div>
      </aside>

      {/* Reference HTML Bottom Nav Bar with Central FAB + Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-[var(--border)] pb-safe pt-2 px-6 flex justify-between items-center h-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-40 lg:hidden">
        {/* Beranda Link */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 w-16 transition-colors",
            pathname === "/"
              ? "text-teal-600 dark:text-teal-400 font-semibold"
              : "text-gray-400 hover:text-teal-600 font-medium",
          )}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px]">Beranda</span>
        </Link>

        {/* Central FAB Spacer */}
        <div className="w-16"></div>

        {/* Analisis Link */}
        <Link
          href="/analytics"
          className={cn(
            "flex flex-col items-center gap-1 w-16 transition-colors",
            pathname.startsWith("/analytics")
              ? "text-teal-600 dark:text-teal-400 font-semibold"
              : "text-gray-400 hover:text-teal-600 font-medium",
          )}
        >
          <PieChart className="w-6 h-6" />
          <span className="text-[10px]">Analisis</span>
        </Link>
      </div>

      {/* Reference HTML Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 gradient-card text-gray-800 rounded-full w-14 h-14 flex items-center justify-center shadow-[0_10px_25px_rgba(163,228,215,0.6)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 z-50 border-4 border-[#F8F9FA] dark:border-gray-900 cursor-pointer lg:hidden"
        title="Catat Transaksi Baru"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Transaction Modal trigger */}
      <TransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategories={initialCategories}
      />
    </div>
  );
}
