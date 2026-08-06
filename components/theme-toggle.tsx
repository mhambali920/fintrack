"use client";

import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";

const options: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({
  showLabel = true,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 backdrop-blur-md",
        className,
      )}
    >
      {options.map((option) => {
        const active = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer select-none",
              active
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-muted hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
            )}
            aria-pressed={active}
            title={`Switch to ${option.label} theme`}
          >
            <Icon className="h-3.5 w-3.5" />
            {showLabel && (
              <span className="hidden sm:inline">{option.label}</span>
            )}
          </button>
        );
      })}

      <span className="sr-only">Current theme: {resolvedTheme}</span>
    </div>
  );
}
