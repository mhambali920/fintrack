"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { cn } from "@/lib/cn";
import { UiButton } from "@/components/ui/button";

type DatePickerProps = {
  name: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseInputValue(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const cells: Array<Date | null> = Array.from({ length: startOffset }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatMonth(viewDate: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(viewDate);
}

function formatSelected(value: string) {
  const parsed = parseInputValue(value);
  if (!parsed) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function DatePickerField({
  name,
  label,
  value,
  onValueChange,
  className,
  placeholder = "Select date",
}: DatePickerProps) {
  const initialView = parseInputValue(value) ?? new Date();
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(
    new Date(initialView.getFullYear(), initialView.getMonth(), 1),
  );

  React.useEffect(() => {
    const nextSelected = parseInputValue(value);
    if (nextSelected) {
      setViewDate(new Date(nextSelected.getFullYear(), nextSelected.getMonth(), 1));
    }
  }, [value]);

  const days = React.useMemo(() => getMonthDays(viewDate), [viewDate]);
  const selectedLabel = formatSelected(value);

  const selectDate = (nextDate: Date) => {
    onValueChange(toInputValue(nextDate));
    setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
        {label}
      </span>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Popover.Trigger
            className={cn(
              "flex w-full items-center justify-between rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-left text-[var(--retro-text)] outline-none transition hover:translate-x-[1px] hover:translate-y-[1px] focus:border-[var(--retro-accent)]",
              !selectedLabel && "text-[var(--retro-muted)]",
            )}
          >
            <span>{selectedLabel || placeholder}</span>
            <CalendarIcon className="h-4 w-4 text-[var(--retro-muted)]" />
          </Popover.Trigger>
          <input type="hidden" name={name} value={value} />
        </div>

        <Popover.Portal>
          <Popover.Positioner sideOffset={8} className="z-[80]">
            <Popover.Popup className="w-[320px] rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)]">
              <div className="flex items-center justify-between gap-2">
                <UiButton
                  type="button"
                  variant="secondary"
                  className="h-10 w-10 p-0"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </UiButton>

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--retro-text)]">
                  {formatMonth(viewDate)}
                </p>

                <UiButton
                  type="button"
                  variant="secondary"
                  className="h-10 w-10 p-0"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </UiButton>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--retro-muted)]">
                {weekdayLabels.map((labelText) => (
                  <span key={labelText}>{labelText}</span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="h-10" />;
                  }

                  const isSelected = value === toInputValue(day);

                  return (
                    <UiButton
                      key={day.toISOString()}
                      type="button"
                      variant={isSelected ? "primary" : "secondary"}
                      className="h-10 px-0 py-0 text-sm"
                      onClick={() => selectDate(day)}
                    >
                      {day.getDate()}
                    </UiButton>
                  );
                })}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
