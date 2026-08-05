import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wallet, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Login | FinTrack Workspace",
  description: "Masuk ke FinTrack untuk mengelola transaksi dan keuangan pribadi.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-indigo-500/25">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              FinTrack
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[var(--muted)] font-medium">
              Personal Finance
            </span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Content Grid */}
      <div className="mx-auto grid my-auto py-8 w-full max-w-6xl items-center gap-8 lg:grid-cols-12">
        {/* Left Hero Feature Showcase */}
        <section className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            <Zap className="h-3.5 w-3.5" />
            <span>Workspace Keuangan Modern & Responsif</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[var(--foreground)] leading-[1.1]">
              Kelola uang kamu lebih{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                cerdas & teratur.
              </span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Catat setiap pemasukan, pengeluaran, serta kategori keuanganmu kapan saja dan di mana saja melalui tampilan mobile & desktop yang sleek.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Ringkasan Real-Time</h3>
              <p className="text-xs text-[var(--muted)]">Pantau total saldo, pemasukan, dan pengeluaran bulan ini secara terorganisir.</p>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Keamanan RLS</h3>
              <p className="text-xs text-[var(--muted)]">Seluruh data keuangan tersimpan aman terpisah per akun user via Supabase RLS.</p>
            </div>
          </div>
        </section>

        {/* Right Auth Form */}
        <section className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]">
            <LoginForm />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl text-center py-4 text-xs text-[var(--muted)]">
        &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
      </footer>
    </main>
  );
}
