import { ContentCard } from "@/features/content/ContentCard";
import { FeedFilters } from "@/features/content/FeedFilters";
import { EmptyState } from "@/components/ui";
import type { ContentWithMeta } from "./queries";

/** Apresentação do feed de inteligência. Os dados são buscados na página. */
export function FeedView({
  feed,
  categories,
}: {
  feed: ContentWithMeta[];
  categories: { slug: string; name: string }[];
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Inteligência</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Feed de inteligência</h1>
      </header>

      <FeedFilters categories={categories} />

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
