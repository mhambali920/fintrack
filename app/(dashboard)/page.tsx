import Link from "next/link";
import { Plus, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { getDashboardOverview } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TransactionItem } from "@/components/transaction-item";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function DashboardPage() {
  let errorMessage: string | null = null;
  let overview: Awaited<ReturnType<typeof getDashboardOverview>> | null = null;
  let userName = "Pengguna";

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      userName = user.email.split("@")[0];
      userName = userName.charAt(0).toUpperCase() + userName.slice(1);
    }

    overview = await getDashboardOverview();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Gagal memuat ringkasan dashboard.";
  }

  const totalBalance = overview?.totalBalance ?? 0;
  const incomeThisMonth = overview?.incomeThisMonth ?? 0;
  const expenseThisMonth = overview?.expenseThisMonth ?? 0;
  const recentTransactions = overview?.recentTransactions ?? [];

  return (
    <section className="space-y-6 max-w-xl mx-auto">
      {/* Top Greeting Header (Reference HTML Style) */}
      <div className="flex justify-between items-center pt-2 pb-1">
        <div>
          <p className="text-xs text-[var(--muted)] font-medium capitalize">
            {formatCurrentDate()}
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mt-0.5">
            Halo, {userName} 👋
          </h1>
        </div>

        <div className="w-11 h-11 rounded-full bg-teal-100 border-2 border-teal-200 overflow-hidden shadow-sm shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=A3E4D7&color=2C3E50`}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Hero Balance Card (Reference HTML gradient-card Style) */}
      <div className="gradient-card rounded-3xl p-6 shadow-[0_10px_25px_rgba(163,228,215,0.4)] relative overflow-hidden text-[#2C3E50]">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white opacity-25 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white opacity-20 rounded-full -ml-8 -mb-8 blur-lg pointer-events-none" />

        <p className="text-xs font-medium mb-1 relative z-10 opacity-90">
          Total Saldo Anda
        </p>
        <h2 className="text-3xl font-extrabold mb-6 tracking-tight relative z-10">
          {formatCurrency(totalBalance)}
        </h2>

        <div className="flex justify-between items-center text-sm bg-white/40 rounded-2xl p-4 backdrop-blur-md relative z-10 border border-white/50 shadow-sm">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-700" />
              <p className="text-xs font-semibold text-gray-700">Pemasukan</p>
            </div>
            <p className="font-bold text-emerald-800 text-sm sm:text-base">
              {formatCurrency(incomeThisMonth)}
            </p>
          </div>

          <div className="w-px h-8 bg-gray-400/30" />

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <p className="text-xs font-semibold text-gray-700">Pengeluaran</p>
            </div>
            <p className="font-bold text-rose-600 text-sm sm:text-base">
              {formatCurrency(expenseThisMonth)}
            </p>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-500">
          {errorMessage}
        </div>
      ) : null}

      {/* Transactions Section Header */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-[var(--foreground)]">
            Transaksi Terbaru
          </h3>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center bg-[var(--surface)]">
            <p className="text-sm text-[var(--muted)] mb-3">
              Belum ada transaksiRecorded. Mulai catat transaksi pertama Anda.
            </p>
            <Link
              href="/transactions/add"
              className="inline-flex items-center gap-1.5 gradient-card text-gray-800 font-bold px-4 py-2 rounded-xl text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              Catat Transaksi
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
