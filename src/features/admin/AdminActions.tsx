"use client";

import { useState, useTransition } from "react";
import { runCollectNow, runProcessNow, runBriefingNow } from "./actions";

export function AdminActions() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>, label: string) {
    setMsg(null);
    start(async () => {
      try {
        const r = (await fn()) as Record<string, unknown>;
        setMsg(`${label}: ${JSON.stringify(r)}`);
      } catch (e) {
        setMsg(`${label} — erro: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  }

  return (
    <div className="card p-5">
      <h3 className="mb-3 font-display text-lg text-sand">Executar agora</h3>
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} onClick={() => run(runCollectNow, "Coleta")} className="btn-ghost">
          Rodar coleta (RSS)
        </button>
        <button disabled={pending} onClick={() => run(runProcessNow, "Processamento IA")} className="btn-ghost">
          Processar pendentes (IA)
        </button>
        <button disabled={pending} onClick={() => run(runBriefingNow, "Briefing")} className="btn-ghost">
          Gerar briefing diário
        </button>
      </div>
      {pending && <p className="mt-3 text-sm text-sand-muted">Executando…</p>}
      {msg && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-700/60 p-3 text-xs text-sand-muted">{msg}</pre>
      )}
    </div>
  );
}
