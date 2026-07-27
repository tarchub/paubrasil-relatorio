import { NextResponse, type NextRequest } from "next/server";
import { authorizeCron, unauthorized } from "@/lib/api";
import { processPending } from "@/features/collection/process";
import { generateDailyBriefing } from "@/features/briefing/service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Processa a fila de IA e, em seguida, gera o briefing do dia.
 * Os dois passos ficam juntos para caber no limite de cron jobs do plano Hobby
 * da Vercel (2). Em planos superiores, dá para separar em /api/cron/briefing,
 * que continua existindo e pode ser agendada à parte.
 */
export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) return unauthorized();
  try {
    const summary = await processPending(15);

    let briefing: Awaited<ReturnType<typeof generateDailyBriefing>> | { error: string };
    try {
      briefing = await generateDailyBriefing();
    } catch (err) {
      // Uma falha no briefing não deve invalidar o processamento já concluído.
      briefing = { error: err instanceof Error ? err.message : "Erro ao gerar briefing." };
    }

    return NextResponse.json({ ...summary, briefing });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no processamento." },
      { status: 500 },
    );
  }
}
