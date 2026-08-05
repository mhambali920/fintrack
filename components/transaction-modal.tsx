"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { CategoryRecord } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";
import { cn } from "@/lib/cn";

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
  initialCategories: CategoryRecord[];
};

export function TransactionModal({ open, onClose, initialCategories }: TransactionModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col justify-end bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex-1" onClick={onClose} />

      <div className="bg-[var(--card)] rounded-t-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto hide-scroll border-t border-[var(--border)] animate-fadeIn">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-2 px-2">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Transaksi Baru</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)] rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <TransactionForm
          initialCategories={initialCategories}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
