/** Utilitários gerais de UI/formatação. */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const RTF = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function timeAgo(date: string | Date | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (d.getTime() - Date.now()) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return RTF.format(Math.round(diff / secs), unit);
  }
  return "agora";
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Faixa de cores para notas 0–100. */
export function scoreColor(score: number | null): string {
  if (score == null) return "text-sand-muted";
  if (score >= 80) return "text-gold";
  if (score >= 60) return "text-gold-soft";
  if (score >= 40) return "text-sand";
  return "text-sand-muted";
}
