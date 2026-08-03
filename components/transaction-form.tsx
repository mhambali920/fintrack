"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryRecord, EntityType } from "@/lib/finance";
import { createTransactionAction } from "@/app/(dashboard)/actions";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { UiSelect } from "@/components/ui/select";
import { DatePickerField } from "@/components/ui/date-picker";

type ActionState = {
  ok: boolean;
  error?: string;
};

type TransactionFormProps = {
  initialCategories: CategoryRecord[];
};

function todayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialActionState: ActionState = {
  ok: false,
};

export function TransactionForm({ initialCategories }: TransactionFormProps) {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(
    createTransactionAction,
    initialActionState,
  );
  const [type, setType] = useState<EntityType>("expense");
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayValue);
  const [description, setDescription] = useState("");
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  useEffect(() => {
    if (actionState.ok) {
      setAmount("");
      setDescription("");
      setDate(todayValue());
      setClientError(null);
      router.refresh();
    }
  }, [actionState, router]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setIsFetchingCategories(true);
      setClientError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, type, icon, color")
          .eq("type", type)
          .order("name", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        if (!active) {
          return;
        }

        const nextCategories = (data ?? []) as CategoryRecord[];
        setCategories(nextCategories);
        setCategoryId((current) => {
          if (current && nextCategories.some((item) => item.id === current)) {
            return current;
          }

          return nextCategories[0]?.id ?? "";
        });
      } catch (error) {
        if (active) {
          setClientError(
            error instanceof Error ? error.message : "Failed to load categories.",
          );
        }
      } finally {
        if (active) {
          setIsFetchingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [type]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categoryId, categories]);

  const onTypeChange = (nextType: EntityType) => {
    setType(nextType);
  };

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[24px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)] sm:space-y-6 sm:rounded-[26px] sm:p-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
            Transaction entry
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--retro-text)] sm:text-3xl">
            Catat pemasukan atau pengeluaran
          </h2>
        </div>

        <div className="inline-flex rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-1 shadow-[5px_5px_0_var(--retro-shadow)]">
          {(["expense", "income"] as EntityType[]).map((option) => {
            const active = type === option;

            return (
              <UiButton
                key={option}
                type="button"
                variant={active ? "primary" : "ghost"}
                onClick={() => onTypeChange(option)}
                className="rounded-[12px] px-3 py-2 text-xs shadow-none hover:shadow-none sm:rounded-[14px] sm:px-4"
              >
                {option}
              </UiButton>
            );
          })}
        </div>
      </div>

      <input type="hidden" name="type" value={type} />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.14em]">
            Amount
          </span>
          <UiInput
            name="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setAmount(event.currentTarget.value)
            }
            required
            className="w-full"
            placeholder="150000"
          />
        </label>

        <DatePickerField
          name="date"
          label="Date"
          value={date}
          onValueChange={setDate}
          placeholder="Pilih tanggal"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2">
          <UiSelect
            name="category_id"
            label="Category"
            value={categoryId}
            onValueChange={setCategoryId}
            items={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            placeholder={isFetchingCategories ? "Loading categories..." : "Select category"}
          />
          {selectedCategory ? (
            <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2.5 text-[10px] uppercase tracking-[0.12em] text-[var(--retro-muted)] sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.14em]">
              {selectedCategory.type} category selected
            </p>
          ) : null}
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.14em]">
            Description
          </span>
          <UiInput
            name="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            className="w-full"
            placeholder="Optional note"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2.5">
        {clientError ? (
          <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2.5 text-sm leading-6 text-[var(--retro-muted)] sm:px-4 sm:py-3">
            {clientError}
          </p>
        ) : null}

        {actionState.error ? (
          <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2.5 text-sm leading-6 text-[var(--retro-muted)] sm:px-4 sm:py-3">
            {actionState.error}
          </p>
        ) : null}

        {actionState.ok ? (
          <p className="rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2.5 text-sm leading-6 text-[var(--retro-muted)] sm:px-4 sm:py-3">
            Transaction saved successfully.
          </p>
        ) : null}
      </div>

      <UiButton
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Saving..." : "Save transaction"}
      </UiButton>
    </form>
  );
}
