import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { getDashboardOverview } from "@/lib/finance";
import { SummaryCard } from "@/components/summary-card";
import { TransactionItem } from "@/components/transaction-item";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  let errorMessage: string | null = null;
  let overview: Awaited<ReturnType<typeof getDashboardOverview>> | null = null;

  try {
    overview = await getDashboardOverview();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load dashboard.";
  }

  const totalBalance = overview?.totalBalance ?? 0;
  const incomeThisMonth = overview?.incomeThisMonth ?? 0;
  const expenseThisMonth = overview?.expenseThisMonth ?? 0;
  const recentTransactions = overview?.recentTransactions ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Dashboard overview
          </p>
          <h3 className="mt-2 text-3xl font-bold text-[var(--retro-text)]">
            Status keuangan bulan ini
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--retro-muted)]">
            Ringkasan saldo, pemasukan, pengeluaran, dan 5 transaksi terakhir.
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

      {errorMessage ? (
        <div className="rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-5 text-sm leading-6 text-[var(--retro-muted)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryCard
          label="Total balance"
          value={formatCurrency(totalBalance)}
          note="Saldo berdasarkan seluruh transaksi milik user"
          tone={totalBalance >= 0 ? "success" : "danger"}
        />
        <SummaryCard
          label="Income this month"
          value={formatCurrency(incomeThisMonth)}
          note="Akumulasi pemasukan pada bulan berjalan"
          tone="accent"
        />
        <SummaryCard
          label="Expense this month"
          value={formatCurrency(expenseThisMonth)}
          note="Akumulasi pengeluaran pada bulan berjalan"
          tone="danger"
        />
      </div>

      <section className="space-y-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
              Recent ledger
            </p>
            <h3 className="mt-1 text-2xl font-bold text-[var(--retro-text)]">
              5 transaksi terakhir
            </h3>
          </div>
          <Link
            href="/transactions/add"
            className="rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
          >
            Quick add
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-5 text-sm leading-6 text-[var(--retro-muted)]">
            Belum ada transaksi. Tambahkan transaksi pertama kamu dari tombol
            Add transaction.
          </div>
        )}
      </section>
    </section>
  );
}
