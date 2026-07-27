"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/login/actions";
import {
  IconRadar, IconHome, IconFeed, IconTrend, IconSaas, IconBulb,
  IconStar, IconSearch, IconBriefing, IconSettings, IconLogout, IconFolder,
} from "@/components/icons";

const NAV = [
  { section: "Visão geral", items: [
    { href: "/dashboard", label: "Dashboard", icon: IconHome },
    { href: "/feed", label: "Feed de inteligência", icon: IconFeed },
    { href: "/briefing", label: "Radar diário", icon: IconBriefing },
    { href: "/busca", label: "Busca global", icon: IconSearch },
  ]},
  { section: "Inteligência", items: [
    { href: "/tendencias", label: "Radar de tendências", icon: IconTrend, soon: true },
    { href: "/saas", label: "Radar de SaaS", icon: IconSaas, soon: true },
    { href: "/oportunidades", label: "Oportunidades", icon: IconBulb },
  ]},
  { section: "Meu espaço", items: [
    { href: "/colecoes", label: "Coleções & Favoritos", icon: IconStar },
    { href: "/admin", label: "Administração", icon: IconSettings },
  ]},
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2 text-gold">
          <IconRadar width={20} height={20} />
          <span className="font-display text-sand">Market Radar</span>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost px-3 py-1.5 text-xs">
          {open ? "Fechar" : "Menu"}
        </button>
      </div>

      <aside
        className={cn(
          "z-40 flex w-64 shrink-0 flex-col border-r border-line bg-ink/95 backdrop-blur",
          "md:sticky md:top-0 md:h-screen",
          open ? "block" : "hidden md:flex",
        )}
      >
        <div className="hidden items-center gap-2.5 border-b border-line px-5 py-5 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
            <IconRadar width={20} height={20} />
          </div>
          <div>
            <p className="font-display text-sand leading-tight">Market Radar</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-sand-muted">USA → Brasil</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sand-muted/70">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-gold/10 text-gold"
                          : "text-sand-muted hover:bg-ink-700 hover:text-sand",
                      )}
                    >
                      <Icon width={18} height={18} className={active ? "text-gold" : "text-sand-muted group-hover:text-sand"} />
                      <span className="flex-1">{item.label}</span>
                      {"soon" in item && item.soon && (
                        <span className="rounded bg-ink-600 px-1.5 py-0.5 text-[9px] uppercase text-sand-muted">
                          em breve
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <form action={logout} className="border-t border-line p-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sand-muted transition-colors hover:bg-ink-700 hover:text-sand">
            <IconLogout width={18} height={18} />
            Sair
          </button>
        </form>
      </aside>
    </>
  );
}

export { IconFolder };
