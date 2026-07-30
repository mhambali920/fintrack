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
    <main className="min-h-screen px-4 py-6 text-[var(--retro-text)] sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex w-full max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="retro-panel overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-2 text-xs uppercase tracking-[0.32em] text-[var(--retro-accent)]">
              <span className="h-2 w-2 rounded-full bg-[var(--retro-accent-strong)] shadow-[0_0_12px_rgba(255,111,97,0.8)]" />
              FinTrack Terminal
            </div>

            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--retro-accent)]">
                Secure sign-in
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-[0.95] sm:text-5xl lg:text-6xl">
                Your financial workspace, secured and ready.
              </h1>
            </div>

          </div>
        </section>

        <section className="retro-panel retro-screen overflow-hidden rounded-[28px] p-5 sm:p-6">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
