import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchFeed } from "@/lib/rss";
import { urlHash, titleHash } from "@/lib/hash";
import type { SourcePriority } from "@/types/database";

/**
 * Serviço de coleta. Usa o client admin (service_role) — apenas server-side.
 * Deduplica por url_hash (unique) antes de inserir.
 */

export type CollectSummary = {
  sourceId: string;
  sourceName: string;
  found: number;
  inserted: number;
  skipped: number;
  status: "ok" | "error";
  error?: string;
};

export async function collectSource(source: {
  id: string;
  name: string;
  feed_url: string | null;
}): Promise<CollectSummary> {
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();
  const summary: CollectSummary = {
    sourceId: source.id,
    sourceName: source.name,
    found: 0,
    inserted: 0,
    skipped: 0,
    status: "ok",
  };

  if (!source.feed_url) {
    summary.status = "error";
    summary.error = "Fonte sem feed_url.";
    await finishLog(source.id, startedAt, summary);
    return summary;
  }

  try {
    const items = await fetchFeed(source.feed_url);
    summary.found = items.length;

    for (const item of items) {
      const uHash = urlHash(item.url);
      const { data: existing } = await supabase
        .from("contents")
        .select("id")
        .eq("url_hash", uHash)
        .maybeSingle();

      if (existing) {
        summary.skipped++;
        continue;
      }

      const { error } = await supabase.from("contents").insert({
        source_id: source.id,
        title: item.title,
        url: item.url,
        url_hash: uHash,
        title_hash: titleHash(item.title),
        author: item.author,
        image_url: item.imageUrl,
        excerpt: item.excerpt,
        published_at: item.publishedAt,
        status: "pending",
      });

      if (error) summary.skipped++;
      else summary.inserted++;
    }

    await supabase
      .from("sources")
      .update({
        last_collected_at: new Date().toISOString(),
        last_status: "ok",
        last_error: null,
      })
      .eq("id", source.id);
  } catch (err) {
    summary.status = "error";
    summary.error = err instanceof Error ? err.message : String(err);
    await supabase
      .from("sources")
      .update({ last_status: "error", last_error: summary.error })
      .eq("id", source.id);
  }

  await finishLog(source.id, startedAt, summary);
  return summary;
}

async function finishLog(sourceId: string, startedAt: string, s: CollectSummary) {
  const supabase = createAdminClient();
  await supabase.from("collection_logs").insert({
    source_id: sourceId,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    items_found: s.found,
    items_new: s.inserted,
    items_skipped: s.skipped,
    status: s.status,
    error: s.error ?? null,
  });
}

/** Coleta todas as fontes ativas (opcionalmente filtrando por prioridade). */
export async function collectAll(priority?: SourcePriority): Promise<CollectSummary[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("sources")
    .select("id, name, feed_url")
    .eq("is_active", true)
    .eq("collection_method", "rss");
  if (priority) query = query.eq("priority", priority);

  const { data: sources, error } = await query;
  if (error) throw error;

  const results: CollectSummary[] = [];
  for (const s of sources ?? []) {
    results.push(await collectSource(s));
  }
  return results;
}
