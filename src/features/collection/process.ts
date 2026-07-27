import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { analyzeContent, isAiConfigured } from "@/lib/ai/analyze";
import { computeRelevance, tierFromScore } from "@/lib/relevance";

/**
 * Processa conteúdos pendentes com IA: tradução, resumo, classificação,
 * análise "Como aplicar no Brasil" e cálculo de relevância.
 */

export type ProcessSummary = {
  processed: number;
  failed: number;
  skippedNoAi: boolean;
};

export async function processPending(limit = 10): Promise<ProcessSummary> {
  const supabase = createAdminClient();
  const summary: ProcessSummary = { processed: 0, failed: 0, skippedNoAi: false };

  if (!isAiConfigured()) {
    summary.skippedNoAi = true;
    return summary;
  }

  const { data: pending } = await supabase
    .from("contents")
    .select("id, title, excerpt, url, source_id, published_at, sources(name, authority)")
    .eq("status", "pending")
    .order("collected_at", { ascending: true })
    .limit(limit)
    .returns<
      Array<{
        id: string;
        title: string;
        excerpt: string | null;
        url: string;
        source_id: string | null;
        published_at: string | null;
        sources: { name: string; authority: number } | null;
      }>
    >();

  if (!pending?.length) return summary;

  // Categorias válidas para classificação
  const { data: categories } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((categories ?? []).map((c) => [c.slug, c.id]));
  const catSlugs = [...catMap.keys()];

  for (const item of pending) {
    await supabase.from("contents").update({ status: "processing" }).eq("id", item.id);

    try {
      const src = (item as any).sources as { name: string; authority: number } | null;
      const { result, model, tokens } = await analyzeContent({
        title: item.title,
        excerpt: item.excerpt,
        source: src?.name ?? null,
        url: item.url,
        categories: catSlugs,
      });

      const categoryId = catMap.get(result.category_slug) ?? null;

      const relevance = computeRelevance({
        publishedAt: item.published_at,
        sourceAuthority: src?.authority ?? 50,
        noveltyScore: result.novelty_score,
        brPotentialScore: result.br_potential_score,
        opportunityScore: result.opportunity_score,
      });

      await supabase
        .from("contents")
        .update({
          title_pt: result.title_pt,
          category_id: categoryId,
          novelty_score: result.novelty_score,
          br_potential_score: result.br_potential_score,
          relevance_score: relevance,
          relevance_tier: tierFromScore(relevance),
          status: "processed",
        })
        .eq("id", item.id);

      await supabase.from("content_ai_analyses").upsert(
        {
          content_id: item.id,
          summary_pt: result.summary_pt,
          key_learnings: result.key_learnings,
          strategy: result.strategy,
          audience: result.audience,
          monetization: result.monetization,
          tools: result.tools,
          funnel: result.funnel,
          offer: result.offer,
          br_is_common: result.br.is_common,
          br_maturity: result.br.maturity,
          br_niches: result.br.niches,
          br_adaptation: result.br.adaptation,
          br_difficulties: result.br.difficulties,
          br_initial_investment: result.br.initial_investment,
          br_product_type: result.br.product_type,
          br_mvp: result.br.mvp,
          br_recurrence_potential: result.br.recurrence_potential,
          br_execution_difficulty: result.br.execution_difficulty,
          br_validation_speed: result.br.validation_speed,
          opportunity_score: result.opportunity_score,
          opportunity_breakdown: result.opportunity_breakdown,
          model_used: model,
          tokens_used: tokens,
        },
        { onConflict: "content_id" },
      );

      await supabase.from("ai_usage_logs").insert({
        operation: "analyze",
        model,
        output_tokens: tokens,
        content_id: item.id,
      });

      summary.processed++;
    } catch (err) {
      summary.failed++;
      await supabase
        .from("contents")
        .update({ status: "failed" })
        .eq("id", item.id);
      console.error(`[process] Falha no conteúdo ${item.id}:`, err);
    }
  }

  return summary;
}
