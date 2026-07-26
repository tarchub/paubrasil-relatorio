"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1, "Informe um nome."),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

export async function createCollection(formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("collections").insert({
    user_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    emoji: parsed.data.emoji || "⭐",
  });
  revalidatePath("/colecoes");
}

export async function deleteCollection(id: string) {
  const supabase = await createClient();
  await supabase.from("collections").delete().eq("id", id);
  revalidatePath("/colecoes");
}

/** Adiciona um item (ex.: conteúdo) a uma coleção. */
export async function addToCollection(
  collectionId: string,
  itemType: "content" | "saas" | "strategy" | "funnel" | "offer" | "trend" | "opportunity",
  itemId: string,
) {
  const supabase = await createClient();
  await supabase
    .from("collection_items")
    .upsert(
      { collection_id: collectionId, item_type: itemType, item_id: itemId },
      { onConflict: "collection_id,item_type,item_id" },
    );
  revalidatePath("/colecoes");
}
