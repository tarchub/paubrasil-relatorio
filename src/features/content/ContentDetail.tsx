import Link from "next/link";
import { LanguageToggle } from "@/features/content/LanguageToggle";
import { CreateOpportunityButton } from "@/features/opportunities/CreateOpportunityButton";
import { Badge, TierBadge, ScoreRing } from "@/components/ui";
import { IconExternal, IconArrow } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import type { ContentWithMeta } from "./queries";
import type { ContentAiAnalysis } from "@/types/database";

/**
 * Apresentação da análise completa de um conteúdo.
 * Separado da página para manter a busca de dados fora da camada visual.
 */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="border-b border-line2 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-sand-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-sand">{value}</dd>
    </div>
  );
}

/** Rótulos legíveis para as subnotas da nota de oportunidade. */
const BREAKDOWN_LABELS: Record<string, string> = {
  novidade_brasil: "Novidade no Brasil",
  potencial_faturamento: "Potencial de faturamento",
  facilidade_implementacao: "Facilidade de implementação",
  potencial_recorrencia: "Potencial de recorrência",
  demanda_provavel: "Demanda provável",
  competicao_existente: "Competição existente",
  capacidade_adaptacao: "Capacidade de adaptação",
};

function List({ items }: { items: string[] | null }) {
  if (!items?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => <li key={i}><Badge tone="outline">{t}</Badge></li>)}
    </ul>
  );
}

export function ContentDetail({
  content,
  analysis,
}: {
  content: ContentWithMeta;
  analysis: ContentAiAnalysis | null;
}) {
  return (
    <div className="space-y-8">
      <Link href="/feed" className="inline-flex items-center gap-1 text-sm text-sand-muted hover:text-sand">
        <IconArrow width={16} height={16} className="rotate-180" /> Voltar ao feed
      </Link>

      {/* Cabeçalho */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-sand-muted">
          {content.categories && <Badge tone="gold">{content.categories.name}</Badge>}
          <span>{content.sources?.name}</span>
          {content.author && <><span>·</span><span>{content.author}</span></>}
          <span>·</span>
          <span>{formatDate(content.published_at ?? content.collected_at)}</span>
          <span>·</span>
          <span>{content.country}</span>
          <TierBadge tier={content.relevance_tier} />
        </div>

        <h1 className="font-display text-3xl leading-tight text-sand">
          {content.title_pt ?? content.title}
        </h1>
        {content.title_pt && <p className="text-base italic text-sand-muted">{content.title}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <a href={content.url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <IconExternal width={16} height={16} /> Fonte original
          </a>
          <CreateOpportunityButton contentId={content.id} />
        </div>
      </header>

      {content.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.image_url} alt="" className="max-h-80 w-full rounded-2xl border border-line object-cover" />
      )}

      {/* Notas */}
      <section className="card flex flex-wrap items-center justify-around gap-4 p-6">
        <ScoreRing value={analysis?.opportunity_score ?? null} label="Oportunidade" size={72} />
        <ScoreRing value={content.br_potential_score} label="Potencial BR" />
        <ScoreRing value={content.novelty_score} label="Novidade" />
        <ScoreRing value={content.relevance_score ? Math.round(content.relevance_score) : null} label="Relevância" />
      </section>

      {!analysis && (
        <div className="card p-6 text-sm text-sand-muted">
          Este conteúdo ainda não foi processado pela IA. Rode o processamento em{" "}
          <Link href="/admin" className="text-gold hover:underline">Administração</Link>.
        </div>
      )}

      {/* Conteúdo / tradução */}
      {(content.excerpt || analysis?.translated_body) && (
        <section>
          <h2 className="mb-3 font-display text-xl text-sand">Conteúdo</h2>
          <LanguageToggle
            original={content.excerpt}
            translated={analysis?.translated_body ?? analysis?.summary_pt ?? null}
          />
        </section>
      )}

      {analysis && (
        <>
          {/* Resumo executivo + aprendizados */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="mb-2 font-display text-lg text-sand">Resumo executivo</h2>
              <p className="text-sm leading-relaxed text-sand-muted">{analysis.summary_pt}</p>
            </div>
            <div className="card p-6">
              <h2 className="mb-2 font-display text-lg text-sand">Principais aprendizados</h2>
              <ul className="space-y-2">
                {(analysis.key_learnings ?? []).map((k, i) => (
                  <li key={i} className="flex gap-2 text-sm text-sand-muted">
                    <span className="text-gold">›</span> {k}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Estrutura identificada */}
          <section className="card p-6">
            <h2 className="mb-3 font-display text-lg text-sand">Estrutura identificada</h2>
            <dl className="grid gap-x-8 md:grid-cols-2">
              <Field label="Estratégia" value={analysis.strategy} />
              <Field label="Público envolvido" value={analysis.audience} />
              <Field label="Modelo de monetização" value={analysis.monetization} />
              <Field label="Possível funil" value={analysis.funnel} />
              <Field label="Possível oferta" value={analysis.offer} />
              <Field label="Ferramentas utilizadas" value={<List items={analysis.tools} />} />
            </dl>
          </section>

          {/* Como aplicar no Brasil */}
          <section className="card border-gold/20 bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <h2 className="font-display text-xl text-gold">Como aplicar no Brasil</h2>
            </div>
            <dl className="grid gap-x-8 md:grid-cols-2">
              <Field label="Já é comum no Brasil?" value={analysis.br_is_common == null ? null : analysis.br_is_common ? "Sim" : "Não"} />
              <Field label="Maturidade no mercado BR" value={analysis.br_maturity} />
              <Field label="Nichos brasileiros" value={<List items={analysis.br_niches} />} />
              <Field label="Como adaptar" value={analysis.br_adaptation} />
              <Field label="Dificuldades" value={analysis.br_difficulties} />
              <Field label="Investimento inicial" value={analysis.br_initial_investment} />
              <Field label="Pode virar" value={analysis.br_product_type} />
              <Field label="Versão mínima (MVP)" value={analysis.br_mvp} />
              <Field label="Potencial de recorrência" value={analysis.br_recurrence_potential} />
              <Field label="Dificuldade de execução" value={analysis.br_execution_difficulty} />
              <Field label="Velocidade de validação" value={analysis.br_validation_speed} />
            </dl>
          </section>

          {/* Nota de oportunidade */}
          {analysis.opportunity_breakdown && (
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg text-sand">Nota de oportunidade</h2>
                <span className="font-display text-3xl text-gold">{analysis.opportunity_score}/100</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(analysis.opportunity_breakdown as Record<string, number>).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs text-sand-muted">
                      <span className="first-letter:uppercase">
                        {BREAKDOWN_LABELS[k] ?? k.replace(/_/g, " ")}
                      </span>
                      <span>{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-ink-600">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
