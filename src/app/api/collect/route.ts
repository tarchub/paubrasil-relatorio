import { NextResponse, type NextRequest } from "next/server";
import { requireUser, unauthorized, rateLimit } from "@/lib/api";
import { collectAll, collectSource } from "@/features/collection/service";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Disparo manual de coleta a partir da UI (admin). */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();
  if (!rateLimit(`collect:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const sourceId: string | undefined = body?.sourceId;

  try {
    if (sourceId) {
      const supabase = createAdminClient();
      const { data: source } = await supabase
        .from("sources")
        .select("id, name, feed_url")
        .eq("id", sourceId)
        .single();
      if (!source) return NextResponse.json({ error: "Fonte não encontrada." }, { status: 404 });
      const result = await collectSource(source);
      return NextResponse.json({ results: [result] });
    }
    const results = await collectAll();
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro na coleta." },
      { status: 500 },
    );
  }
}
