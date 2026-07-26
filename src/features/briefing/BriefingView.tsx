import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { IconBriefing } from "@/components/icons";
import type { Briefing } from "@/types/database";

type Item = { title?: string; name?: string; note?: string; why?: string };

function Block({ title, items }: { title: string; items: Item[] | null }) {
  if (!items?.length) return null;
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-display text-lg text-sand">{title}</h3>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 text-gold">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-sand">{it.title ?? it.name}</p>
              {(it.note ?? it.why) && <p className="text-sand-muted">{it.note ?? it.why}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ date }: { date: string | null }) {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Briefing</p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="font-display text-3xl text-sand">Radar diário do mercado americano</h1>
      </div>
      {date && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-sand-muted">
          <IconBriefing width={15} height={15} /> {formatDate(date)}
        </p>
      )}
    </header>
  );
}

/** Apresentação do briefing diário. Os dados são buscados na página. */
export function BriefingView({ briefing }: { briefing: Briefing | null }) {
  if (!briefing) {
    return (
      <div className="space-y-6">
        <Header date={null} />
        <EmptyState
          title="Nenhum briefing gerado"
          description="O 'Radar diário' é montado por IA a partir dos conteúdos das últimas 24h. Rode a coleta, o processamento e depois o briefing em Administração."
        />
      </div>
    );
  }

  const asItems = (v: unknown) => (Array.isArray(v) ? (v as Item[]) : null);
  const topOpp = briefing.top_opportunity as Item | null;

  return (
    <div className="space-y-6">
      <Header date={briefing.date} />

      {briefing.intro_pt && (
        <div className="card border-gold/20 bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
          <p className="font-display text-lg leading-relaxed text-sand">{briefing.intro_pt}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Principais novidades" items={asItems(briefing.top_news)} />
        <Block title="Tendências em crescimento" items={asItems(briefing.trends)} />
        <Block title="SaaS encontrados" items={asItems(briefing.saas)} />
        <Block title="Estratégias para testar" items={asItems(briefing.strategies)} />
      </div>

      {topOpp && (
        <div className="card border-gold/30 p-6">
          <p className="mb-1 text-xs uppercase tracking-wide text-gold">Oportunidade de alto potencial no Brasil</p>
          <h3 className="font-display text-xl text-sand">{topOpp.name ?? topOpp.title}</h3>
          {topOpp.note && <p className="mt-1 text-sm text-sand-muted">{topOpp.note}</p>}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.isArray(briefing.alerts) && (briefing.alerts as string[]).length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 font-display text-lg text-sand">Alertas importantes</h3>
            <ul className="space-y-2">
              {(briefing.alerts as string[]).map((a, i) => (
                <li key={i} className="text-sm text-sand-muted">• {a}</li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(briefing.recommended) && (briefing.recommended as string[]).length > 0 && (
          <div className="card p-5">
            <h3 className="mb-3 font-display text-lg text-sand">Leituras recomendadas</h3>
            <ul className="space-y-2">
              {(briefing.recommended as string[]).map((r, i) => (
                <li key={i} className="text-sm text-sand-muted">• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
