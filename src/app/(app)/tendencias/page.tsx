import { EmptyState } from "@/components/ui";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Inteligência</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Radar de tendências</h1>
      </header>
      <EmptyState
        title="Módulo da Fase 2"
        description="A estrutura de dados (tabelas trends e trend_mentions) já está no banco. A tela com agregação por palavra-chave, status e gráfico de crescimento entra na próxima fase, conforme o PLANO-DE-DESENVOLVIMENTO.md."
      />
    </div>
  );
}
