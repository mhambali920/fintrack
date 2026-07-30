import { ArrowDownLeft, ArrowUpRight, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
import type { TransactionRecord } from "@/lib/finance";

type TransactionItemProps = {
  transaction: TransactionRecord;
  actions?: ReactNode;
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

function getCategoryColor(color: string | null) {
  return color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
    ? color
    : "var(--retro-accent)";
}

export function TransactionItem({ transaction, actions }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const amountLabel = `${isIncome ? "+" : "-"}${currencyFormatter.format(
    transaction.amount,
  )}`;
  const categoryName = transaction.category?.name ?? "Uncategorized";
  const color = getCategoryColor(transaction.category?.color ?? null);

  return (
    <article className="flex items-start gap-4 rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-4 shadow-[5px_5px_0_var(--retro-shadow)]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)]"
        style={{ color }}
      >
        {transaction.category?.icon ? (
          <span className="text-sm font-bold uppercase">
            {transaction.category.icon.slice(0, 2)}
          </span>
        ) : isIncome ? (
          <ArrowUpRight className="h-5 w-5" />
        ) : (
          <ArrowDownLeft className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[var(--retro-text)]">
              {transaction.description || categoryName}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--retro-muted)]">
              <CircleDot className="h-3 w-3" style={{ color }} />
              <span className="truncate">{categoryName}</span>
              <span className="text-[var(--retro-muted)]">•</span>
              <span>{dateFormatter.format(new Date(transaction.date))}</span>
            </p>
          </div>
          <p
            className={`text-right text-base font-bold ${
              isIncome
                ? "text-[var(--retro-accent)]"
                : "text-[var(--retro-accent-strong)]"
            }`}
          >
            {amountLabel}
          </p>
        </div>

        {actions ? <div className="relative z-10 mt-4">{actions}</div> : null}
      </div>
    </article>
  );
}
