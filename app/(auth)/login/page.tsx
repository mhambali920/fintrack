import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Login | FinTrack",
  description: "Masuk ke FinTrack untuk mengelola keuangan pribadi Anda.",
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
    <main className="flex min-h-screen flex-col px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-6 w-6" />
          <span className="text-xl font-semibold tracking-tight">FinTrack</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Grid */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 py-12 lg:grid-cols-12">
        {/* Left Hero Section */}
        <section className="space-y-6 lg:col-span-7">
          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Kelola keuangan Anda <br className="hidden lg:block" />
            dengan lebih cerdas.
          </h1>
          <p className="text-muted max-w-lg text-base leading-relaxed">
            Pantau setiap pemasukan dan pengeluaran secara real-time. Platform
            yang aman dan terorganisir untuk memegang kendali penuh atas
            finansial Anda.
          </p>
        </section>

        {/* Right Auth Form */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:p-8 dark:border-gray-800">
            <LoginForm />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-muted mx-auto w-full max-w-6xl py-6 text-sm">
        &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
      </footer>
    </main>
  );
}
