import Form from "next/form";
import { getTransactionsPage } from "@/lib/finance";
import { ExpenseChart } from "@/components/expense-chart";
import { PieChart, Filter } from "lucide-react";
import { UiSelect } from "@/components/ui/select";
import { UiButton } from "@/components/ui/button";
import { YearPicker } from "@/components/ui/year-picker";

export const dynamic = "force-dynamic";

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const MONTH_OPTIONS = [
  { label: "Januari", value: "01" },
  { label: "Februari", value: "02" },
  { label: "Maret", value: "03" },
  { label: "April", value: "04" },
  { label: "Mei", value: "05" },
  { label: "Juni", value: "06" },
  { label: "Juli", value: "07" },
  { label: "Agustus", value: "08" },
  { label: "September", value: "09" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
];

function parseMonthAndYear(
  params: Record<string, string | string[] | undefined>,
) {
  const now = new Date();
  const defaultYear = String(now.getFullYear());
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");

  const rawMonth = typeof params.month === "string" ? params.month.trim() : "";
  const rawYear = typeof params.year === "string" ? params.year.trim() : "";

  let monthVal = defaultMonth;
  let yearVal = defaultYear;

  if (rawMonth.includes("-")) {
    const parts = rawMonth.split("-");
    if (parts[0] && parts[0].length === 4) yearVal = parts[0];
    if (parts[1]) monthVal = parts[1].padStart(2, "0");
  } else {
    if (rawMonth) {
      const parsedM = Number.parseInt(rawMonth, 10);
      if (parsedM >= 1 && parsedM <= 12) {
        monthVal = String(parsedM).padStart(2, "0");
      }
    }
    if (rawYear) {
      const parsedY = Number.parseInt(rawYear, 10);
      if (parsedY >= 2000 && parsedY <= 2100) {
        yearVal = String(parsedY);
      }
    }
  }

  return { monthVal, yearVal };
}

function formatMonthYearLabel(year: string, month: string) {
  const date = new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    1,
  );
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = (await searchParams) ?? {};
  const { monthVal, yearVal } = parseMonthAndYear(params);

  const targetMonthString = `${yearVal}-${monthVal}`;
  const periodLabel = formatMonthYearLabel(yearVal, monthVal);

  const result = await getTransactionsPage({
    month: targetMonthString,
    type: "all",
    page: 1,
    pageSize: 1000,
  });

  return (
    <section className="mx-auto max-w-xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
          <PieChart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Analisis Pengeluaran
          </h1>
          <p className="text-muted text-xs">
            Visualisasi distribusi statistik pengeluaran berdasarkan kategori
            untuk periode {periodLabel}.
          </p>
        </div>
      </div>

      {/* Filter Form Card */}
      <Form
        action="/analytics"
        className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
      >
        <div className="text-muted flex items-center gap-2 border-b border-[var(--border)] pb-3 text-xs font-bold tracking-wider uppercase">
          <Filter className="h-4 w-4 text-teal-600" />
          <span>Filter Periode</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <UiSelect
            key={`month-${monthVal}`}
            name="month"
            label="Pilih Bulan"
            defaultValue={monthVal}
            items={MONTH_OPTIONS}
          />
          <YearPicker
            key={`year-${yearVal}`}
            name="year"
            label="Pilih Tahun"
            defaultValue={yearVal}
          />
          <div className="flex items-end">
            <UiButton
              type="submit"
              variant="primary"
              className="h-10.5 w-full px-6 md:mb-2 lg:w-auto"
            >
              Terapkan Filter
            </UiButton>
          </div>
        </div>
      </Form>

      {/* Chart */}
      <ExpenseChart transactions={result.items} periodLabel={periodLabel} />
    </section>
  );
}
