import Link from "next/link";
import { getDashboardStats, getFeed } from "@/features/content/queries";
import { ContentCard } from "@/features/content/ContentCard";
import { StatCard, SectionTitle, EmptyState } from "@/components/ui";
import { IconFeed, IconTrend, IconSaas, IconBulb, IconStar, IconBriefing, IconArrow } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Briefing } from "@/types/database";

export const dynamic = "force-dynamic";

async function getLatestBriefing(): Promise<Briefing | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("briefings").select("*").order("date", { ascending: false }).limit(1).maybeSingle();
  return data as Briefing | null;
}

export default async function DashboardPage() {
  const [stats, feed, briefing] = await Promise.all([
    getDashboardStats(),
    getFeed({ sort: "relevance", limit: 6 }),
    getLatestBriefing(),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-sand-muted">Visão geral</p>
        <h1 className="mt-1 font-display text-3xl text-sand">
          Bom dia. Aqui está o radar de hoje.
        </h1>
      </header>

      {/* Cards de topo */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Novidades hoje" value={stats.today} icon={<IconFeed />} hint="últimas 24h" />
        <StatCard label="Não lidos" value={stats.unread} icon={<IconFeed />} />
        <StatCard label="Alto potencial BR" value={stats.highBrPotential} icon={<IconTrend />} hint="score ≥ 75" />
        <StatCard label="Novos SaaS" value={stats.newSaas} icon={<IconSaas />} />
        <StatCard label="Processados" value={stats.processed} icon={<IconBulb />} />
        <StatCard label="Salvos" value={stats.saved} icon={<IconStar />} />
      </section>

      {/* O que você precisa saber hoje */}
      <section>
        <SectionTitle
          title="O que você precisa saber hoje"
          subtitle="Briefing gerado por IA com as principais mudanças das últimas 24 horas."
          action={
            <Link href="/briefing" className="btn-ghost px-3 py-1.5 text-xs">
              <IconBriefing width={16} height={16} /> Radar completo
            </Link>
          }
        />
        {briefing ? (
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-sand-muted">
              <span className="chip"><IconBriefing width={13} height={13} /> {formatDate(briefing.date)}</span>
            </div>
            <p className="font-display text-lg leading-relaxed text-sand">{briefing.intro_pt}</p>
            <Link href="/briefing" className="mt-4 inline-flex items-center gap-1 text-sm text-gold hover:underline">
              Ver briefing completo <IconArrow width={15} height={15} />
            </Link>
          </div>
        ) : (
          <EmptyState
            title="Nenhum briefing ainda"
            description="O briefing diário é gerado automaticamente após a coleta e o processamento de conteúdos. Configure as credenciais e rode a coleta em Administração."
          />
        )}
      </section>

      {/* Destaques do feed */}
      <section>
        <SectionTitle
          title="Destaques do feed"
          subtitle="Conteúdos mais relevantes agora."
          action={
            <Link href="/feed" className="btn-ghost px-3 py-1.5 text-xs">
              Ver feed <IconArrow width={16} height={16} />
            </Link>
          }
        />
        {feed.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feed.map((c) => <ContentCard key={c.id} content={c} />)}
          </div>
        ) : (
          <EmptyState
            title="Feed vazio"
            description="Ainda não há conteúdos coletados. Vá em Administração → Fontes e rode a coleta."
          />
        )}
      </section>
    </div>
  );
}
