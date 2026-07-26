"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Badge, TierBadge } from "@/components/ui";
import { IconBookmark, IconCheck, IconExternal, IconArrow } from "@/components/icons";
import { timeAgo, cn, scoreColor } from "@/lib/utils";
import { toggleSaved, markRead } from "./actions";
import type { ContentWithMeta } from "./queries";

export function ContentCard({ content }: { content: ContentWithMeta }) {
  const [pending, start] = useTransition();

  return (
    <article
      className={cn(
        "card group flex flex-col overflow-hidden transition-colors hover:border-gold/25",
        content.is_read && "opacity-70",
      )}
    >
      {content.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.image_url} alt="" className="h-40 w-full object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-sand-muted">
          {content.categories && <Badge tone="gold">{content.categories.name}</Badge>}
          <span>{content.sources?.name ?? "Fonte"}</span>
          <span>·</span>
          <span>{timeAgo(content.published_at ?? content.collected_at)}</span>
          <span className="ml-auto"><TierBadge tier={content.relevance_tier} /></span>
        </div>

        <div>
          <Link href={`/feed/${content.id}`} className="block">
            <h3 className="font-display text-[17px] leading-snug text-sand group-hover:text-gold">
              {content.title_pt ?? content.title}
            </h3>
          </Link>
          {content.title_pt && (
            <p className="mt-0.5 text-xs italic text-sand-muted line-clamp-1">{content.title}</p>
          )}
        </div>

        {content.excerpt && (
          <p className="text-sm leading-relaxed text-sand-muted line-clamp-3">{content.excerpt}</p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-1 text-xs">
          <span className="text-sand-muted">
            Potencial BR{" "}
            <strong className={cn("font-semibold", scoreColor(content.br_potential_score))}>
              {content.br_potential_score ?? "—"}
            </strong>
          </span>
          <span className="text-sand-muted">
            Novidade{" "}
            <strong className={cn("font-semibold", scoreColor(content.novelty_score))}>
              {content.novelty_score ?? "—"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1 border-t border-line2 pt-3">
          <button
            title={content.is_saved ? "Remover dos salvos" : "Salvar"}
            disabled={pending}
            onClick={() => start(() => toggleSaved(content.id, !content.is_saved))}
            className={cn(
              "btn-ghost px-2.5 py-1.5",
              content.is_saved && "border-gold/40 text-gold",
            )}
          >
            <IconBookmark width={16} height={16} />
          </button>
          <button
            title={content.is_read ? "Marcar como não lido" : "Marcar como lido"}
            disabled={pending}
            onClick={() => start(() => markRead(content.id, !content.is_read))}
            className={cn(
              "btn-ghost px-2.5 py-1.5",
              content.is_read && "border-gold/40 text-gold",
            )}
          >
            <IconCheck width={16} height={16} />
          </button>
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir fonte original"
            className="btn-ghost px-2.5 py-1.5"
          >
            <IconExternal width={16} height={16} />
          </a>
          <Link href={`/feed/${content.id}`} className="btn-primary ml-auto px-3 py-1.5 text-xs">
            Análise <IconArrow width={14} height={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
