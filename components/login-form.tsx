"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";

type AuthMode = "magic-link" | "password";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/") ? next : "/";
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      if (mode === "magic-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: new URL(nextPath, window.location.origin).toString(),
          },
        });

        setMessage(
          error
            ? error.message
            : "Magic link sudah dikirim. Cek inbox email kamu.",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        setMessage(
          signUpError
            ? signUpError.message
            : "Akun baru dibuat. Coba login lagi, atau cek email jika perlu verifikasi.",
        );
        return;
      }

      router.replace(nextPath);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--retro-accent)]">
          Sign in
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--retro-text)]">
          Login or create an account
        </h2>
      </div>

      <div className="inline-flex rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-1 shadow-[5px_5px_0_var(--retro-shadow)]">
        <UiButton
          type="button"
          variant={mode === "password" ? "primary" : "ghost"}
          className="rounded-[14px] px-4 py-2 text-sm shadow-none hover:shadow-none"
          onClick={() => setMode("password")}
        >
          Password
        </UiButton>
        <UiButton
          type="button"
          variant={mode === "magic-link" ? "primary" : "ghost"}
          className="rounded-[14px] px-4 py-2 text-sm shadow-none hover:shadow-none"
          onClick={() => setMode("magic-link")}
        >
          Magic Link
        </UiButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
            Email
          </span>
          <UiInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full"
            placeholder="nama@contoh.com"
          />
        </label>

        {mode === "password" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Password
            </span>
            <UiInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full"
              placeholder="Masukkan password"
            />
          </label>
        ) : (
          <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm leading-6 text-[var(--retro-muted)]">
            Mode ini akan mengirim tautan masuk ke email kamu. Pastikan alamat
            email sudah benar.
          </p>
        )}

        <UiButton
          type="submit"
          variant="primary"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Processing..." : mode === "magic-link" ? "Send link" : "Continue"}
        </UiButton>
      </form>

      {message ? (
        <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm leading-6 text-[var(--retro-muted)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
