"use client";

import { useTheme, type ThemePreference } from "@/components/theme-provider";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-1 shadow-[5px_5px_0_var(--retro-shadow)]">
      {options.map((option) => {
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`rounded-[14px] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition sm:px-4 ${
              active
                ? "bg-[var(--retro-accent)] text-[var(--retro-ink)]"
                : "text-[var(--retro-muted)] hover:text-[var(--retro-text)]"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}

      <span className="sr-only">Current theme: {resolvedTheme}</span>
    </div>
  );
}
