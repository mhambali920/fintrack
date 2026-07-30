"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        <button
          type="button"
          onClick={() => setMode("password")}
            className={`rounded-[14px] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] transition ${
            mode === "password"
              ? "bg-[var(--retro-accent)] text-[var(--retro-ink)]"
              : "text-[var(--retro-muted)] hover:text-[var(--retro-text)]"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic-link")}
            className={`rounded-[14px] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] transition ${
            mode === "magic-link"
              ? "bg-[var(--retro-accent)] text-[var(--retro-ink)]"
              : "text-[var(--retro-muted)] hover:text-[var(--retro-text)]"
          }`}
        >
          Magic Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition placeholder:text-[var(--retro-muted)] focus:border-[var(--retro-accent)]"
            placeholder="nama@contoh.com"
          />
        </label>

        {mode === "password" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition placeholder:text-[var(--retro-muted)] focus:border-[var(--retro-accent)]"
              placeholder="Masukkan password"
            />
          </label>
        ) : (
          <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm leading-6 text-[var(--retro-muted)]">
            Mode ini akan mengirim tautan masuk ke email kamu. Pastikan alamat
            email sudah benar.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] px-4 py-3 font-bold uppercase tracking-[0.14em] text-[var(--retro-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Processing..." : mode === "magic-link" ? "Send link" : "Continue"}
        </button>
      </form>

      {message ? (
        <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm leading-6 text-[var(--retro-muted)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
