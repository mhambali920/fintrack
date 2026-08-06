import { getDashboardOverview, getTransactionsPage } from "@/lib/finance";
import { ExpenseChart } from "@/components/expense-chart";
import { PieChart } from "lucide-react";

export const dynamic = "force-dynamic";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default async function AnalyticsPage() {
  const result = await getTransactionsPage({
    month: currentMonth(),
    type: "all",
    page: 1,
    pageSize: 100,
  });

  return (
    <section className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
          <PieChart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Analisis Pengeluaran
          </h1>
          <p className="text-xs text-muted">
            Visualisasi distribusi statistik pengeluaran berdasarkan kategori bulan ini.
          </p>
        </div>
      </div>

      <ExpenseChart transactions={result.items} />
    </section>
  );
}
