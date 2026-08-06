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
  const inputPlaceholder = searchPlaceholder ?? `Search ${label.toLowerCase()}...`;

  return (
    <div className={cn("space-y-1.5", className)}>
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
        <Combobox.Label className="block text-xs font-semibold text-muted">
          {label}
        </Combobox.Label>

        <div className="relative">
          <Combobox.Trigger
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-left text-sm text-[var(--foreground)] outline-none transition duration-200 hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer",
            )}
          >
            <Combobox.Value placeholder={placeholder} />
          </Combobox.Trigger>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <input type="hidden" name={name} value={selectedValue} />

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={6} className="z-[200]">
            <Combobox.Popup className="z-[200] w-[min(calc(100vw-2rem),var(--base-ui-anchor-width))] overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-2 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <Combobox.Input
                  autoComplete="off"
                  placeholder={inputPlaceholder}
                  className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-muted"
                />
              </div>

              <div className="mt-2 max-h-60 overflow-y-auto">
                <Combobox.List className="space-y-0.5">
                  {filteredItems.map((item) => (
                    <Combobox.Item
                      key={item.value}
                      value={item.value}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-hover)] data-[highlighted]:bg-[var(--surface-hover)] data-[selected]:bg-[var(--primary)]/15 data-[selected]:text-primary data-[selected]:font-semibold"
                    >
                      {item.label}
                    </Combobox.Item>
                  ))}
                </Combobox.List>

                {filteredItems.length === 0 ? (
                  <p className="px-3 py-3 text-center text-xs text-muted">
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
