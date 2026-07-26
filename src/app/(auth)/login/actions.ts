"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { clientEnv } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  next: z.string().optional(),
});

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: "E-mail ou senha incorretos." };

  redirect(parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "/dashboard");
}

const recoverSchema = z.object({ email: z.string().email("E-mail inválido.") });

export async function recoverPassword(
  _prev: AuthState & { sent?: boolean },
  formData: FormData,
): Promise<AuthState & { sent?: boolean }> {
  const parsed = recoverSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/login`,
  });
  if (error) return { error: "Não foi possível enviar o e-mail de recuperação." };
  return { sent: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
