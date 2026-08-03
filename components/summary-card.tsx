type SummaryCardProps = {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "accent" | "danger" | "success";
};

const toneClasses: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  default: "text-[var(--retro-text)]",
  accent: "text-[var(--retro-accent)]",
  danger: "text-[var(--retro-accent-strong)]",
  success: "text-[#80b86a]",
};

export function SummaryCard({
  label,
  value,
  note,
  tone = "default",
}: SummaryCardProps) {
  return (
    <article className="retro-panel rounded-[22px] p-4 sm:rounded-[24px] sm:p-6">
      <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--retro-accent)] sm:text-sm">
        {label}
      </p>
      <h3 className={`relative z-10 mt-2 text-xl font-bold sm:mt-3 sm:text-2xl ${toneClasses[tone]}`}>
        {value}
      </h3>
      <p className="relative z-10 mt-2 text-xs leading-5 text-[var(--retro-muted)] sm:text-sm sm:leading-6">
        {note}
      </p>
    </article>
  );
}
