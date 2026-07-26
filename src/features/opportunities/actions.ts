"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Cria uma oportunidade a partir de um conteúdo, reaproveitando a análise de IA
 * já existente (seção "Como aplicar no Brasil") como ponto de partida editável.
 */
export async function createOpportunityFromContent(contentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: content } = await supabase
    .from("contents")
    .select("title, title_pt, content_ai_analyses(*)")
    .eq("id", contentId)
    .maybeSingle<{
      title: string;
      title_pt: string | null;
      content_ai_analyses: Record<string, unknown> | null;
    }>();

  const a = (content?.content_ai_analyses ?? null) as any;

  const { data: created, error } = await supabase
    .from("opportunities")
    .insert({
      user_id: user.id,
      source_content_id: contentId,
      working_name: `Ideia a partir de: ${content?.title_pt ?? content?.title ?? "conteúdo"}`,
      problem: a?.strategy ?? null,
      audience: a?.audience ?? null,
      monetization: a?.monetization ?? null,
      mvp: a?.br_mvp ?? null,
      value_proposition: a?.br_adaptation ?? null,
      risks: a?.br_difficulties ?? null,
      opportunity_score: a?.opportunity_score ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/oportunidades");
  redirect(`/oportunidades?novo=${created.id}`);
}

const oppSchema = z.object({
  id: z.string().uuid(),
  working_name: z.string().min(1),
  problem: z.string().optional(),
  audience: z.string().optional(),
  value_proposition: z.string().optional(),
  monetization: z.string().optional(),
  mvp: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateOpportunity(formData: FormData) {
  const parsed = oppSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, ...fields } = parsed.data;
  const supabase = await createClient();
  await supabase.from("opportunities").update(fields).eq("id", id);
  revalidatePath("/oportunidades");
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();
  await supabase.from("opportunities").delete().eq("id", id);
  revalidatePath("/oportunidades");
}
