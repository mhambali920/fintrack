"use client";

import { Button } from "@base-ui/react/button";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type UiButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<UiButtonProps["variant"]>, string> = {
  primary:
    "gradient-primary text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:opacity-95 active:scale-[0.98]",
  secondary:
    "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] active:scale-[0.98]",
  outline:
    "bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700 active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<UiButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-5 py-3 text-base rounded-2xl gap-2.5 font-bold",
};

export function UiButton({
  className,
  variant = "secondary",
  size = "md",
  focusableWhenDisabled = true,
  ...props
}: UiButtonProps) {
  return (
    <Button
      {...props}
      focusableWhenDisabled={focusableWhenDisabled}
      className={(state) =>
        cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none",
          variantClasses[variant],
          sizeClasses[size],
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
