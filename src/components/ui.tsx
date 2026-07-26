import { cn } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/relevance";
import type { RelevanceTier } from "@/types/database";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "outline";
  className?: string;
}) {
  const tones = {
    default: "bg-ink-600 text-sand-muted",
    gold: "bg-gold/15 text-gold border border-gold/25",
    outline: "border border-line text-sand-muted",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

const TIER_TONE: Record<RelevanceTier, string> = {
  essencial: "bg-gold/20 text-gold border border-gold/30",
  muito_relevante: "bg-gold/12 text-gold-soft border border-gold/20",
  relevante: "bg-ink-600 text-sand",
  monitorar: "bg-ink-600 text-sand-muted",
  baixa: "bg-ink-700 text-sand-muted/70",
};

export function TierBadge({ tier }: { tier: RelevanceTier | null }) {
  if (!tier) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", TIER_TONE[tier])}>
      {TIER_LABELS[tier]}
    </span>
  );
}

/** Medidor circular de nota 0–100 (nota de oportunidade / potencial). */
export function ScoreRing({
  value,
  label,
  size = 56,
}: {
  value: number | null;
  label?: string;
  size?: number;
}) {
  const v = value ?? 0;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const color = v >= 80 ? "#c9a24b" : v >= 60 ? "#d9bd77" : v >= 40 ? "#a99f8a" : "#6b6659";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(232,225,212,0.10)" strokeWidth={4} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={4}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-sand">
          {value ?? "—"}
        </span>
      </div>
      {label && <span className="text-[10px] uppercase tracking-wide text-sand-muted">{label}</span>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-sand-muted">{label}</span>
        {icon && <span className="text-gold/70">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-3xl text-sand">{value}</div>
      {hint && <p className="mt-1 text-xs text-sand-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <p className="font-display text-lg text-sand">{title}</p>
      {description && <p className="max-w-md text-sm text-sand-muted">{description}</p>}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl text-sand">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-sand-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
