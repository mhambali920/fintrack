"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
