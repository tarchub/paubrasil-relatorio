# FONTES E INTEGRAÇÕES — Market Radar USA

> **Regra de ouro (compliance):** antes de coletar de qualquer fonte, verificar os
> **Termos de Uso** e o `robots.txt`. Dar preferência a **APIs oficiais**, **RSS**,
> **newsletters autorizadas** e **dados públicos permitidos**. **Nunca** armazenar
> o conteúdo íntegro protegido por direitos autorais — guardamos apenas **título,
> link, metadados, trechos curtos, resumos gerados e análises próprias**.

Cada fonte no banco tem o campo `terms_ok` (bool). Só entra na coleta automática
quando marcado como verificado. O campo `collection_method` define `rss` | `api` |
`manual`.

---

## 1. Fontes por RSS (MVP — método `rss`)

RSS/Atom é conteúdo publicado pelo próprio site para sindicância; guardamos apenas
título, link, resumo curto e metadados. Feeds candidatos (validar cada URL antes):

| Fonte | Categoria | Feed candidato |
|---|---|---|
| TechCrunch | Tech/Startups | `https://techcrunch.com/feed/` |
| Y Combinator (Blog) | Startups | `https://www.ycombinator.com/blog/rss` |
| Hacker News (front) | Tech/Comunidade | `https://hnrss.org/frontpage` |
| Indie Hackers | Micro-SaaS | feed público quando disponível |
| HubSpot Marketing Blog | Marketing | `https://blog.hubspot.com/marketing/rss.xml` |
| Search Engine Journal | SEO/Tráfego | `https://www.searchenginejournal.com/feed/` |
| Social Media Examiner | Social/Marketing | `https://www.socialmediaexaminer.com/feed/` |
| MarketingExamples | Copy/Growth | via RSS/newsletter autorizada |
| OpenAI Blog | IA | `https://openai.com/blog/rss.xml` |
| Anthropic News | IA | feed/News quando disponível |
| Stripe Blog | Pagamentos/SaaS | feed quando disponível |
| Shopify Blog | E-commerce | `https://www.shopify.com/blog.atom` |

> As URLs acima são **candidatas**. O seed (`supabase/seed.sql`) cadastra as fontes
> com `is_active=false` e `terms_ok=false` por padrão — você ativa após validar o
> feed e os termos no painel administrativo.

---

## 2. Fontes por API oficial (Fase 2/3 — método `api`)

Cada uma exige credencial e respeito ao rate limit / termos. Estrutura já prevista;
implementar o cliente quando a credencial estiver disponível.

| Fonte | O que traz | Credencial | Observação |
|---|---|---|---|
| **Product Hunt** | Lançamentos diários | `PRODUCT_HUNT_TOKEN` (GraphQL API) | ótimo para "novos SaaS" |
| **Reddit** | Discussões de nichos | `REDDIT_CLIENT_ID/SECRET` | respeitar API terms |
| **Hacker News (Algolia)** | Busca em HN | sem chave (API pública) | rate limit |
| **YouTube Data API** | Canais/vídeos | `YOUTUBE_API_KEY` | quotas diárias |
| **Google Trends** | Tendências de busca | não oficial | usar com cautela / `SerpApi` |
| **Exploding Topics** | Tendências emergentes | conta paga | via API/relatórios |
| **G2 / Capterra** | Reviews de SaaS | parceria/API | checar termos (scraping proibido) |
| **AppSumo** | Ofertas de ferramentas | RSS/affiliate | checar termos |
| **News/Trends via SerpApi** | SERP + Trends | `SERPAPI_KEY` | alternativa paga estável |

> **Product Hunt, TechCrunch, Y Combinator, Indie Hackers, HubSpot, ClickFunnels,
> MarketingExamples, Social Media Examiner, Search Engine Journal, Google Trends,
> Exploding Topics, G2, Capterra, AppSumo, Stripe, Shopify, OpenAI, Anthropic,
> Meta, Google Ads, TikTok for Business, Reddit, Hacker News, YouTube** — todos
> previstos na arquitetura. Entram por RSS quando oferecem, ou por API oficial
> mediante credencial. Onde só há scraping e os termos proíbem, a fonte fica como
> `manual` (curadoria) até haver caminho autorizado.

---

## 3. Camada de IA (LLM)

Provider plugável (`src/lib/ai`). Padrão: **Anthropic Claude**. Alternativa:
**OpenAI**. A chave vive **apenas no servidor**.

Operações:
1. `translate_title` — título → PT (preserva termos técnicos em inglês).
2. `summarize` — resumo executivo em PT + principais aprendizados.
3. `classify` — categoria + tags + empresas mencionadas.
4. `analyze_br` — análise "Como aplicar no Brasil" + nota de oportunidade 0–100.
5. `daily_briefing` — monta o "Radar diário do mercado americano".
6. `lab_opportunity` — Laboratório de oportunidades (Fase 2/3).

Prompts ficam versionados em código (`src/lib/ai/prompts.ts`) e espelhados na
tabela `ai_prompts` para edição pelo admin. Consumo registrado em `ai_usage_logs`.

Variáveis:
- `AI_PROVIDER` = `anthropic` | `openai`
- `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`
- `OPENAI_API_KEY` / `OPENAI_MODEL`

---

## 4. Agendamentos (Vercel Cron)

Definidos em `vercel.json`. Todos protegidos por `CRON_SECRET`.

| Rota | Frequência | Função |
|---|---|---|
| `/api/cron/collect?priority=alta` | de hora em hora | fontes prioritárias |
| `/api/cron/collect?priority=media` | a cada 6h | fontes secundárias |
| `/api/cron/collect?priority=baixa` | 1x/dia | fontes de baixa prioridade |
| `/api/cron/process` | a cada 15 min | processa IA da fila `pending` |
| `/api/cron/briefing` | 1x/dia (manhã) | gera o briefing diário |
| `/api/cron/trends` | 1x/dia | recalcula tendências (Fase 2) |
| `/api/cron/reindex-relevance` | 1x/semana | reprocessa relevância (Fase 2) |

---

## 5. Checklist de credenciais

| Serviço | Variável | Obrigatória no MVP? | Onde obter |
|---|---|---|---|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | ✅ | painel Supabase → Project Settings → API |
| Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | idem |
| Supabase service_role | `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server) | idem — **nunca no client** |
| Provedor de IA | `AI_PROVIDER` | ✅ | `anthropic` ou `openai` |
| Anthropic | `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | ✅ (se anthropic) | console.anthropic.com |
| OpenAI | `OPENAI_API_KEY` / `OPENAI_MODEL` | ✅ (se openai) | platform.openai.com |
| Cron secret | `CRON_SECRET` | ✅ (prod) | gerar string aleatória |
| Product Hunt | `PRODUCT_HUNT_TOKEN` | ❌ (Fase 2) | api.producthunt.com |
| Reddit | `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | ❌ | reddit.com/prefs/apps |
| YouTube | `YOUTUBE_API_KEY` | ❌ | Google Cloud Console |
| SerpApi | `SERPAPI_KEY` | ❌ | serpapi.com |
| App URL | `NEXT_PUBLIC_APP_URL` | ✅ | ex.: `http://localhost:3000` |

Onde a integração depende de credencial paga/externa, a **estrutura já existe** e o
ponto exato para inserir a chave está comentado no código
(`// TODO(cred): inserir <VARIÁVEL>`), além de listado aqui.
