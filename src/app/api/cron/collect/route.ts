import { NextResponse, type NextRequest } from "next/server";
import { authorizeCron, unauthorized } from "@/lib/api";
import { collectAll } from "@/features/collection/service";
import type { SourcePriority } from "@/types/database";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) return unauthorized();

  const priority = request.nextUrl.searchParams.get("priority") as SourcePriority | null;
  try {
    const results = await collectAll(priority ?? undefined);
    const totals = results.reduce(
      (acc, r) => ({
        inserted: acc.inserted + r.inserted,
        skipped: acc.skipped + r.skipped,
        found: acc.found + r.found,
      }),
      { inserted: 0, skipped: 0, found: 0 },
    );
    return NextResponse.json({ priority, sources: results.length, totals });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro na coleta." },
      { status: 500 },
    );
  }
}
