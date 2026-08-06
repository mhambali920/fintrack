import { ArrowDownLeft, ArrowUpRight, Calendar } from "lucide-react";
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
    : "#6366f1";
}

export function TransactionItem({ transaction, actions }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const amountLabel = `${isIncome ? "+" : "-"}${currencyFormatter.format(
    transaction.amount,
  )}`;
  const categoryName = transaction.category?.name ?? "Uncategorized";
  const color = getCategoryColor(transaction.category?.color ?? null);

  return (
    <article
      className={"glass-card glass-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-4 sm:p-5 transition-transform duration-300 hover:-translate-y-1"}
    >
      {/* Category Badge */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-inner transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${color}18`,
            color: color,
            borderColor: `${color}30`,
          }}
        >
          {transaction.category?.icon ? (
            <span className="text-xs font-bold uppercase">
              {transaction.category.icon.slice(0, 2)}
            </span>
          ) : isIncome ? (
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          ) : (
            <ArrowDownLeft className="h-5 w-5 text-rose-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {transaction.description || categoryName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border"
              style={{
                backgroundColor: `${color}12`,
                color: color,
                borderColor: `${color}25`,
              }}
            >
              {categoryName}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Calendar className="h-3 w-3" />
              {dateFormatter.format(new Date(transaction.date))}
            </span>
          </div>
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <p className={`text-base font-extrabold ${isIncome ? "text-emerald-500" : "text-rose-500"}`}>{amountLabel}</p>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </article>
  );
}
