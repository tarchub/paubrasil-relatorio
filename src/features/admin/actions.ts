"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { collectAll } from "@/features/collection/service";
import { processPending } from "@/features/collection/process";
import { generateDailyBriefing } from "@/features/briefing/service";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado.");
  return user;
}

const sourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  feed_url: z.string().url().optional().or(z.literal("")),
  type: z.string(),
  priority: z.enum(["alta", "media", "baixa"]),
  authority: z.coerce.number().min(0).max(100),
});

export async function createSource(formData: FormData) {
  await requireUser();
  const parsed = sourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("sources").insert({
    name: parsed.data.name,
    url: parsed.data.url || null,
    feed_url: parsed.data.feed_url || null,
    type: parsed.data.type as any,
    priority: parsed.data.priority,
    authority: parsed.data.authority,
  });
  revalidatePath("/admin");
}

export async function toggleSourceActive(id: string, next: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("sources").update({ is_active: next }).eq("id", id);
  revalidatePath("/admin");
}

export async function toggleSourceTerms(id: string, next: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("sources").update({ terms_ok: next }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteSource(id: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("sources").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function runCollectNow() {
  await requireUser();
  const results = await collectAll();
  const inserted = results.reduce((a, r) => a + r.inserted, 0);
  revalidatePath("/admin");
  revalidatePath("/feed");
  return { inserted, sources: results.length };
}

export async function runProcessNow() {
  await requireUser();
  const summary = await processPending(15);
  revalidatePath("/admin");
  revalidatePath("/feed");
  return summary;
}

export async function runBriefingNow() {
  await requireUser();
  const result = await generateDailyBriefing();
  revalidatePath("/briefing");
  revalidatePath("/dashboard");
  return result;
}
