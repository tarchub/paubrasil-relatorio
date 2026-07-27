import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/provider";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getServerEnv();
  return NextResponse.json({
    status: "ok",
    ai: { provider: env.AI_PROVIDER, configured: isAiConfigured() },
    time: new Date().toISOString(),
  });
}
