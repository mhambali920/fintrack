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
    <div className={cn("space-y-1.5", className)}>
      <Select.Root
        items={items}
        value={selectedValue || null}
        onValueChange={handleValueChange}
      >
        <Select.Label className="block text-xs font-semibold text-muted">
          {label}
        </Select.Label>

        <div className="relative">
          <Select.Trigger className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-left text-sm text-[var(--foreground)] outline-none transition duration-200 hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer">
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="ml-2 inline-flex text-muted">
              <ChevronDown className="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>

          <input type="hidden" name={name} value={selectedValue} />
        </div>

        <Select.Portal>
          <Select.Positioner sideOffset={6} className="z-[70]">
            <Select.Popup className="min-w-[var(--base-ui-anchor-width)] overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] p-1.5 shadow-2xl backdrop-blur-xl">
              <Select.ScrollUpArrow className="flex justify-center py-1 text-muted">
                <ChevronUp className="h-4 w-4" />
              </Select.ScrollUpArrow>

              <Select.List className="space-y-0.5">
                {items.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-hover)] data-[highlighted]:bg-[var(--surface-hover)] data-[selected]:bg-[var(--primary)]/15 data-[selected]:text-primary data-[selected]:font-semibold"
                  >
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator className="text-primary">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>

              <Select.ScrollDownArrow className="flex justify-center py-1 text-muted">
                <ChevronDown className="h-4 w-4" />
              </Select.ScrollDownArrow>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
