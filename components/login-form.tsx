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
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#ffcf82]">
          Sign in
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[#fff0ca]">
          Login or create an account
        </h2>
      </div>

      <div className="inline-flex rounded-[18px] border-2 border-[#7f6241] bg-[#211710] p-1 shadow-[5px_5px_0_rgba(0,0,0,0.25)]">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`rounded-[14px] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] transition ${
            mode === "password"
              ? "bg-[#ffb84d] text-[#20160f]"
              : "text-[#d9c4a0] hover:text-[#fff0ca]"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic-link")}
          className={`rounded-[14px] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] transition ${
            mode === "magic-link"
              ? "bg-[#ffb84d] text-[#20160f]"
              : "text-[#d9c4a0] hover:text-[#fff0ca]"
          }`}
        >
          Magic Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#ffcf82]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-[16px] border-2 border-[#7f6241] bg-[#160f0a] px-4 py-3 text-[#fff0ca] outline-none transition placeholder:text-[#876f4e] focus:border-[#ffb84d]"
            placeholder="nama@contoh.com"
          />
        </label>

        {mode === "password" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#ffcf82]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-[16px] border-2 border-[#7f6241] bg-[#160f0a] px-4 py-3 text-[#fff0ca] outline-none transition placeholder:text-[#876f4e] focus:border-[#ffb84d]"
              placeholder="Masukkan password"
            />
          </label>
        ) : (
          <p className="rounded-[16px] border-2 border-[#7f6241] bg-[#241911] px-4 py-3 text-sm leading-6 text-[#d9c4a0]">
            Mode ini akan mengirim tautan masuk ke email kamu. Pastikan alamat
            email sudah benar.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[16px] border-2 border-[#6b4f31] bg-[#ffb84d] px-4 py-3 font-bold uppercase tracking-[0.14em] text-[#20160f] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Processing..." : mode === "magic-link" ? "Send link" : "Continue"}
        </button>
      </form>

      {message ? (
        <p className="rounded-[16px] border-2 border-[#7f6241] bg-[#1b130d] px-4 py-3 text-sm leading-6 text-[#d9c4a0]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
