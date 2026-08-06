"use client";

import * as React from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

type YearPickerProps = {
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (year: string) => void;
  className?: string;
};

export function YearPicker({
  name = "year",
  label = "Pilih Tahun",
  value,
  defaultValue,
  onValueChange,
  className,
}: YearPickerProps) {
  const currentYear = new Date().getFullYear();
  const initialYear = Number.parseInt(
    value || defaultValue || String(currentYear),
    10,
  );
  const validInitial = Number.isFinite(initialYear) ? initialYear : currentYear;

  const [internalValue, setInternalValue] =
    React.useState<number>(validInitial);
  const [open, setOpen] = React.useState(false);
  const [decadeStart, setDecadeStart] = React.useState<number>(
    Math.floor(validInitial / 12) * 12,
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        setInternalValue(parsed);
        setDecadeStart(Math.floor(parsed / 12) * 12);
      }
    } else if (defaultValue !== undefined) {
      const parsed = Number.parseInt(defaultValue, 10);
      if (Number.isFinite(parsed)) {
        setInternalValue(parsed);
        setDecadeStart(Math.floor(parsed / 12) * 12);
      }
    }
  }, [value, defaultValue]);

  // Close on click-outside
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const selectedYear =
    value !== undefined
      ? Number.parseInt(value, 10) || currentYear
      : internalValue;

  const selectYear = (year: number) => {
    if (value === undefined) {
      setInternalValue(year);
    }
    onValueChange?.(String(year));
    setOpen(false);
  };

  const yearsInGrid = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => decadeStart + i);
  }, [decadeStart]);

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label ? (
        <label className="text-muted block text-xs font-semibold">
          {label}
        </label>
      ) : null}

      <div className="relative overflow-visible">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-left text-sm text-[var(--foreground)] transition-all duration-200 outline-none hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{selectedYear}</span>
            {selectedYear === currentYear && (
              <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                Saat Ini
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "text-muted h-4 w-4 shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        <input type="hidden" name={name} value={selectedYear} />

        {/* Dropdown Panel – rendered inline, positioned absolutely below trigger */}
        {open && (
          <div className="absolute top-full left-0 z-[200] mt-1.5 w-[300px] rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] p-4 shadow-2xl backdrop-blur-xl">
            {/* Decade Navigation Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <button
                type="button"
                onClick={() => setDecadeStart((prev) => prev - 12)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] active:scale-95"
                title="Dekade Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-xs font-bold tracking-wide text-[var(--foreground)]">
                {decadeStart} – {decadeStart + 11}
              </span>

              <button
                type="button"
                onClick={() => setDecadeStart((prev) => prev + 12)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] active:scale-95"
                title="Dekade Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 12-Year Grid */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {yearsInGrid.map((year) => {
                const isSelected = year === selectedYear;
                const isCurrent = year === currentYear;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition-all duration-150 outline-none",
                      isSelected
                        ? "gradient-primary scale-[1.02] font-bold text-white shadow-md shadow-indigo-500/20"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
                    )}
                  >
                    <span>{year}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Shortcuts */}
            <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-teal-600 transition hover:bg-teal-500/10 active:scale-95 dark:text-teal-400"
                onClick={() => selectYear(currentYear)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Tahun Ini ({currentYear})
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] active:scale-95"
                  onClick={() => selectYear(selectedYear - 1)}
                  title="Tahun Sebelumnya"
                >
                  -1 Thn
                </button>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] active:scale-95"
                  onClick={() => selectYear(selectedYear + 1)}
                  title="Tahun Selanjutnya"
                >
                  +1 Thn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
