import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Login | FinTrack",
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
    <main className="min-h-screen px-3 py-4 text-[var(--retro-text)] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto mb-3 flex w-full max-w-6xl justify-end sm:mb-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto grid min-h-[calc(90vh-3rem)] w-full max-w-6xl items-stretch gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="retro-panel overflow-hidden rounded-[24px] p-4 sm:rounded-[28px] sm:p-6">
          <div className="relative z-10 flex h-full flex-col gap-6 sm:gap-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2 text-[10px] uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.32em]">
              <span className="h-2 w-2 rounded-full bg-[var(--retro-accent-strong)] shadow-[0_0_12px_rgba(255,111,97,0.8)]" />
              FinTrack Terminal
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="max-w-xl text-3xl font-bold leading-[0.95] sm:text-5xl lg:text-6xl">
                Your financial workspace
              </h1>
            </div>

          </div>
        </section>

        <section className="retro-panel retro-screen overflow-hidden rounded-[24px] p-4 sm:rounded-[28px] sm:p-6">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
