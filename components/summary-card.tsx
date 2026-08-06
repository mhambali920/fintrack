import { Wallet, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type SummaryCardProps = {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "accent" | "danger" | "success";
};

const toneConfig: Record<NonNullable<SummaryCardProps["tone"]>, { text: string; bg: string; icon: typeof Wallet }> = {
  default: {
    text: "text-[var(--foreground)]",
    bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    icon: Wallet,
  },
  accent: {
    text: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    icon: Sparkles,
  },
  success: {
    text: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: TrendingUp,
  },
  danger: {
    text: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: TrendingDown,
  },
};

export function SummaryCard({ label, value, note, tone = "default" }: SummaryCardProps) {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <article
      className={cn(
        "glass-card glass-card-hover rounded-xl p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1",
        "flex flex-col justify-between"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-200",
            config.bg
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <h3 className={cn("mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl", config.text)}>
          {value}
        </h3>
      </div>
      <p className="mt-4 text-xs text-muted leading-relaxed border-t border-[var(--border)] pt-3">
        {note}
      </p>
    </article>
  );
}
