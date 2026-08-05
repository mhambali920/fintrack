"use client";

import { Input } from "@base-ui/react/input";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type UiInputProps = ComponentPropsWithoutRef<typeof Input>;

export function UiInput({ className, ...props }: UiInputProps) {
  return (
    <Input
      {...props}
      className={(state) =>
        cn(
          "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition duration-200 placeholder:text-[var(--muted)] hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
