import { NextResponse, type NextRequest } from "next/server";
import { authorizeCron, unauthorized } from "@/lib/api";
import { processPending } from "@/features/collection/process";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) return unauthorized();
  try {
    const summary = await processPending(15);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no processamento." },
      { status: 500 },
    );
  }
}
