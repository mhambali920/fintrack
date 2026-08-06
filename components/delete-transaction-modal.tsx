"use client";

import { useActionState, useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import type { TransactionRecord } from "@/lib/finance";
import { deleteTransactionAction } from "@/app/(dashboard)/actions";
import { UiButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DeleteTransactionModalProps = {
  transaction: TransactionRecord | null;
  onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const initialState = {
  ok: false,
  error: undefined as string | undefined,
};

export function DeleteTransactionModal({
  transaction,
  onClose,
}: DeleteTransactionModalProps) {
  const [actionState, formAction, isPending] = useActionState(
    deleteTransactionAction,
    initialState,
  );

  useEffect(() => {
    if (!transaction) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [transaction, isPending, onClose]);

  useEffect(() => {
    if (actionState.ok) {
      onClose();
    }
  }, [actionState.ok, onClose]);

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const amountLabel = `${isIncome ? "+" : "-"}${currencyFormatter.format(
    transaction.amount,
  )}`;
  const categoryName = transaction.category?.name ?? "Tanpa Kategori";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl transition-all duration-300">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 rounded-full bg-[var(--muted-bg)] p-2 text-muted transition-colors hover:text-[var(--foreground)] disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner">
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Modal Header */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            Hapus Transaksi?
          </h3>
          <p className="mt-1 text-xs text-muted">
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Transaction Detail Preview */}
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Deskripsi</span>
            <span className="text-xs font-bold text-[var(--foreground)] truncate max-w-[200px]">
              {transaction.description || categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
            <span className="text-xs font-semibold text-muted">Kategori</span>
            <span className="text-xs font-medium text-[var(--foreground)]">
              {categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
            <span className="text-xs font-semibold text-muted">Tanggal</span>
            <span className="text-xs font-medium text-[var(--foreground)]">
              {dateFormatter.format(new Date(transaction.date))}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
            <span className="text-xs font-semibold text-muted">Jumlah</span>
            <span
              className={cn(
                "text-sm font-extrabold",
                isIncome ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {amountLabel}
            </span>
          </div>
        </div>

        {/* Error Feedback */}
        {actionState.error && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-center text-xs font-medium text-rose-500">
            {actionState.error}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <UiButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 justify-center rounded-xl py-2.5 text-xs font-bold cursor-pointer"
          >
            Batal
          </UiButton>

          <form action={formAction} className="flex-1">
            <input type="hidden" name="id" value={transaction.id} />
            <UiButton
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-none py-2.5 text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Transaksi</span>
                </>
              )}
            </UiButton>
          </form>
        </div>
      </div>
    </div>
  );
}
