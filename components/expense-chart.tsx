"use client";

import { useMemo } from "react";
import type { TransactionRecord } from "@/lib/finance";

type ExpenseChartProps = {
  transactions: TransactionRecord[];
};

function formatRp(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

const defaultColors = [
  "#F97316", // Orange
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#A855F7", // Purple
  "#14B8A6", // Teal
  "#10B981", // Green
  "#F59E0B", // Amber
];

function getCategoryColor(color: string | null, index: number) {
  if (color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
    return color;
  }
  return defaultColors[index % defaultColors.length];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const expenseData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const map = new Map<string, { label: string; amount: number; color: string }>();

    let totalExpense = 0;
    expenses.forEach((t) => {
      totalExpense += t.amount;
      const catName = t.category?.name ?? "Lainnya";
      const catColor = t.category?.color ?? null;
      const existing = map.get(catName);

      if (existing) {
        existing.amount += t.amount;
      } else {
        map.set(catName, {
          label: catName,
          amount: t.amount,
          color: getCategoryColor(catColor, map.size),
        });
      }
    });

    const items = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
    return { items, totalExpense };
  }, [transactions]);

  const { items, totalExpense } = expenseData;

  // Compute SVG Donut Chart Paths
  const svgSlices = useMemo(() => {
    if (totalExpense === 0 || items.length === 0) {
      return [];
    }

    let cumulativeAngle = 0;
    return items.map((item) => {
      const percentage = item.amount / totalExpense;
      const angle = percentage * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      // Calculate SVG arc path coordinates (Radius = 40, Center = 50, 50)
      const r = 38;
      const cx = 50;
      const cy = 50;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      // Arc path string
      const d =
        items.length === 1 || percentage >= 0.999
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`
          : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        label: item.label,
        color: item.color,
        d,
        percentage: Math.round(percentage * 100),
      };
    });
  }, [items, totalExpense]);

  if (items.length === 0 || totalExpense === 0) {
    return (
      <div className="rounded-3xl bg-[var(--surface)] p-8 border border-[var(--border)] text-center shadow-sm">
        <p className="text-sm text-muted">Belum ada data pengeluaran bulan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SVG Doughnut Chart Container */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] shadow-sm relative text-center">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
          Proporsi Pengeluaran Bulan Ini
        </h3>

        <div className="relative h-56 w-56 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {svgSlices.map((slice, i) => (
              <path
                key={i}
                d={slice.d}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              />
            ))}
          </svg>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-semibold text-muted">Total Out</span>
            <span className="text-base font-bold text-[var(--foreground)]">{formatRp(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Top Categories Breakdown List */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] shadow-sm space-y-4">
        <h3 className="font-semibold text-base text-[var(--foreground)]">Kategori Terbesar</h3>

        <div className="space-y-3.5">
          {items.map((item, index) => {
            const percent = Math.round((item.amount / totalExpense) * 100);

            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[var(--foreground)]">{formatRp(item.amount)}</span>
                  <span className="text-xs text-muted ml-2">({percent}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
