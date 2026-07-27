import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import { timeAgo } from "@/lib/utils";
import type { ContentWithMeta } from "@/features/content/queries";

export const dynamic = "force-dynamic";

async function search(q: string): Promise<ContentWithMeta[]> {
  if (!q.trim()) return [];
  const supabase = await createClient();
  // Full-text (português) com fallback ilike para termos em inglês/parciais.
  const terms = q.trim().split(/\s+/).join(" | ");
  const { data } = await supabase
    .from("contents")
    .select("*, categories(name, slug, color), sources(name)")
    .or(`title.ilike.%${q}%,title_pt.ilike.%${q}%,excerpt.ilike.%${q}%`)
    .textSearch("search_vector", terms, { type: "websearch", config: "portuguese" })
    .limit(40);

  if (data?.length) return data as ContentWithMeta[];

  // Fallback puro ilike (cobre inglês sem stemming português)
  const { data: fallback } = await supabase
    .from("contents")
    .select("*, categories(name, slug, color), sources(name)")
    .or(`title.ilike.%${q}%,title_pt.ilike.%${q}%,excerpt.ilike.%${q}%`)
    .limit(40);
  return (fallback ?? []) as ContentWithMeta[];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await search(q) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Busca</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Busca global</h1>
        <p className="mt-1 text-sm text-sand-muted">Pesquise em português ou inglês.</p>
      </header>

      <form method="get" className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-muted" />
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Ex.: agentes de IA, community, funil de quiz, Hormozi…"
          className="input pl-11"
        />
      </form>

      {q && (
        <p className="text-sm text-sand-muted">
          {results.length} resultado(s) para “{q}”
        </p>
      )}

      {q && results.length === 0 && (
        <EmptyState title="Nada encontrado" description="Tente outros termos ou sinônimos." />
      )}

      <div className="space-y-2">
        {results.map((c) => (
          <Link
            key={c.id}
            href={`/feed/${c.id}`}
            className="card flex items-center gap-4 p-4 transition-colors hover:border-gold/25"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-sand-muted">
                {c.categories && <Badge tone="gold">{c.categories.name}</Badge>}
                <span>{c.sources?.name}</span>
                <span>·</span>
                <span>{timeAgo(c.published_at ?? c.collected_at)}</span>
              </div>
              <p className="truncate font-display text-sand">{c.title_pt ?? c.title}</p>
              {c.excerpt && <p className="mt-0.5 truncate text-sm text-sand-muted">{c.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
