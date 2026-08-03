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
    <article className="flex items-start gap-3 rounded-[20px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-3.5 shadow-[5px_5px_0_var(--retro-shadow)] sm:gap-4 sm:rounded-[22px] sm:p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] sm:h-12 sm:w-12 sm:rounded-[16px]"
        style={{ color }}
      >
        {transaction.category?.icon ? (
          <span className="text-xs font-bold uppercase sm:text-sm">
            {transaction.category.icon.slice(0, 2)}
          </span>
        ) : isIncome ? (
          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--retro-text)] sm:text-base">
              {transaction.description || categoryName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--retro-muted)] sm:gap-2 sm:text-sm">
              <CircleDot className="h-3 w-3" style={{ color }} />
              <span className="truncate">{categoryName}</span>
              <span className="text-[var(--retro-muted)]">•</span>
              <span>{dateFormatter.format(new Date(transaction.date))}</span>
            </p>
          </div>
          <p
            className={`text-right text-sm font-bold sm:text-base ${
              isIncome
                ? "text-[var(--retro-accent)]"
                : "text-[var(--retro-accent-strong)]"
            }`}
          >
            {amountLabel}
          </p>
        </div>

        {actions ? <div className="relative z-10 mt-3 sm:mt-4">{actions}</div> : null}
      </div>
    </article>
  );
}
