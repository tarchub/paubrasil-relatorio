import { getFeed, type FeedFilter } from "@/features/content/queries";
import { ContentCard } from "@/features/content/ContentCard";
import { FeedFilters } from "@/features/content/FeedFilters";
import { EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories").select("slug, name").order("name");

  const filter: FeedFilter = {
    period: (sp.period as FeedFilter["period"]) || undefined,
    sort: (sp.sort as FeedFilter["sort"]) || "relevance",
    category: sp.category || undefined,
    unread: Boolean(sp.unread),
    saved: Boolean(sp.saved),
    limit: 48,
  };

  const feed = await getFeed(filter);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Inteligência</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Feed de inteligência</h1>
      </header>

      <FeedFilters categories={categories ?? []} />

      <p className="text-sm text-sand-muted">{feed.length} conteúdo(s)</p>

      {feed.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feed.map((c) => <ContentCard key={c.id} content={c} />)}
        </div>
      ) : (
        <EmptyState
          title="Nenhum conteúdo encontrado"
          description="Ajuste os filtros ou rode a coleta em Administração."
        />
      )}
    </div>
  );
}
