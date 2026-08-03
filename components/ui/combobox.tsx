"use client";

import { ChevronDown, Search } from "lucide-react";
import { Combobox } from "@base-ui/react/combobox";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

export type UiComboboxItem = {
  label: string;
  value: string;
};

type UiComboboxProps = {
  name: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  items: UiComboboxItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

export function UiCombobox({
  name,
  label,
  value,
  defaultValue = "",
  onValueChange,
  items,
  placeholder = "Select option",
  searchPlaceholder,
  emptyText = "No results found.",
  className,
}: UiComboboxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const selectedValue = value ?? internalValue;
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery),
    );
  }, [items, query]);

  const isControlled = value !== undefined;
  const inputPlaceholder = searchPlaceholder ?? `Search ${label.toLowerCase()}`;

  return (
    <div className={cn("space-y-2", className)}>
      <Combobox.Root
        items={items}
        value={isControlled ? selectedValue || null : undefined}
        defaultValue={!isControlled ? defaultValue || undefined : undefined}
        inputValue={query}
        onInputValueChange={(nextQuery) => setQuery(nextQuery)}
        onOpenChange={(open) => {
          if (!open) {
            setQuery("");
          }
        }}
        onValueChange={(nextValue) => {
          const next = nextValue ?? "";
          if (!isControlled) {
            setInternalValue(next);
          }
          onValueChange?.(next);
          setQuery("");
        }}
        autoHighlight
      >
        <Combobox.Label className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
          {label}
        </Combobox.Label>

        <div className="relative">
          <Combobox.Trigger
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-3.5 py-2.5 text-left text-[var(--retro-text)] outline-none transition hover:translate-x-[1px] hover:translate-y-[1px] sm:rounded-[16px] sm:px-4 sm:py-3 focus:border-[var(--retro-accent)]",
            )}
          >
            <Combobox.Value placeholder={placeholder} />
          </Combobox.Trigger>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--retro-muted)]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <input type="hidden" name={name} value={selectedValue} />

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={8} className="z-[70]">
            <Combobox.Popup className="w-[min(100vw-1.5rem,var(--base-ui-anchor-width))] rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-2 shadow-[10px_10px_0_var(--retro-shadow)] sm:rounded-[20px] sm:p-3">
              <div className="flex items-center gap-2 rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-[var(--retro-muted)]" />
                <Combobox.Input
                  autoComplete="off"
                  placeholder={inputPlaceholder}
                  className="w-full bg-transparent text-sm text-[var(--retro-text)] outline-none placeholder:text-[var(--retro-muted)]"
                />
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto">
                <Combobox.List className="space-y-1">
                  {filteredItems.map((item) => (
                    <Combobox.Item
                      key={item.value}
                      value={item.value}
                      className="cursor-pointer rounded-[12px] px-3.5 py-2.5 text-sm text-[var(--retro-text)] outline-none transition hover:bg-[var(--retro-surface)] data-[highlighted]:bg-[var(--retro-surface)] data-[selected]:bg-[var(--retro-surface)] sm:rounded-[14px] sm:px-4 sm:py-3"
                    >
                      {item.label}
                    </Combobox.Item>
                  ))}
                </Combobox.List>

                {filteredItems.length === 0 ? (
                  <p className="px-3.5 py-3 text-sm text-[var(--retro-muted)]">
                    {emptyText}
                  </p>
                ) : null}
              </div>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
