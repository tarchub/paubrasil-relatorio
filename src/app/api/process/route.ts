import { NextResponse, type NextRequest } from "next/server";
import { requireUser, unauthorized, rateLimit } from "@/lib/api";
import { processPending } from "@/features/collection/process";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Disparo manual do processamento de IA (admin). */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();
  if (!rateLimit(`process:${user.id}`, 3, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde." }, { status: 429 });
  }

  try {
    const summary = await processPending(10);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no processamento." },
      { status: 500 },
    );
  }
}
