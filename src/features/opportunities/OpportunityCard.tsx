"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ScoreRing } from "@/components/ui";
import { updateOpportunity, deleteOpportunity } from "./actions";
import type { Opportunity } from "@/types/database";

export function OpportunityCard({ opp, highlight }: { opp: Opportunity; highlight?: boolean }) {
  const [editing, setEditing] = useState(highlight ?? false);
  const [pending, start] = useTransition();

  return (
    <div className={`card p-5 ${highlight ? "border-gold/40" : ""}`}>
      <div className="flex items-start gap-4">
        <ScoreRing value={opp.opportunity_score} label="Score" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              action={(fd) => start(() => updateOpportunity(fd).then(() => setEditing(false)))}
              className="space-y-3"
            >
              <input type="hidden" name="id" value={opp.id} />
              <div>
                <label className="label">Nome provisório</label>
                <input name="working_name" defaultValue={opp.working_name} className="input" />
              </div>
              <div>
                <label className="label">Problema resolvido</label>
                <textarea name="problem" defaultValue={opp.problem ?? ""} rows={2} className="input" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="label">Público-alvo</label>
                  <input name="audience" defaultValue={opp.audience ?? ""} className="input" />
                </div>
                <div>
                  <label className="label">Monetização</label>
                  <input name="monetization" defaultValue={opp.monetization ?? ""} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Proposta de valor</label>
                <textarea name="value_proposition" defaultValue={opp.value_proposition ?? ""} rows={2} className="input" />
              </div>
              <div>
                <label className="label">MVP</label>
                <textarea name="mvp" defaultValue={opp.mvp ?? ""} rows={2} className="input" />
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea name="notes" defaultValue={opp.notes ?? ""} rows={2} className="input" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={pending} className="btn-primary">
                  {pending ? "Salvando…" : "Salvar"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="font-display text-lg text-sand">{opp.working_name}</h3>
              {opp.problem && <p className="mt-1 text-sm text-sand-muted">{opp.problem}</p>}
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {opp.audience && <div><dt className="text-xs text-sand-muted">Público</dt><dd className="text-sand">{opp.audience}</dd></div>}
                {opp.monetization && <div><dt className="text-xs text-sand-muted">Monetização</dt><dd className="text-sand">{opp.monetization}</dd></div>}
              </dl>
              {opp.notes && <p className="mt-3 rounded-lg bg-ink-700/50 p-3 text-sm text-sand-muted">{opp.notes}</p>}
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => setEditing(true)} className="btn-ghost px-3 py-1.5 text-xs">Editar</button>
                {opp.source_content_id && (
                  <Link href={`/feed/${opp.source_content_id}`} className="btn-ghost px-3 py-1.5 text-xs">
                    Ver origem
                  </Link>
                )}
                <button
                  onClick={() => { if (confirm("Excluir oportunidade?")) start(() => deleteOpportunity(opp.id)); }}
                  className="btn-ghost ml-auto px-3 py-1.5 text-xs text-red-300/80 hover:text-red-300"
                >
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
