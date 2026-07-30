import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategoriesByType } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage() {
  const initialCategories = await getCategoriesByType("expense");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Transactions
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--retro-text)]">
            Add a new entry
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--retro-muted)]">
            Pilih income atau expense, lalu tambahkan kategori, nominal, tanggal,
            dan catatan singkat.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <TransactionForm initialCategories={initialCategories} />
    </section>
  );
}
