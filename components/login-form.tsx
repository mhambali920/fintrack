"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type AuthMode = "password" | "magic-link";

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
            emailRedirectTo: new URL(
              nextPath,
              window.location.origin,
            ).toString(),
          },
        });

        setMessage(
          error
            ? error.message
            : "Tautan masuk (magic link) telah dikirim ke inbox email kamu.",
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
            : "Akun baru telah dibuat. Silakan login kembali atau verifikasi email kamu.",
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
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Login
        </h2>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="inline-flex w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-shadow duration-200 select-none",
            mode === "password"
              ? "gradient-primary border border-gray-100 shadow-md dark:border-gray-800/30"
              : "text-muted hover:text-[var(--foreground)]",
          )}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>Password</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("magic-link")}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-shadow duration-200 select-none",
            mode === "magic-link"
              ? "gradient-primary border border-gray-100 shadow-md dark:border-gray-800/30"
              : "text-muted hover:text-[var(--foreground)]",
          )}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Magic Link</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-muted">
            Alamat Email <span className="text-rose-500">*</span>
          </span>
          <UiInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full"
            placeholder="nama@domain.com"
          />
        </label>

        {mode === "password" ? (
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-muted">
              Password <span className="text-rose-500">*</span>
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
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-xs text-muted">
            Mode Magic Link akan mengirimkan link sekali pakai ke inbox email
            kamu tanpa perlu password.
          </div>
        )}

        <UiButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full justify-center"
        >
          <span>
            {isPending
              ? "Memproses..."
              : mode === "magic-link"
                ? "Kirim Magic Link"
                : "Lanjutkan"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </UiButton>
      </form>

      {message ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs leading-relaxed text-muted shadow-sm">
          {message.includes("Gagal") || message.includes("Error") ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          )}
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}
