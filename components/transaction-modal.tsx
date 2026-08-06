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

export function TransactionModal({
  open,
  onClose,
  initialCategories,
}: TransactionModalProps) {
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
        "fixed inset-0 z-100 flex flex-col justify-end bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex-1" onClick={onClose} />

      <div className="hide-scroll animate-fadeIn bg-card border-border relative max-h-[92vh] overflow-y-auto rounded-t-3xl border-t p-4 shadow-2xl sm:p-6">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />

        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-foreground text-lg font-bold">Transaksi Baru</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[var(--muted-bg)] p-1.5 text-muted transition-colors hover:text-foreground"
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
