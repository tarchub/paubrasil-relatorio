import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase para Server Components / Server Actions / Route Handlers.
 * Usa a sessão do usuário (cookies) e respeita RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component: ignorável (middleware renova a sessão).
          }
        },
      },
    },
  );
}

/**
 * Client com service_role — ignora RLS. USAR APENAS no servidor,
 * em rotas de coleta/IA/cron. Nunca importe isto em código de cliente.
 */
export function createAdminClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente. Necessária para coleta/IA server-side.",
    );
  }
  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
