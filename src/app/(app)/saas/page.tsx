import { EmptyState } from "@/components/ui";

export default function SaasPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Inteligência</p>
        <h1 className="mt-1 font-display text-3xl text-sand">Radar de SaaS</h1>
      </header>
      <EmptyState
        title="Módulo da Fase 2"
        description="A tabela saas_tools já contempla todos os campos do escopo (modelo de cobrança, planos, recorrência, concorrentes, potencial BR, nota de oportunidade). A tela com filtros entra na próxima fase."
      />
    </div>
  );
}
