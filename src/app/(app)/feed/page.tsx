import { getFeed, type FeedFilter } from "@/features/content/queries";
import { FeedView } from "@/features/content/FeedView";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories").select("slug, name").order("name");

  const filter: FeedFilter = {
    period: (sp.period as FeedFilter["period"]) || undefined,
    sort: (sp.sort as FeedFilter["sort"]) || "relevance",
    category: sp.category || undefined,
    unread: Boolean(sp.unread),
    saved: Boolean(sp.saved),
    limit: 48,
  };

  const feed = await getFeed(filter);

  return <FeedView feed={feed} categories={categories ?? []} />;
}
