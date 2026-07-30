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
      className="w-full rounded-[16px] border-2 border-[#7f6241] bg-[#2a1d12] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#fff0ca] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
