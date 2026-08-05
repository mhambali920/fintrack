"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryRecord, EntityType } from "@/lib/finance";
import { createTransactionAction } from "@/app/(dashboard)/actions";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { UiCombobox } from "@/components/ui/combobox";
import { DatePickerField } from "@/components/ui/date-picker";
import { parseNaturalLanguageTransaction } from "@/lib/ai-parser";
import { cn } from "@/lib/cn";

type ActionState = {
  ok: boolean;
  error?: string;
};

type TransactionFormProps = {
  initialCategories: CategoryRecord[];
  onSuccess?: () => void;
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

export function TransactionForm({ initialCategories, onSuccess }: TransactionFormProps) {
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

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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
      setAiPrompt("");
      setAiMessage(null);
      onSuccess?.();
      router.refresh();
    }
  }, [actionState, router, onSuccess]);

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
            error instanceof Error ? error.message : "Gagal memuat kategori.",
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

  // AI Assistant Process Handler
  const handleAiProcess = () => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);
    setAiMessage(null);

    setTimeout(() => {
      const parsed = parseNaturalLanguageTransaction(aiPrompt, categories);

      if (parsed.type !== type) {
        setType(parsed.type);
      }

      if (parsed.amount > 0) {
        setAmount(String(parsed.amount));
      }

      if (parsed.description) {
        setDescription(parsed.description);
      }

      if (parsed.categoryId) {
        setCategoryId(parsed.categoryId);
      }

      setIsAiProcessing(false);
      setAiMessage("✨ AI telah otomatis menyusun & mengisi form di bawah!");
    }, 400);
  };

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 shadow-sm max-w-2xl mx-auto"
    >
      {/* Form Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Catat Transaksi
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Isi detail transaksi secara manual atau gunakan AI Assistant di bawah.
          </p>
        </div>

        {/* Expense / Income Radio Toggle */}
        <div className="inline-flex rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] p-1">
          <button
            type="button"
            onClick={() => onTypeChange("expense")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
              type === "expense"
                ? "bg-rose-500 text-white shadow-md"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => onTypeChange("income")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
              type === "income"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Pemasukan</span>
          </button>
        </div>
      </div>

      <input type="hidden" name="type" value={type} />

      {/* AI Smart Input Box (As seen in Reference UI_Pencatatan_Keuangan_AI_CRUD.html) */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 ai-input-focus transition-all space-y-2">
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
          </div>
          <span className="text-[10px] bg-purple-500/15 px-2 py-0.5 rounded-full font-medium">Smart NLP</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAiProcess();
              }
            }}
            placeholder="Cth: Beli domain bogordev 150 ribu"
            className="flex-1 bg-[var(--surface)] border border-purple-500/30 rounded-xl py-2 px-3 text-xs sm:text-sm text-[var(--foreground)] outline-none focus:border-purple-500 transition-colors placeholder:text-purple-400/70"
          />
          <button
            type="button"
            onClick={handleAiProcess}
            disabled={isAiProcessing}
            className="bg-purple-600 text-white px-3.5 py-2 rounded-xl hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center cursor-pointer shrink-0"
            title="Proses dengan AI"
          >
            <Wand2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-purple-600/80 dark:text-purple-400/80">
          <span>*AI akan otomatis mengisi nominal, kategori, & catatan di bawah</span>
          {aiMessage && <span className="font-semibold text-emerald-600">{aiMessage}</span>}
        </div>
      </div>

      {/* Nominal Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--muted)]">
          Nominal (Rp) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-[var(--muted)]">
            Rp
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
            className="pl-12 font-bold text-lg text-[var(--foreground)]"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category & Date Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="block text-xs font-semibold text-[var(--muted)]">
              Kategori <span className="text-rose-500">*</span>
            </span>
            <Link href="/categories" className="text-[11px] font-semibold text-teal-600 hover:underline">
              + Kelola
            </Link>
          </div>
          <UiCombobox
            name="category_id"
            label=""
            value={categoryId}
            onValueChange={setCategoryId}
            items={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            placeholder={isFetchingCategories ? "Memuat..." : "Pilih Kategori"}
            searchPlaceholder="Cari kategori..."
            emptyText={
              isFetchingCategories ? "Memuat..." : "Kategori tidak ditemukan."
            }
          />
        </div>

        <DatePickerField
          name="date"
          label="Tanggal Transaksi"
          value={date}
          onValueChange={setDate}
          placeholder="Pilih tanggal"
        />
      </div>

      {/* Description Note */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--muted)]">
          Keterangan / Catatan
        </label>
        <UiInput
          name="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          className="w-full"
          placeholder="Contoh: Beli Kopi"
        />
      </div>

      {/* Form State Messages */}
      <div className="space-y-2">
        {clientError ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{clientError}</span>
          </div>
        ) : null}

        {actionState.error ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionState.error}</span>
          </div>
        ) : null}

        {actionState.ok ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Transaksi berhasil disimpan!</span>
          </div>
        ) : null}
      </div>

      {/* Submit Button */}
      <UiButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={isPending}
        className="w-full gradient-card text-gray-800 font-bold text-base py-3.5 rounded-xl shadow-[0_8px_15px_rgba(163,228,215,0.4)] border-none justify-center"
      >
        <Save className="h-4 w-4" />
        <span>{isPending ? "Simpan..." : "Simpan Transaksi"}</span>
      </UiButton>
    </form>
  );
}
