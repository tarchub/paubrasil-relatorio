"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "pt" | "original" | "side";

export function LanguageToggle({
  original,
  translated,
}: {
  original: string | null;
  translated: string | null;
}) {
  const [mode, setMode] = useState<Mode>("pt");
  const hasBoth = Boolean(original && translated);

  const options: { key: Mode; label: string }[] = [
    { key: "pt", label: "Português" },
    { key: "original", label: "Original" },
    ...(hasBoth ? [{ key: "side" as Mode, label: "Lado a lado" }] : []),
  ];

  return (
    <div>
      <div className="mb-3 inline-flex rounded-xl border border-line p-0.5">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => setMode(o.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              mode === o.key ? "bg-gold/15 text-gold" : "text-sand-muted hover:text-sand",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {mode === "side" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Original" text={original} />
          <Panel title="Português" text={translated} />
        </div>
      ) : (
        <Panel text={mode === "pt" ? translated : original} />
      )}
    </div>
  );
}

function Panel({ title, text }: { title?: string; text: string | null }) {
  return (
    <div className="rounded-xl border border-line2 bg-ink-800/40 p-4">
      {title && <p className="mb-2 text-[11px] uppercase tracking-wide text-sand-muted">{title}</p>}
      <p className="whitespace-pre-line text-sm leading-relaxed text-sand-muted">
        {text || "Conteúdo não disponível (guardamos apenas trechos e metadados por compliance)."}
      </p>
    </div>
  );
}
