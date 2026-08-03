import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategoriesByType } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage() {
  const initialCategories = await getCategoriesByType("expense");

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 rounded-[24px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)] sm:gap-4 sm:rounded-[26px] sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
            Transactions
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--retro-text)] sm:text-3xl">
            Add a new entry
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--retro-muted)]">
            Pilih income atau expense, lalu tambahkan kategori, nominal, tanggal,
            dan catatan singkat.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-3.5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)] sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.14em]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <TransactionForm initialCategories={initialCategories} />
    </section>
  );
}
