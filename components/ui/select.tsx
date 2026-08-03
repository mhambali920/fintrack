"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "@base-ui/react/select";
import { cn } from "@/lib/cn";

export type UiSelectItem = {
  label: string;
  value: string;
};

type UiSelectProps = {
  name: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  items: UiSelectItem[];
  placeholder?: string;
  className?: string;
};

export function UiSelect({
  name,
  label,
  value,
  defaultValue = "",
  onValueChange,
  items,
  placeholder = "Select option",
  className,
}: UiSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  useEffect(() => {
    if (value === undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const selectedValue = value ?? internalValue;

  const handleValueChange = (nextValue: string | null) => {
    const next = nextValue ?? "";
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Select.Root
        items={items}
        value={selectedValue || null}
        onValueChange={handleValueChange}
      >
        <Select.Label className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
          {label}
        </Select.Label>

        <div className="relative">
          <Select.Trigger className="flex w-full items-center justify-between rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-3.5 py-2.5 text-left text-[var(--retro-text)] outline-none transition hover:translate-x-[1px] hover:translate-y-[1px] sm:rounded-[16px] sm:px-4 sm:py-3 focus:border-[var(--retro-accent)]">
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="ml-3 inline-flex text-[var(--retro-muted)]">
              <ChevronDown className="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>

          <input type="hidden" name={name} value={selectedValue} />
        </div>

        <Select.Portal>
          <Select.Positioner sideOffset={8} className="z-[70]">
            <Select.Popup className="min-w-[var(--base-ui-anchor-width)] rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-2 shadow-[10px_10px_0_var(--retro-shadow)] sm:rounded-[20px] sm:p-2">
              <Select.ScrollUpArrow className="flex justify-center px-2 py-2 text-[var(--retro-muted)]">
                <ChevronUp className="h-4 w-4" />
              </Select.ScrollUpArrow>

              <Select.List className="space-y-1">
                {items.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    className="flex cursor-pointer items-center justify-between rounded-[12px] px-3.5 py-2.5 text-sm text-[var(--retro-text)] outline-none transition hover:bg-[var(--retro-surface)] data-[highlighted]:bg-[var(--retro-surface)] data-[selected]:bg-[var(--retro-surface)] sm:rounded-[14px] sm:px-4 sm:py-3"
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator className="text-[var(--retro-accent)]">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>

              <Select.ScrollDownArrow className="flex justify-center px-2 py-2 text-[var(--retro-muted)]">
                <ChevronDown className="h-4 w-4" />
              </Select.ScrollDownArrow>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
