"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

const PERIODS = [
  { key: "", label: "Tudo" },
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
];
const SORTS = [
  { key: "relevance", label: "Mais relevantes" },
  { key: "recent", label: "Mais recentes" },
  { key: "br_potential", label: "Maior potencial BR" },
];
const FLAGS = [
  { key: "unread", label: "Não lidos" },
  { key: "saved", label: "Salvos" },
];

export function FeedFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  }

  function toggleFlag(key: string) {
    setParam(key, params.get(key) ? "" : "1");
  }

  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-gold/40 bg-gold/10 text-gold" : "border-line text-sand-muted hover:text-sand",
      )}
    >
      {children}
    </button>
  );

  const period = params.get("period") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const category = params.get("category") ?? "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <Pill key={p.key} active={period === p.key} onClick={() => setParam("period", p.key)}>
            {p.label}
          </Pill>
        ))}
        <span className="mx-1 h-4 w-px bg-line" />
        {FLAGS.map((f) => (
          <Pill key={f.key} active={Boolean(params.get(f.key))} onClick={() => toggleFlag(f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <Pill key={s.key} active={sort === s.key} onClick={() => setParam("sort", s.key)}>
            {s.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pill active={!category} onClick={() => setParam("category", "")}>Todas categorias</Pill>
        {categories.map((c) => (
          <Pill key={c.slug} active={category === c.slug} onClick={() => setParam("category", c.slug)}>
            {c.name}
          </Pill>
        ))}
      </div>
    </div>
  );
}
