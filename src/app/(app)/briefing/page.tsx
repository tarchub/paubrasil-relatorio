import { createClient } from "@/lib/supabase/server";
import { BriefingView } from "@/features/briefing/BriefingView";
import type { Briefing } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("briefings").select("*").order("date", { ascending: false }).limit(1).maybeSingle();

  return <BriefingView briefing={(data as Briefing | null) ?? null} />;
}
