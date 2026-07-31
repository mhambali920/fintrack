"use client";

import { Button } from "@base-ui/react/button";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type UiButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<UiButtonProps["variant"]>, string> = {
  primary:
    "border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] text-[var(--retro-ink)]",
  secondary:
    "border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] text-[var(--retro-text)]",
  ghost:
    "border-2 border-transparent bg-transparent text-[var(--retro-text)] shadow-none",
  danger:
    "border-2 border-[var(--retro-border)] bg-[var(--retro-accent-strong)] text-[var(--retro-ink)]",
};

export function UiButton({
  className,
  variant = "secondary",
  focusableWhenDisabled = true,
  ...props
}: UiButtonProps) {
  return (
    <Button
      {...props}
      focusableWhenDisabled={focusableWhenDisabled}
      className={(state) =>
        cn(
          "inline-flex items-center justify-center rounded-[16px] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)] disabled:cursor-not-allowed disabled:opacity-70",
          variantClasses[variant],
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
