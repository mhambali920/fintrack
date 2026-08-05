import Link from "next/link";
import { ArrowLeft, ArrowRight, Filter, Plus, Trash2, ArrowLeftRight } from "lucide-react";
import { deleteTransactionFormAction } from "@/app/(dashboard)/actions";
import { getTransactionsPage } from "@/lib/finance";
import { TransactionItem } from "@/components/transaction-item";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { UiSelect } from "@/components/ui/select";

export const dynamic = "force-dynamic";

type TransactionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 10;
const filterTypeItems = [
  { label: "All Types", value: "all" },
  { label: "Income Only", value: "income" },
  { label: "Expense Only", value: "expense" },
] as const;

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

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Transaction History</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Riwayat Transaksi
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
            Menampilkan <span className="font-semibold text-[var(--foreground)]">{result.totalCount}</span> transaksi periode <span className="font-semibold text-[var(--foreground)]">{formatMonthLabel(month)}</span>.
          </p>
        </div>

        <Link
          href="/transactions/add"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl gradient-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Transaksi</span>
        </Link>
      </div>

      {/* Filter Form Card */}
      <form
        method="get"
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border)] pb-3">
          <Filter className="h-4 w-4 text-indigo-500" />
          <span>Filter & Pencarian</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-[var(--muted)]">
              Pilih Bulan
            </span>
            <UiInput
              type="month"
              name="month"
              defaultValue={month}
              className="w-full"
            />
          </label>

          <UiSelect
            name="type"
            label="Tipe Transaksi"
            defaultValue={type}
            items={[...filterTypeItems]}
          />

          <div className="flex items-end">
            <UiButton
              type="submit"
              variant="primary"
              className="w-full lg:w-auto h-[42px] px-6"
            >
              Terapkan Filter
            </UiButton>
          </div>
        </div>
      </form>

      {/* Transactions List */}
      {result.items.length > 0 ? (
        <div className="space-y-3">
          {result.items.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              actions={
                <form action={deleteTransactionFormAction}>
                  <input type="hidden" name="id" value={transaction.id} />
                  <UiButton
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-xl"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only text-xs">Hapus</span>
                  </UiButton>
                </form>
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border)] p-10 text-center bg-[var(--surface)]">
          <p className="text-sm text-[var(--muted)]">
            Tidak ada transaksi untuk filter ini. Coba sesuaikan pilihan bulan atau tipe transaksi.
          </p>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <p className="text-xs text-[var(--muted)]">
          Halaman <span className="font-semibold text-[var(--foreground)]">{result.page}</span> dari{" "}
          <span className="font-semibold text-[var(--foreground)]">{result.totalPages}</span> · Total {result.totalCount} data
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`?${buildQueryString({
              ...currentQuery,
              page: Math.max(1, result.page - 1),
            })}`}
            aria-disabled={result.page <= 1}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-semibold transition ${
              result.page <= 1
                ? "pointer-events-none opacity-40 text-[var(--muted)]"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-95"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </Link>

          <Link
            href={`?${buildQueryString({
              ...currentQuery,
              page: Math.min(result.totalPages, result.page + 1),
            })}`}
            aria-disabled={result.page >= result.totalPages}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-semibold transition ${
              result.page >= result.totalPages
                ? "pointer-events-none opacity-40 text-[var(--muted)]"
                : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-95"
            }`}
          >
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
