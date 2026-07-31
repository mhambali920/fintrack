"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UiButton } from "@/components/ui/button";

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
    <UiButton
      type="button"
      variant="secondary"
      onClick={handleSignOut}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </UiButton>
  );
}
