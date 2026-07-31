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
          "w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition placeholder:text-[var(--retro-muted)] focus:border-[var(--retro-accent)]",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
