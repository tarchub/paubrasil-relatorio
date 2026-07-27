import { getDashboardStats, getFeed } from "@/features/content/queries";
import { DashboardView } from "@/features/content/DashboardView";
import { createClient } from "@/lib/supabase/server";
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

  return <DashboardView stats={stats} feed={feed} briefing={briefing} />;
}
