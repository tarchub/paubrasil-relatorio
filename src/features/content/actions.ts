"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSaved(id: string, next: boolean) {
  const supabase = await createClient();
  await supabase.from("contents").update({ is_saved: next }).eq("id", id);
  revalidatePath("/feed");
  revalidatePath(`/feed/${id}`);
}

export async function markRead(id: string, next: boolean) {
  const supabase = await createClient();
  await supabase.from("contents").update({ is_read: next }).eq("id", id);
  revalidatePath("/feed");
  revalidatePath(`/feed/${id}`);
}
