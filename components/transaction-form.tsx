"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
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
  Brain,
  Zap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryRecord, EntityType } from "@/lib/finance";
import { createTransactionAction } from "@/app/(dashboard)/actions";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { UiCombobox } from "@/components/ui/combobox";
import { DatePickerField } from "@/components/ui/date-picker";
import {
  parseWithGemini,
  parseNaturalLanguageTransaction,
} from "@/lib/ai-parser";
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

export function TransactionForm({
  initialCategories,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(
    createTransactionAction,
    initialActionState,
  );
  const [type, setType] = useState<EntityType>("expense");
  const [categories, setCategories] =
    useState<CategoryRecord[]>(initialCategories);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayValue);
  const [description, setDescription] = useState("");
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

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
      setAiReasoning(null);
      setAiConfidence(null);
      setAiError(null);
      setUsedFallback(false);
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

  /**
   * Apply parsed result to form fields, regardless of source (Gemini or fallback).
   */
  const applyParsedResult = useCallback(
    (parsed: {
      type: EntityType;
      amount: number;
      description: string;
      categoryId: string;
      confidence: number;
      aiReasoning?: string;
      date?: string;
    }) => {
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

      if (parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
        setDate(parsed.date);
      }

      setAiConfidence(parsed.confidence);
      setAiReasoning(parsed.aiReasoning ?? null);
    },
    [type],
  );

  // Guard ref to prevent duplicate calls (React StrictMode dev double-render)
  const processingRef = useRef(false);

  // AI Assistant Process Handler — Real Gemini API with local fallback
  const handleAiProcess = useCallback(async () => {
    if (!aiPrompt.trim() || processingRef.current) return;

    processingRef.current = true;
    setIsAiProcessing(true);
    setAiMessage(null);
    setAiReasoning(null);
    setAiConfidence(null);
    setAiError(null);
    setUsedFallback(false);

    try {
      // Try real Gemini API first (pass todayValue as reference date)
      const parsed = await parseWithGemini(aiPrompt, categories, todayValue());
      applyParsedResult(parsed);
      setAiMessage("✨ Gemini AI telah menganalisis & mengisi form!");
      setUsedFallback(false);
    } catch (error) {
      // Fallback to local parser
      console.warn(
        "[AI Fallback] Gemini unavailable, using local parser:",
        error instanceof Error ? error.message : error,
      );

      const parsed = parseNaturalLanguageTransaction(
        aiPrompt,
        categories,
        todayValue(),
      );
      applyParsedResult(parsed);
      setUsedFallback(true);
      setAiError(
        error instanceof Error ? error.message : "Gemini API tidak tersedia",
      );
      setAiMessage("⚡ Menggunakan parser lokal sebagai fallback");
    } finally {
      setIsAiProcessing(false);
      processingRef.current = false;
    }
  }, [aiPrompt, categories, applyParsedResult]);

  // Confidence badge color
  const confidenceColor =
    aiConfidence !== null
      ? aiConfidence >= 0.85
        ? "text-emerald-600 bg-emerald-500/15"
        : aiConfidence >= 0.6
          ? "text-amber-600 bg-amber-500/15"
          : "text-rose-600 bg-rose-500/15"
      : "";

  const confidenceLabel =
    aiConfidence !== null
      ? aiConfidence >= 0.85
        ? "Sangat Yakin"
        : aiConfidence >= 0.6
          ? "Cukup Yakin"
          : "Kurang Yakin"
      : "";

  return (
    <form
      action={formAction}
      className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7"
    >
      {/* Form Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Catat Transaksi
          </h2>
          <p className="text-muted text-xs">
            Isi detail transaksi secara manual atau gunakan AI Assistant di
            bawah.
          </p>
        </div>

        {/* Expense / Income Radio Toggle */}
        <div className="inline-flex rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] p-1">
          <button
            type="button"
            onClick={() => onTypeChange("expense")}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 select-none sm:w-fit",
              type === "expense"
                ? "bg-rose-500 text-white shadow-md"
                : "text-muted hover:text-[var(--foreground)]",
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => onTypeChange("income")}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 select-none sm:w-fit",
              type === "income"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-muted hover:text-foreground",
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Pemasukan</span>
          </button>
        </div>
      </div>

      <input type="hidden" name="type" value={type} />

      {/* AI Smart Input Box — Powered by Gemini */}
      <div
        className={cn(
          "space-y-3 rounded-2xl border-2 p-4 transition-all duration-300",
          isAiProcessing
            ? "border-purple-500/50 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            : "border-purple-500/30 bg-purple-500/10",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <div className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider uppercase">
              AI Assistant
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium">
            <Sparkles className="h-3 w-3" />
            Gemini AI
          </span>
        </div>

        {/* Input + Button */}
        <div className="flex flex-col gap-2 sm:flex-row">
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
            disabled={isAiProcessing}
            placeholder='Cth: "Beli bakso 3 hari lalu 9000" atau "Gaji kemarin 5 juta"'
            className="flex-1 rounded-xl border border-purple-500/30 bg-[var(--surface)] px-3 py-2.5 text-xs text-[var(--foreground)] transition-colors outline-none placeholder:text-purple-400/60 focus:border-purple-500 disabled:opacity-60 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAiProcess}
            disabled={isAiProcessing || !aiPrompt.trim()}
            className={cn(
              "flex shrink-0 cursor-pointer items-center justify-center rounded-xl px-3.5 py-2.5 text-white shadow-md transition-all",
              isAiProcessing
                ? "cursor-wait bg-purple-700"
                : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg active:scale-95",
              !aiPrompt.trim() && "cursor-not-allowed opacity-50",
            )}
            title="Proses dengan Gemini AI"
          >
            {isAiProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Processing Indicator */}
        {isAiProcessing && (
          <div className="flex animate-pulse items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
            <div className="flex gap-1">
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500 [animation-delay:0ms]" />
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500 [animation-delay:150ms]" />
              <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500 [animation-delay:300ms]" />
            </div>
            <span className="font-medium">
              Gemini sedang menganalisis transaksi...
            </span>
          </div>
        )}

        {/* AI Result Feedback */}
        {!isAiProcessing && aiMessage && (
          <div className="space-y-2">
            {/* Success / Fallback Message */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                usedFallback
                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-600"
                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
              )}
            >
              {usedFallback ? (
                <Zap className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{aiMessage}</span>

              {/* Confidence Badge */}
              {aiConfidence !== null && (
                <span
                  className={cn(
                    "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    confidenceColor,
                  )}
                >
                  {Math.round(aiConfidence * 100)}% — {confidenceLabel}
                </span>
              )}
            </div>

            {/* AI Reasoning */}
            {aiReasoning && !usedFallback && (
              <div className="flex items-start gap-2 rounded-lg border border-purple-500/10 bg-purple-500/5 px-3 py-2 text-[11px] text-purple-600/80 dark:text-purple-400/80">
                <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{aiReasoning}</span>
              </div>
            )}

            {/* Fallback Error Detail */}
            {usedFallback && aiError && (
              <div className="px-1 text-[10px] text-amber-600/70 dark:text-amber-400/70">
                ⚠️ {aiError}
              </div>
            )}
          </div>
        )}

        {/* Footer Hint */}
        {!isAiProcessing && !aiMessage && (
          <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70">
            *Ketik deskripsi (cth: &quot;3 hari lalu&quot;, &quot;kemarin&quot;)
            — AI akan otomatis mengisi nominal, kategori, tanggal, &amp; catatan
          </div>
        )}
      </div>

      {/* Nominal Input */}
      <div className="space-y-1.5">
        <label className="text-muted block text-xs font-semibold">
          Nominal (Rp) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="text-muted absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold">
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
            className="pl-12 text-lg font-bold text-[var(--foreground)]"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category & Date Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted block text-xs font-semibold">
              Kategori <span className="text-rose-500">*</span>
            </span>
            <Link
              href="/categories"
              className="text-[11px] font-semibold text-teal-600 hover:underline"
            >
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
        <label className="text-muted block text-xs font-semibold">
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
        className="gradient-card w-full justify-center rounded-xl border-none py-3.5 text-base font-bold text-gray-800 shadow-[0_8px_15px_rgba(163,228,215,0.4)]"
      >
        <Save className="h-4 w-4" />
        <span>{isPending ? "Simpan..." : "Simpan Transaksi"}</span>
      </UiButton>
    </form>
  );
}
