import "server-only";
import { chat, parseJson, isAiConfigured } from "./provider";
import { ANALYZE_SYSTEM, analyzeUserPrompt, BRIEFING_SYSTEM, briefingUserPrompt } from "./prompts";

export { isAiConfigured };

export type AnalysisResult = {
  title_pt: string;
  category_slug: string;
  summary_pt: string;
  key_learnings: string[];
  strategy: string;
  audience: string;
  monetization: string;
  tools: string[];
  funnel: string;
  offer: string;
  companies: string[];
  tags: string[];
  novelty_score: number;
  br_potential_score: number;
  br: {
    is_common: boolean;
    maturity: string;
    niches: string[];
    adaptation: string;
    difficulties: string;
    initial_investment: string;
    product_type: string;
    mvp: string;
    recurrence_potential: string;
    execution_difficulty: string;
    validation_speed: string;
  };
  opportunity_score: number;
  opportunity_breakdown: Record<string, number>;
};

export type AnalyzeInput = {
  title: string;
  excerpt: string | null;
  source: string | null;
  url: string;
  categories: string[];
};

/** Analisa um conteúdo: tradução, resumo, classificação e "Como aplicar no Brasil". */
export async function analyzeContent(
  input: AnalyzeInput,
): Promise<{ result: AnalysisResult; model: string; tokens: number }> {
  const res = await chat({
    system: ANALYZE_SYSTEM,
    user: analyzeUserPrompt(input),
    json: true,
    maxTokens: 2500,
  });
  const result = parseJson<AnalysisResult>(res.text);
  return {
    result,
    model: res.model,
    tokens: res.inputTokens + res.outputTokens,
  };
}

export type BriefingResult = {
  intro_pt: string;
  top_news: Array<{ title: string; why: string }>;
  trends: Array<{ name: string; note: string }>;
  saas: Array<{ name: string; note: string }>;
  strategies: Array<{ name: string; note: string }>;
  top_opportunity: { name: string; note: string };
  alerts: string[];
  recommended: string[];
};

export async function generateBriefing(
  items: Parameters<typeof briefingUserPrompt>[0],
): Promise<{ result: BriefingResult; model: string; tokens: number }> {
  const res = await chat({
    system: BRIEFING_SYSTEM,
    user: briefingUserPrompt(items),
    json: true,
    maxTokens: 2000,
  });
  const result = parseJson<BriefingResult>(res.text);
  return { result, model: res.model, tokens: res.inputTokens + res.outputTokens };
}
