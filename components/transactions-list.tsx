"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { TransactionRecord } from "@/lib/finance";
import { TransactionItem } from "@/components/transaction-item";
import { UiButton } from "@/components/ui/button";
import { DeleteTransactionModal } from "@/components/delete-transaction-modal";

type TransactionsListProps = {
  items: TransactionRecord[];
};

export function TransactionsList({ items }: TransactionsListProps) {
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionRecord | null>(null);

  return (
    <>
      <div className="space-y-3">
        {items.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            actions={
              <UiButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingTransaction(transaction)}
                className="rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                title="Hapus Transaksi"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only text-xs sm:not-sr-only">Hapus</span>
              </UiButton>
            }
          />
        ))}
      </div>

      <DeleteTransactionModal
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
      />
    </>
  );
}
