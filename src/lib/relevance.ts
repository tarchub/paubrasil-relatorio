import type { RelevanceTier } from "@/types/database";

/**
 * Sistema de relevância. Combina sinais de recência, autoridade da fonte,
 * novidade e potencial para o Brasil em uma nota 0–100. Transparente e ajustável.
 */

export type RelevanceInput = {
  publishedAt: string | null;
  sourceAuthority: number; // 0–100
  noveltyScore: number | null; // 0–100
  brPotentialScore: number | null; // 0–100
  opportunityScore: number | null; // 0–100
};

const WEIGHTS = {
  recency: 0.2,
  authority: 0.2,
  novelty: 0.2,
  brPotential: 0.25,
  opportunity: 0.15,
};

/** Decaimento de recência: 100 no dia, ~50 em 7 dias, tende a 0 depois. */
function recencyScore(publishedAt: string | null): number {
  if (!publishedAt) return 40;
  const days = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  if (days <= 0) return 100;
  return Math.max(0, Math.round(100 * Math.exp(-days / 10)));
}

export function computeRelevance(input: RelevanceInput): number {
  const recency = recencyScore(input.publishedAt);
  const authority = clamp(input.sourceAuthority);
  const novelty = clamp(input.noveltyScore ?? 50);
  const br = clamp(input.brPotentialScore ?? 50);
  const opp = clamp(input.opportunityScore ?? 50);

  const score =
    recency * WEIGHTS.recency +
    authority * WEIGHTS.authority +
    novelty * WEIGHTS.novelty +
    br * WEIGHTS.brPotential +
    opp * WEIGHTS.opportunity;

  return Math.round(score * 100) / 100;
}

export function tierFromScore(score: number): RelevanceTier {
  if (score >= 85) return "essencial";
  if (score >= 70) return "muito_relevante";
  if (score >= 50) return "relevante";
  if (score >= 30) return "monitorar";
  return "baixa";
}

export const TIER_LABELS: Record<RelevanceTier, string> = {
  essencial: "Essencial",
  muito_relevante: "Muito relevante",
  relevante: "Relevante",
  monitorar: "Monitorar",
  baixa: "Baixa prioridade",
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
