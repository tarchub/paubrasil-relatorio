import { createClient } from "@/lib/supabase/server";
import { EmptyState, SectionTitle } from "@/components/ui";
import { createCollection, deleteCollection } from "@/features/collections/actions";
import { IconFolder, IconStar } from "@/components/icons";
import type { Collection } from "@/types/database";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "Ideias para a Mavic", "SaaS para construir", "Estratégias para clientes",
  "Funis para testar", "Ofertas brasileiras", "Tendências de IA", "Produtos recorrentes",
];

export default async function CollectionsPage() {
  const supabase = await createClient();
  const [{ data: collections }, { data: saved }] = await Promise.all([
    supabase.from("collections").select("*, collection_items(count)").order("created_at", { ascending: false }),
    supabase.from("contents").select("id, title, title_pt").eq("is_saved", true).limit(20),
  ]);

  const cols = (collections ?? []) as (Collection & { collection_items: { count: number }[] })[];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Meu espaço</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Coleções & Favoritos</h1>
      </header>

      {/* Criar coleção */}
      <section className="card p-5">
        <SectionTitle title="Nova coleção" />
        <form action={createCollection} className="flex flex-wrap items-end gap-3">
          <div className="w-16">
            <label className="label">Emoji</label>
            <input name="emoji" defaultValue="⭐" maxLength={2} className="input text-center" />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="label">Nome</label>
            <input name="name" required placeholder="Ex.: SaaS para construir" className="input" list="sug" />
            <datalist id="sug">
              {SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="label">Descrição (opcional)</label>
            <input name="description" className="input" />
          </div>
          <button className="btn-primary">Criar</button>
        </form>
      </section>

      {/* Coleções */}
      <section>
        <SectionTitle title="Suas coleções" />
        {cols.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cols.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{c.emoji}</span>
                  <form action={deleteCollection.bind(null, c.id)}>
                    <button className="text-xs text-sand-muted hover:text-red-300">Excluir</button>
                  </form>
                </div>
                <h3 className="mt-2 font-display text-lg text-sand">{c.name}</h3>
                {c.description && <p className="mt-0.5 text-sm text-sand-muted">{c.description}</p>}
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-sand-muted">
                  <IconFolder width={14} height={14} /> {c.collection_items?.[0]?.count ?? 0} item(ns)
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma coleção" description="Crie sua primeira coleção acima." />
        )}
      </section>

      {/* Favoritos */}
      <section>
        <SectionTitle title="Conteúdos salvos" subtitle="Itens marcados como favoritos no feed." />
        {saved?.length ? (
          <div className="card divide-y divide-line2">
            {saved.map((s) => (
              <a key={s.id} href={`/feed/${s.id}`} className="flex items-center gap-3 p-4 hover:bg-ink-700/40">
                <IconStar width={16} height={16} className="text-gold" />
                <span className="truncate text-sm text-sand">{s.title_pt ?? s.title}</span>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum favorito" description="Use o ícone de marcador nos cards do feed." />
        )}
      </section>
    </div>
  );
}
