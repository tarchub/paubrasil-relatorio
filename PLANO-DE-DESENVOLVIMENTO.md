# PLANO DE DESENVOLVIMENTO — Market Radar USA

> Central privada de inteligência de mercado para acompanhar o mercado americano
> (marketing digital, funis, infoprodutos, SaaS, IA aplicada, automação, tráfego,
> copy, growth, e-commerce, comunidades, assinaturas, agências e novos modelos de
> negócio) e traduzir tudo em **oportunidades práticas para o mercado brasileiro**.

Uso privado (single-tenant, sem cadastro público).

---

## 1. Visão geral da arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                          Next.js (App Router)                      │
│                                                                    │
│  app/(auth)/login        →  Supabase Auth (email + senha)          │
│  app/(app)/*             →  Rotas privadas (middleware protege)    │
│  app/api/*               →  Route Handlers (coleta, IA, cron)      │
│                                                                    │
│  Server Components + Server Actions  ⇄  Supabase (server client)   │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ service_role (apenas no servidor)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                             Supabase                                │
│   PostgreSQL  +  Auth  +  Row Level Security  +  Storage (imagens) │
└──────────────────────────────────────────────────────────────────┘
        ▲                         ▲                         ▲
        │ RSS / APIs oficiais     │ Vercel Cron             │ IA (LLM)
   Fontes externas          Agendamentos            Anthropic / OpenAI
```

### Princípios
- **Modular**: cada domínio (feed, saas, tendências…) isolado em `src/features/*`.
- **Tipagem forte**: tipos gerados do schema Supabase + Zod para validação de I/O.
- **Segredos no servidor**: nenhuma chave sensível chega ao browser. LLM e
  `service_role` só rodam em Route Handlers / Server Actions.
- **Sem dados falsos permanentes**: mock apenas em desenvolvimento de UI, atrás de
  flag `NEXT_PUBLIC_USE_MOCKS`.

---

## 2. Stack

| Camada            | Tecnologia                                             |
|-------------------|--------------------------------------------------------|
| Framework         | Next.js 15 (App Router) + React 19                     |
| Linguagem         | TypeScript (strict)                                    |
| Estilo            | Tailwind CSS v4 + design tokens próprios               |
| Banco / Auth      | Supabase (PostgreSQL + Auth + RLS + Storage)           |
| Coleta            | RSS (`rss-parser`) + APIs oficiais                     |
| IA                | Provider plugável (Anthropic Claude por padrão)        |
| Agendamento       | Vercel Cron (`vercel.json`)                            |
| Validação         | Zod                                                    |
| Deploy            | Vercel                                                 |

---

## 3. Estrutura de pastas

```
src/
  app/
    (auth)/login/                 Tela de login
    (auth)/recuperar-senha/       Recuperação de senha
    (app)/                        Layout privado + navegação
      dashboard/                  Dashboard + "O que você precisa saber hoje"
      feed/                       Feed de inteligência + filtros
      feed/[id]/                  Página de análise do conteúdo + "Como aplicar no Brasil"
      tendencias/                 Radar de tendências           (Fase 2)
      saas/                       Radar de SaaS                 (Fase 2)
      estrategias/                Biblioteca de estratégias     (Fase 2)
      funis/                      Biblioteca de funis           (Fase 3)
      ofertas/                    Banco de ofertas              (Fase 3)
      laboratorio/                Laboratório de oportunidades  (Fase 2/3)
      oportunidades/              Banco de oportunidades (MVP)
      projetos/                   Projetos (lista + kanban)     (Fase 3)
      colecoes/                   Favoritos e coleções
      busca/                      Busca global
      briefing/                   Radar diário do mercado americano
      alertas/                    Alertas por palavra-chave     (Fase 3)
      admin/                      Painel administrativo (fontes, prompts, logs)
    api/
      cron/collect/               Coleta RSS agendada
      cron/briefing/              Geração do briefing diário
      cron/trends/                Recalcular tendências         (Fase 2)
      collect/route.ts            Disparo manual de coleta
      process/route.ts            Processamento IA de um conteúdo
      health/route.ts             Health check
    layout.tsx  globals.css
  features/                       Regras de negócio por domínio
    content/  sources/  ai/  opportunities/ collections/ briefing/ search/
  lib/
    supabase/                     Clients (browser / server / admin)
    ai/                           Camada de IA (provider plugável + prompts)
    rss/                          Parser + normalização
    relevance/                    Cálculo de pontuação de relevância
    env.ts                        Validação de variáveis de ambiente (Zod)
    utils.ts
  components/                     UI reutilizável (design system)
  types/                          Tipos globais + gerados do Supabase
supabase/
  migrations/                     SQL versionado (schema + RLS + índices)
  seed.sql                        Fontes iniciais (não é mock, são fontes reais)
```

---

## 4. Fases de entrega

### Fase 0 — Planejamento (este passo) ✅
Documentos: `PLANO-DE-DESENVOLVIMENTO.md`, `BANCO-DE-DADOS.md`,
`FONTES-E-INTEGRACOES.md`, `.env.example`. Lista de APIs e credenciais.

### Fase 1 — MVP funcional
1. Login privado (Supabase Auth) + rotas protegidas por middleware.
2. Schema completo no Supabase + RLS + seed de fontes reais.
3. Painel de cadastro/edição de fontes (admin).
4. Coleta por RSS (route handler + cron de hora em hora).
5. Feed de inteligência com filtros (hoje / 7d / 30d / categoria / não lidos / salvos).
6. Pipeline de IA: tradução de título, resumo em PT, aprendizados,
   classificação por categoria, análise de potencial para o Brasil + nota 0–100.
7. Página de detalhes do conteúdo com "Como aplicar no Brasil".
8. Favoritos e coleções.
9. Busca global (PT/EN) via full-text search do Postgres.
10. Briefing diário ("Radar diário do mercado americano") salvo no banco.
11. Banco de oportunidades (criar a partir de um conteúdo).
12. Deploy preparado para Vercel (`vercel.json` com crons + guia de deploy).

### Fase 2 — Inteligência
- Radar de tendências (agregação por palavra-chave/empresa + status + gráfico).
- Radar de SaaS.
- Biblioteca de estratégias.
- Laboratório de oportunidades (geração estruturada).
- Sistema de relevância completo (reprocessamento semanal).

### Fase 3 — Escala
- Biblioteca de funis, Banco de ofertas.
- Projetos (lista + Kanban).
- Alertas por palavra-chave.
- Gráficos e dashboards avançados.
- Envio do briefing por e-mail / WhatsApp.
- Integrações externas (Product Hunt API, Reddit, YouTube, Google Trends, etc.).

---

## 5. Fluxo de coleta e processamento

```
Cron (hora/6h/dia)
   └─ /api/cron/collect
        ├─ para cada fonte ATIVA e no intervalo:
        │    ├─ buscar feed (RSS/API)
        │    ├─ normalizar itens
        │    ├─ deduplicar (url_hash → title_hash → similaridade)
        │    └─ inserir em `contents` (status = 'pending')
        └─ registrar em `collection_logs`

Processamento IA (assíncrono, em lote)
   └─ /api/process  (ou worker por cron)
        ├─ pega contents com status 'pending'
        ├─ chama LLM → tradução, resumo, aprendizados, classificação,
        │             análise Brasil, nota de oportunidade
        ├─ grava em `content_ai_analyses`
        ├─ calcula relevance_score (lib/relevance)
        └─ status = 'processed'

Briefing diário
   └─ /api/cron/briefing → seleciona top do dia → LLM monta o resumo → `briefings`
```

**Deduplicação**: `url_hash` (sha256 da URL canônica) UNIQUE + `title_hash`
(sha256 do título normalizado) + checagem de similaridade semântica na Fase 2.

---

## 6. Segurança
- Middleware protege todo o grupo `(app)` e `/api` (exceto health/cron autenticado).
- **RLS ligado em todas as tabelas.** Como é single-user, políticas permitem o
  usuário autenticado; tabelas de conteúdo global são legíveis por qualquer
  autenticado e escritas apenas pelo `service_role` (coleta/IA).
- Crons protegidos por `CRON_SECRET` (header `Authorization: Bearer`).
- `service_role` e chaves de LLM **apenas** em código server-side.
- Validação de entrada com Zod em toda Server Action / Route Handler.
- Rate limiting nas rotas de disparo manual (`lib/rate-limit`).
- Logs de atividade em `activity_logs` / `collection_logs`.

Detalhes de tabelas, índices, RLS e auditoria em **BANCO-DE-DADOS.md**.
Detalhes de fontes, termos de uso e integrações em **FONTES-E-INTEGRACOES.md**.

---

## 7. Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env.local
#   preencher URL/keys do Supabase e a chave do provedor de IA

# 3. Aplicar o schema no Supabase
#    (SQL Editor do painel OU Supabase CLI)
#    supabase db push   — ou — cole supabase/migrations/*.sql no SQL Editor
#    depois rode supabase/seed.sql para as fontes iniciais

# 4. Criar o usuário privado (uma vez), no painel Supabase > Authentication
#    ou via: npm run create-user  (script documentado no README)

# 5. Rodar
npm run dev            # http://localhost:3000
```

## 8. Deploy (Vercel)
1. Importar o repositório na Vercel.
2. Definir as variáveis de ambiente (mesmas do `.env.example`).
3. `vercel.json` já registra os cron jobs.
4. Configurar `CRON_SECRET` para autenticar os crons.
5. Deploy. Rotas de cron aparecem em *Project → Cron Jobs*.
