import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Autoriza chamadas de cron via header `Authorization: Bearer <CRON_SECRET>`.
 * A Vercel injeta esse header automaticamente para cron jobs quando CRON_SECRET
 * está definido nas variáveis de ambiente do projeto.
 *
 * Falha fechado: sem CRON_SECRET em produção, nega. Isso evita que as rotas de
 * coleta/processamento fiquem abertas (e consumindo API de IA) por esquecimento.
 * Em desenvolvimento, libera para facilitar testes locais.
 */
export function authorizeCron(request: NextRequest): boolean {
  const { CRON_SECRET } = getServerEnv();
  if (!CRON_SECRET) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${CRON_SECRET}`;
}

/** Exige usuário autenticado (para disparos manuais a partir da UI). */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}

// Rate limit simples em memória (por instância). Suficiente para uso próprio.
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
