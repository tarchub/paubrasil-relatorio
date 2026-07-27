import { z } from "zod";

/**
 * Validação centralizada de variáveis de ambiente.
 * Variáveis do servidor NUNCA são expostas ao cliente (não têm prefixo NEXT_PUBLIC_).
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_USE_MOCKS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  AI_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CRON_SECRET: z.string().optional(),
  PRODUCT_HUNT_TOKEN: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),
});

// Cliente: valida no bundle do browser (apenas variáveis públicas).
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
});

/**
 * Só deve ser chamado em código server-side (Route Handlers, Server Actions).
 */
export function getServerEnv() {
  return serverSchema.parse(process.env);
}
