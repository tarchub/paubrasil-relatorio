#!/usr/bin/env node
/**
 * Cria o usuário privado da plataforma (uso próprio, sem cadastro público).
 * Uso:
 *   node scripts/create-user.mjs email@dominio.com "SenhaForte123"
 *
 * Requer no ambiente:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Carrega .env.local de forma simples (sem dependências extras).
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* .env.local opcional se as vars já estiverem no ambiente */
}

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Uso: node scripts/create-user.mjs <email> <senha>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Erro ao criar usuário:", error.message);
  process.exit(1);
}
console.log("Usuário criado:", data.user?.email);
