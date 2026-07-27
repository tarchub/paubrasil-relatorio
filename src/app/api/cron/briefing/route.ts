import { NextResponse, type NextRequest } from "next/server";
import { authorizeCron, unauthorized } from "@/lib/api";
import { generateDailyBriefing } from "@/features/briefing/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) return unauthorized();
  try {
    const result = await generateDailyBriefing();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar briefing." },
      { status: 500 },
    );
  }
}
