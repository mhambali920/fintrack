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

const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

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
  const cells: Array<Date | null> = Array.from(
    { length: startOffset },
    () => null,
  );

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
    month: "short",
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
      setViewDate(
        new Date(nextSelected.getFullYear(), nextSelected.getMonth(), 1),
      );
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
    <div className={cn("space-y-1.5", className)}>
      <span className="text-muted block text-xs font-semibold">{label}</span>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Popover.Trigger
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-left text-sm text-[var(--foreground)] transition duration-200 outline-none hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
              !selectedLabel && "text-muted",
            )}
          >
            <span>{selectedLabel || placeholder}</span>
            <CalendarIcon className="text-muted h-4 w-4" />
          </Popover.Trigger>
          <input type="hidden" name={name} value={value} />
        </div>

        <Popover.Portal>
          <Popover.Positioner sideOffset={6} className="z-200">
            <Popover.Popup className="w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <UiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </UiButton>

                <p className="text-sm font-semibold text-[var(--foreground)] capitalize">
                  {formatMonth(viewDate)}
                </p>

                <UiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </UiButton>
              </div>

              <div className="text-muted mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
                {weekdayLabels.map((labelText) => (
                  <span key={labelText} className="py-1">
                    {labelText}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="h-8" />;
                  }

                  const isSelected = value === toInputValue(day);

                  return (
                    <UiButton
                      key={day.toISOString()}
                      type="button"
                      variant={isSelected ? "primary" : "ghost"}
                      size="sm"
                      className={cn(
                        "mx-auto h-8 w-8 justify-center rounded-lg p-0 text-xs font-medium",
                        isSelected
                          ? "gradient-primary dark:text-white"
                          : "hover:bg-[var(--surface-hover)]",
                      )}
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
