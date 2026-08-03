"use client";

import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { UiButton } from "@/components/ui/button";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-1 shadow-[5px_5px_0_var(--retro-shadow)]">
      {options.map((option) => {
        const active = theme === option.value;

        return (
          <UiButton
            key={option.value}
            type="button"
            variant={active ? "primary" : "ghost"}
            onClick={() => setTheme(option.value)}
            className="rounded-[12px] px-2.5 py-1.5 text-[10px] shadow-none hover:shadow-none sm:rounded-[14px] sm:px-3.5 sm:py-2 sm:text-xs"
            aria-pressed={active}
          >
            {option.label}
          </UiButton>
        );
      })}

      <span className="sr-only">Current theme: {resolvedTheme}</span>
    </div>
  );
}
