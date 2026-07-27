import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/features/admin/AdminActions";
import { SourceRow } from "@/features/admin/SourceRow";
import { createSource } from "@/features/admin/actions";
import { SectionTitle, StatCard } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/utils";
import { isAiConfigured } from "@/lib/ai/provider";
import { getServerEnv } from "@/lib/env";
import type { Source, CollectionLog, AiUsageLog } from "@/types/database";

export const dynamic = "force-dynamic";

const SOURCE_TYPES = [
  "blog", "newsletter", "tech", "startup", "saas_directory", "podcast",
  "youtube", "community", "report", "trends", "profile", "other",
];

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ data: sources }, { data: logs }, { data: usage }, pendingCount, aiCost] =
    await Promise.all([
      supabase.from("sources").select("*").order("priority").order("name"),
      supabase.from("collection_logs").select("*").order("started_at", { ascending: false }).limit(10),
      supabase.from("ai_usage_logs").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("contents").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("ai_usage_logs").select("output_tokens"),
    ]);

  const env = getServerEnv();
  const aiOk = isAiConfigured();
  const totalTokens = (aiCost.data ?? []).reduce((a, u) => a + (u.output_tokens ?? 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Administração</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Painel administrativo</h1>
      </header>

      {/* Status */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Fontes ativas" value={(sources ?? []).filter((s) => s.is_active).length} />
        <StatCard label="Na fila (IA)" value={pendingCount.count ?? 0} />
        <StatCard label="Provedor de IA" value={env.AI_PROVIDER} hint={aiOk ? "configurado" : "sem chave"} />
        <StatCard label="Tokens (saída)" value={totalTokens} hint="uso registrado" />
      </section>

      {!aiOk && (
        <div className="card border-gold/20 bg-gold/[0.05] p-4 text-sm text-sand-muted">
          A chave da IA não está configurada. Defina <code className="text-gold">ANTHROPIC_API_KEY</code> (ou{" "}
          <code className="text-gold">OPENAI_API_KEY</code>) no <code>.env.local</code> para habilitar tradução,
          resumo, classificação e análise de potencial no Brasil.
        </div>
      )}

      <AdminActions />

      {/* Cadastro de fonte */}
      <section className="card p-5">
        <SectionTitle title="Cadastrar fonte" subtitle="Adicione um feed RSS/Atom." />
        <form action={createSource} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Nome</label>
            <input name="name" required className="input" placeholder="Ex.: Indie Hackers" />
          </div>
          <div>
            <label className="label">Site (URL)</label>
            <input name="url" className="input" placeholder="https://…" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Feed RSS/Atom</label>
            <input name="feed_url" className="input" placeholder="https://…/feed" />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select name="type" className="input" defaultValue="blog">
              {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prioridade</label>
              <select name="priority" className="input" defaultValue="media">
                <option value="alta">alta</option>
                <option value="media">média</option>
                <option value="baixa">baixa</option>
              </select>
            </div>
            <div>
              <label className="label">Autoridade (0–100)</label>
              <input name="authority" type="number" min={0} max={100} defaultValue={60} className="input" />
            </div>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Adicionar fonte</button>
          </div>
        </form>
      </section>

      {/* Lista de fontes */}
      <section className="card p-5">
        <SectionTitle title="Fontes cadastradas" subtitle={`${sources?.length ?? 0} fonte(s)`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-sand-muted">
                <th className="pb-2 pr-4 font-medium">Fonte</th>
                <th className="px-2 pb-2 font-medium">Tipo</th>
                <th className="px-2 pb-2 font-medium">Prior.</th>
                <th className="px-2 pb-2 text-center font-medium">Autor.</th>
                <th className="px-2 pb-2 text-center font-medium">Status</th>
                <th className="px-2 pb-2 text-center font-medium">Termos</th>
                <th className="px-2 pb-2 text-center font-medium">Última</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {(sources as Source[] | null)?.map((s) => <SourceRow key={s.id} source={s} />)}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logs */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <SectionTitle title="Logs de coleta" />
          <ul className="space-y-2 text-sm">
            {(logs as CollectionLog[] | null)?.map((l) => (
              <li key={l.id} className="flex items-center justify-between border-b border-line2 py-2">
                <span className={l.status === "error" ? "text-red-300" : "text-sand-muted"}>
                  {l.status === "error" ? "erro" : `+${l.items_new} novos`} · {l.items_found} encontrados
                </span>
                <span className="text-xs text-sand-muted">{timeAgo(l.started_at)}</span>
              </li>
            )) ?? null}
            {!logs?.length && <li className="text-sand-muted">Nenhum log ainda.</li>}
          </ul>
        </div>
        <div className="card p-5">
          <SectionTitle title="Consumo de IA" />
          <ul className="space-y-2 text-sm">
            {(usage as AiUsageLog[] | null)?.map((u) => (
              <li key={u.id} className="flex items-center justify-between border-b border-line2 py-2">
                <span className="text-sand-muted">{u.operation} · {u.model}</span>
                <span className="text-xs text-sand-muted">{u.output_tokens ?? 0} tok · {formatDate(u.created_at)}</span>
              </li>
            )) ?? null}
            {!usage?.length && <li className="text-sand-muted">Nenhuma chamada registrada.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
