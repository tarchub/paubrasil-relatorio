import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { generateBriefing, isAiConfigured } from "@/lib/ai/analyze";

/** Gera (ou regenera) o "Radar diário do mercado americano" para hoje. */
export async function generateDailyBriefing(): Promise<{ date: string; created: boolean; reason?: string }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  if (!isAiConfigured()) {
    return { date: today, created: false, reason: "IA não configurada." };
  }

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: contents } = await supabase
    .from("contents")
    .select("title, title_pt, br_potential_score, category_id, categories(name), content_ai_analyses(summary_pt)")
    .eq("status", "processed")
    .gte("collected_at", since)
    .order("relevance_score", { ascending: false })
    .limit(25)
    .returns<
      Array<{
        title: string;
        title_pt: string | null;
        br_potential_score: number | null;
        category_id: string | null;
        categories: { name: string } | null;
        content_ai_analyses: { summary_pt: string | null } | null;
      }>
    >();

  if (!contents?.length) {
    return { date: today, created: false, reason: "Sem conteúdos processados nas últimas 24h." };
  }

  const items = contents.map((c) => ({
    title: c.title,
    title_pt: c.title_pt,
    summary: (c as any).content_ai_analyses?.summary_pt ?? null,
    category: (c as any).categories?.name ?? null,
    br_potential: c.br_potential_score,
  }));

  const { result, model } = await generateBriefing(items);

  await supabase.from("briefings").upsert(
    {
      date: today,
      title: "Radar diário do mercado americano",
      intro_pt: result.intro_pt,
      top_news: result.top_news,
      trends: result.trends,
      saas: result.saas,
      strategies: result.strategies,
      top_opportunity: result.top_opportunity,
      alerts: result.alerts,
      recommended: result.recommended,
      model_used: model,
    },
    { onConflict: "date" },
  );

  return { date: today, created: true };
}
