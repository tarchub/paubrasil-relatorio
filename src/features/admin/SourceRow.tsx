"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleSourceActive, toggleSourceTerms, deleteSource } from "./actions";
import type { Source } from "@/types/database";

export function SourceRow({ source }: { source: Source }) {
  const [pending, start] = useTransition();

  return (
    <tr className={cn("border-b border-line2 text-sm", pending && "opacity-50")}>
      <td className="py-3 pr-4">
        <p className="font-medium text-sand">{source.name}</p>
        <p className="truncate text-xs text-sand-muted max-w-[240px]">{source.feed_url ?? source.url}</p>
      </td>
      <td className="px-2 text-xs text-sand-muted">{source.type}</td>
      <td className="px-2">
        <span className="chip">{source.priority}</span>
      </td>
      <td className="px-2 text-center text-xs text-sand-muted">{source.authority}</td>
      <td className="px-2 text-center">
        <button
          onClick={() => start(() => toggleSourceActive(source.id, !source.is_active))}
          className={cn("rounded-full px-2.5 py-1 text-xs", source.is_active ? "bg-gold/15 text-gold" : "bg-ink-600 text-sand-muted")}
        >
          {source.is_active ? "Ativa" : "Pausada"}
        </button>
      </td>
      <td className="px-2 text-center">
        <button
          onClick={() => start(() => toggleSourceTerms(source.id, !source.terms_ok))}
          title="Termos de uso verificados"
          className={cn("rounded-full px-2.5 py-1 text-xs", source.terms_ok ? "bg-green-500/15 text-green-300" : "bg-ink-600 text-sand-muted")}
        >
          {source.terms_ok ? "Termos OK" : "Verificar"}
        </button>
      </td>
      <td className="px-2 text-center text-xs text-sand-muted">
        {source.last_status === "error" ? (
          <span className="text-red-300" title={source.last_error ?? ""}>erro</span>
        ) : (
          source.last_status ?? "—"
        )}
      </td>
      <td className="pl-2 text-right">
        <button
          onClick={() => { if (confirm(`Excluir "${source.name}"?`)) start(() => deleteSource(source.id)); }}
          className="text-xs text-sand-muted hover:text-red-300"
        >
          Excluir
        </button>
      </td>
    </tr>
  );
}
