import { createClient } from "@/lib/supabase/server";
import { OpportunityCard } from "@/features/opportunities/OpportunityCard";
import { EmptyState } from "@/components/ui";
import type { Opportunity } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const { novo } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });
  const opps = (data ?? []) as Opportunity[];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Meu espaço</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Banco de oportunidades</h1>
        <p className="mt-1 text-sm text-sand-muted">
          Ideias práticas geradas a partir de conteúdos, prontas para virar projeto.
        </p>
      </header>

      {opps.length ? (
        <div className="space-y-4">
          {opps.map((o) => <OpportunityCard key={o.id} opp={o} highlight={o.id === novo} />)}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma oportunidade ainda"
          description="Abra a análise de um conteúdo no feed e clique em 'Transformar em oportunidade'."
        />
      )}
    </div>
  );
}
