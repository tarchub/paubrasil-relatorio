import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Content, Category, ContentAiAnalysis } from "@/types/database";

export type ContentWithMeta = Content & {
  categories: Pick<Category, "name" | "slug" | "color"> | null;
  sources: { name: string } | null;
};

export type FeedFilter = {
  period?: "today" | "7d" | "30d";
  sort?: "relevance" | "recent" | "br_potential";
  category?: string; // slug
  sourceId?: string;
  unread?: boolean;
  saved?: boolean;
  limit?: number;
};

function periodSince(period?: string): string | null {
  const now = Date.now();
  if (period === "today") return new Date(now - 24 * 3600 * 1000).toISOString();
  if (period === "7d") return new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  if (period === "30d") return new Date(now - 30 * 24 * 3600 * 1000).toISOString();
  return null;
}

export async function getFeed(filter: FeedFilter = {}): Promise<ContentWithMeta[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contents")
    .select("*, categories(name, slug, color), sources(name)")
    .neq("status", "archived");

  const since = periodSince(filter.period);
  if (since) query = query.gte("collected_at", since);
  if (filter.category) {
    const { data: cat } = await supabase
      .from("categories").select("id").eq("slug", filter.category).maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (filter.sourceId) query = query.eq("source_id", filter.sourceId);
  if (filter.unread) query = query.eq("is_read", false);
  if (filter.saved) query = query.eq("is_saved", true);

  switch (filter.sort) {
    case "recent":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    case "br_potential":
      query = query.order("br_potential_score", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("relevance_score", { ascending: false, nullsFirst: false });
  }

  const { data, error } = await query.limit(filter.limit ?? 40);
  if (error) throw error;
  return (data ?? []) as ContentWithMeta[];
}

export async function getContent(
  id: string,
): Promise<{ content: ContentWithMeta; analysis: ContentAiAnalysis | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("*, categories(name, slug, color), sources(name), content_ai_analyses(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const analysis = ((data as any).content_ai_analyses ?? null) as ContentAiAnalysis | null;
  return { content: data as ContentWithMeta, analysis };
}

export type DashboardStats = {
  today: number;
  unread: number;
  saved: number;
  processed: number;
  newSaas: number;
  highBrPotential: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const counts = await Promise.all([
    supabase.from("contents").select("id", { count: "exact", head: true }).gte("collected_at", since),
    supabase.from("contents").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("contents").select("id", { count: "exact", head: true }).eq("is_saved", true),
    supabase.from("contents").select("id", { count: "exact", head: true }).eq("status", "processed"),
    supabase.from("saas_tools").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("contents").select("id", { count: "exact", head: true }).gte("br_potential_score", 75),
  ]);

  return {
    today: counts[0].count ?? 0,
    unread: counts[1].count ?? 0,
    saved: counts[2].count ?? 0,
    processed: counts[3].count ?? 0,
    newSaas: counts[4].count ?? 0,
    highBrPotential: counts[5].count ?? 0,
  };
}
