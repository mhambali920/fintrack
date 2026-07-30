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
    <article className="retro-panel rounded-[24px] p-6">
      <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--retro-accent)]">
        {label}
      </p>
      <h3 className={`relative z-10 mt-3 text-2xl font-bold ${toneClasses[tone]}`}>
        {value}
      </h3>
      <p className="relative z-10 mt-2 text-sm leading-6 text-[var(--retro-muted)]">
        {note}
      </p>
    </article>
  );
}
