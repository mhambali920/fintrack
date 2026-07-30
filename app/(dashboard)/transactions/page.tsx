import Link from "next/link";
import { ArrowLeft, ArrowRight, Filter, PlusCircle, Trash2 } from "lucide-react";
import { deleteTransactionFormAction } from "@/app/(dashboard)/actions";
import { getTransactionsPage } from "@/lib/finance";
import { TransactionItem } from "@/components/transaction-item";

export const dynamic = "force-dynamic";

type TransactionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 10;

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = params[key];
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function getNumberParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: number,
) {
  const value = params[key];
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthLabel(month: string) {
  const parsed = new Date(`${month}-01T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? month
    : new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(parsed);
}

function buildQueryString(params: Record<string, string | number>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== 0) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = (await searchParams) ?? {};
  const month = getStringParam(params, "month", currentMonth());
  const type = getStringParam(params, "type", "all") as "all" | "income" | "expense";
  const page = getNumberParam(params, "page", 1);
  const result = await getTransactionsPage({
    month,
    type,
    page,
    pageSize,
  });

  const currentQuery = {
    month: result.filters.month,
    type: result.filters.type,
  };
  const baseQuery = buildQueryString(currentQuery);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Transactions
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--retro-text)]">
            Riwayat transaksi
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--retro-muted)]">
            Menampilkan {result.totalCount} transaksi pada {formatMonthLabel(month)}.
          </p>
        </div>

        <Link
          href="/transactions/add"
          className="inline-flex w-fit items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
        >
          <PlusCircle className="h-4 w-4" />
          Add transaction
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)]"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--retro-accent)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Filter
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Month
            </span>
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition focus:border-[var(--retro-accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Type
            </span>
            <select
              name="type"
              defaultValue={type}
              className="w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition focus:border-[var(--retro-accent)]"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-auto inline-flex h-fit w-fit items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
          >
            Apply filters
          </button>
        </div>
      </form>

      {result.items.length > 0 ? (
        <div className="space-y-3">
          {result.items.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              actions={
                <div className="flex items-center justify-end">
                  <form action={deleteTransactionFormAction}>
                    <input type="hidden" name="id" value={transaction.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </form>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 text-sm leading-6 text-[var(--retro-muted)] shadow-[10px_10px_0_var(--retro-shadow)]">
          Tidak ada transaksi untuk filter ini. Coba ubah bulan atau tipe,
          atau tambahkan transaksi baru.
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--retro-muted)]">
          Page {result.page} of {result.totalPages} · {result.totalCount} total
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`?${buildQueryString({
              ...currentQuery,
              page: Math.max(1, result.page - 1),
            })}`}
            aria-disabled={result.page <= 1}
            className={`inline-flex items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition ${
              result.page <= 1
                ? "pointer-events-none bg-[var(--retro-surface)] text-[var(--retro-muted)] opacity-60"
                : "bg-[var(--retro-surface)] text-[var(--retro-text)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Prev
          </Link>

          <Link
            href={`?${buildQueryString({
              ...currentQuery,
              page: Math.min(result.totalPages, result.page + 1),
            })}`}
            aria-disabled={result.page >= result.totalPages}
            className={`inline-flex items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition ${
              result.page >= result.totalPages
                ? "pointer-events-none bg-[var(--retro-surface)] text-[var(--retro-muted)] opacity-60"
                : "bg-[var(--retro-surface)] text-[var(--retro-text)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
            }`}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
