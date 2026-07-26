import "server-only";
import Parser from "rss-parser";

/**
 * Coleta e normalização de feeds RSS/Atom.
 * Guardamos apenas título, link, trecho curto e metadados (compliance).
 */

export type NormalizedItem = {
  title: string;
  url: string;
  author: string | null;
  imageUrl: string | null;
  excerpt: string | null;
  publishedAt: string | null;
};

type CustomFeed = { items: CustomItem[] };
type CustomItem = {
  title?: string;
  link?: string;
  creator?: string;
  author?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  ["media:content"]?: { $?: { url?: string } };
  ["media:thumbnail"]?: { $?: { url?: string } };
};

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "MarketRadarUSA/1.0 (+intelligence-aggregator)" },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
});

const MAX_EXCERPT = 500;

function clean(text?: string): string | null {
  if (!text) return null;
  const t = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > MAX_EXCERPT ? t.slice(0, MAX_EXCERPT) + "…" : t;
}

function pickImage(item: CustomItem): string | null {
  return (
    item.enclosure?.url ??
    item["media:content"]?.$?.url ??
    item["media:thumbnail"]?.$?.url ??
    null
  );
}

/** Busca um feed e retorna itens normalizados (ignora itens sem título/link). */
export async function fetchFeed(feedUrl: string): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(feedUrl);
  return (feed.items ?? [])
    .filter((i) => i.title && i.link)
    .map((i) => ({
      title: i.title!.trim(),
      url: i.link!.trim(),
      author: (i.creator ?? i.author ?? null)?.toString().trim() || null,
      imageUrl: pickImage(i),
      excerpt: clean(i.contentSnippet ?? i.content),
      publishedAt: i.isoDate ?? (i.pubDate ? new Date(i.pubDate).toISOString() : null),
    }));
}
