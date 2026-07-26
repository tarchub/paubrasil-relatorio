# BANCO DE DADOS — Market Radar USA

Modelagem PostgreSQL (Supabase). Todas as tabelas usam `uuid` como PK
(`gen_random_uuid()`), campos de auditoria (`created_at`, `updated_at`) e
**Row Level Security ligado**. O SQL executável está em
`supabase/migrations/0001_init.sql`; as fontes reais iniciais em `supabase/seed.sql`.

---

## Convenções
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` (atualizado por trigger)
- Enums via `text` + `check` (mais simples de evoluir que `enum` nativo).
- Índices em todas as FKs e nas colunas de filtro/ordenação frequentes.
- Full-text search em português com coluna gerada `search_vector tsvector`.

---

## Enums (valores permitidos)

| Domínio            | Valores |
|--------------------|---------|
| content.status     | `pending`, `processing`, `processed`, `failed`, `archived` |
| relevance_tier     | `essencial`, `muito_relevante`, `relevante`, `monitorar`, `baixa` |
| trend.status       | `emergente`, `em_crescimento`, `consolidada`, `em_queda`, `saturada` |
| project.status     | `ideia`, `em_analise`, `validando`, `em_construcao`, `testando`, `lancado`, `pausado`, `descartado` |
| source.type        | `blog`, `newsletter`, `tech`, `startup`, `saas_directory`, `podcast`, `youtube`, `community`, `report`, `trends`, `profile`, `other` |
| source.priority    | `alta`, `media`, `baixa` |
| billing_model      | `assinatura`, `uso`, `unico`, `freemium`, `hibrido`, `desconhecido` |
| funnel.type        | `lead_magnet`, `webinar`, `vsl`, `quiz`, `desafio`, `newsletter`, `produto_entrada`, `tripwire`, `high_ticket`, `freemium`, `trial`, `demo`, `comunidade`, `assinatura`, `aplicacao`, `conteudo` |

---

## Tabelas

### `profiles`  — usuário privado (espelha `auth.users`)
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| email | text | |
| full_name | text | |
| is_admin | bool default true | single-user |
| created_at / updated_at | timestamptz | |

### `sources` — fontes de conteúdo
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| name | text not null | |
| url | text | site |
| feed_url | text | RSS/Atom ou endpoint |
| type | text check | ver enum |
| category_id | uuid FK → categories | opcional |
| priority | text check default 'media' | alta=1h, media=6h, baixa=1x/dia |
| authority | int default 50 | 0–100, peso na relevância |
| is_active | bool default true | |
| collection_method | text default 'rss' | `rss` \| `api` \| `manual` |
| last_collected_at | timestamptz | |
| last_status | text | `ok` \| `error` |
| last_error | text | |
| terms_ok | bool default false | termos de uso verificados (ver FONTES) |
| created_at / updated_at | | |

Índices: `(is_active, priority)`, `(last_collected_at)`.

### `categories` — categorias de conteúdo
`id, slug (unique), name, color, created_at`. Seed com as categorias do escopo
(marketing, funis, infoprodutos, saas, ia, automação, tráfego, copy, growth,
e-commerce, comunidades, assinaturas, agências, ferramentas, monetização, modelos).

### `tags` — tags livres
`id, slug (unique), name`.

### `companies` — empresas mencionadas
`id, name (unique), website, description, country default 'US', created_at`.

### `contents` — item coletado (núcleo do sistema)
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| source_id | uuid FK → sources | |
| category_id | uuid FK → categories | preenchido pela IA |
| title | text not null | título original |
| title_pt | text | traduzido (IA) |
| url | text not null | |
| url_hash | text unique not null | sha256(url canônica) — dedupe |
| title_hash | text | sha256(título normalizado) — dedupe |
| content_hash | text | sha256(resumo/excerto) — dedupe |
| author | text | |
| image_url | text | |
| country | text default 'US' | |
| excerpt | text | trecho curto original (não copiar íntegra) |
| published_at | timestamptz | |
| collected_at | timestamptz default now() | |
| status | text check default 'pending' | ver enum |
| relevance_score | numeric(5,2) | 0–100 |
| relevance_tier | text check | derivado do score |
| novelty_score | int | 0–100 (novidade) |
| br_potential_score | int | 0–100 (potencial Brasil) |
| is_read | bool default false | |
| is_saved | bool default false | |
| search_vector | tsvector (generated) | title + title_pt + excerpt |
| created_at / updated_at | | |

Índices: `url_hash` (unique), `(status)`, `(published_at desc)`,
`(relevance_score desc)`, `(category_id)`, `(source_id)`, GIN em `search_vector`,
`(is_read)`, `(is_saved)`.

### `content_ai_analyses` — saída da IA por conteúdo (1:1)
| coluna | tipo |
|---|---|
| id | uuid PK |
| content_id | uuid FK → contents unique |
| summary_pt | text | resumo executivo em PT |
| key_learnings | text[] | principais aprendizados |
| translated_body | text | tradução (quando houver corpo permitido) |
| strategy | text | estratégia identificada |
| audience | text | público envolvido |
| monetization | text | modelo de monetização |
| tools | text[] | ferramentas utilizadas |
| funnel | text | possível funil |
| offer | text | possível oferta |
| br_is_common | bool | já é comum no Brasil? |
| br_maturity | text | nível de maturidade no BR |
| br_niches | text[] | nichos brasileiros |
| br_adaptation | text | como adaptar |
| br_difficulties | text | dificuldades |
| br_initial_investment | text | investimento inicial aproximado |
| br_product_type | text | serviço/produto/SaaS/infoproduto |
| br_mvp | text | versão mínima para testar |
| br_recurrence_potential | text | potencial de recorrência |
| br_execution_difficulty | text | dificuldade de execução |
| br_validation_speed | text | velocidade para validar |
| opportunity_score | int | 0–100 (nota de oportunidade) |
| opportunity_breakdown | jsonb | subnotas (novidade, faturamento, etc.) |
| model_used | text | id do modelo LLM |
| tokens_used | int | consumo |
| created_at / updated_at | | |

### Relacionamentos N:N
- `content_tags(content_id, tag_id)`
- `content_companies(content_id, company_id)`

### `collections` — coleções do usuário
`id, user_id FK → profiles, name, description, emoji, created_at, updated_at`.

### `collection_items` — itens salvos numa coleção (polimórfico)
`id, collection_id FK, item_type ('content'|'saas'|'strategy'|'funnel'|'offer'|'trend'|'opportunity'), item_id uuid, note, created_at`.
Unique `(collection_id, item_type, item_id)`.

### `opportunities` — banco de oportunidades
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| source_content_id | uuid FK → contents | origem (opcional) |
| working_name | text | nome provisório |
| problem | text | |
| audience | text | |
| value_proposition | text | |
| monetization | text | |
| pricing | text | estrutura de planos |
| ticket | text | |
| mvp | text | |
| initial_features | text[] | |
| acquisition | text | |
| funnel | text | |
| launch_offer | text | |
| risks | text | |
| competitors | text[] | |
| validation_plan | text | |
| hypotheses | text[] | |
| roadmap | text | cronograma inicial |
| opportunity_score | int | 0–100 |
| notes | text | |
| created_at / updated_at | | |

### `projects` — projetos (Fase 3)
`id, user_id, opportunity_id FK, name, description, category, origin, audience, business_model, status (check), priority, potential int, complexity int, next_action, deadline date, notes, created_at, updated_at`.

### Fase 2/3 (estrutura pronta no schema, telas depois)
- `trends` — `id, name, description, slug, category_id, status(check), mentions int, growth numeric, first_seen_at, last_seen_at, br_potential int, chart_data jsonb`.
- `trend_mentions` — `trend_id, content_id, created_at`.
- `saas_tools` — todos os campos do escopo (nome, logo, site, descrição, problema, público, categoria, billing_model, planos jsonb, has_free_plan, has_recurrence, features[], differentiator, country, founded_at, growth_signals, competitors[], br_alternative, br_potential, complexity, br_mvp, opportunity_score…).
- `strategies` — nome, como funciona, empresas[], exemplos[], etapas[], ferramentas[], tipo_negocio, dificuldade, custo, prazo, métricas[], adaptação_br, categoria.
- `funnels` — todos os campos do escopo (empresa, tráfego, etapas jsonb, oferta, order_bump, upsell, downsell, recorrência, follow_up, canais[], obs, imagem, link, versão_br).
- `offers` — headline, subheadline, produto, público, dor, promessa, mecanismo, preço, desconto, garantia, bônus, escassez, urgência, prova_social, cta, order_bump, upsell, modelo_receita, link, found_at, análise, adaptação_br. **Somente trechos curtos/estrutura/análise — nunca a íntegra.**
- `alerts` — `id, user_id, keyword, is_active, last_triggered_at`.
- `alert_matches` — `alert_id, content_id, created_at`.

### `briefings` — Radar diário do mercado americano
`id, date (unique), title, intro_pt, top_news jsonb, trends jsonb, saas jsonb, strategies jsonb, top_opportunity jsonb, alerts jsonb, recommended jsonb, model_used, created_at`.

### Auditoria e operação
- `collection_logs` — `id, source_id, started_at, finished_at, items_found, items_new, items_skipped, status, error`.
- `activity_logs` — `id, user_id, action, entity_type, entity_id, metadata jsonb, created_at`.
- `ai_usage_logs` — `id, operation, model, input_tokens, output_tokens, cost_usd, content_id, created_at` (consumo da API no admin).
- `ai_prompts` — `id, key (unique), name, template, is_active, updated_at` (prompts editáveis pelo admin).

---

## Row Level Security (resumo)
- Tabelas **globais de inteligência** (`contents`, `content_ai_analyses`,
  `sources`, `categories`, `trends`, `saas_tools`, `strategies`, `funnels`,
  `offers`, `companies`, `tags`, `briefings`): `SELECT` para qualquer
  `authenticated`; `INSERT/UPDATE/DELETE` para `authenticated` (admin single-user)
  e para `service_role` (coleta/IA). No cenário single-user isso é seguro.
- Tabelas **pessoais** (`collections`, `collection_items`, `opportunities`,
  `projects`, `alerts`, `profiles`): apenas o dono (`user_id = auth.uid()`).
- Tabelas **operacionais** (`*_logs`, `ai_prompts`): apenas `service_role` e
  `authenticated` (admin) leem; escrita pelo `service_role`.

O SQL completo com todas as políticas está em `supabase/migrations/0002_rls.sql`.

---

## Triggers
- `set_updated_at()` — atualiza `updated_at` em cada `UPDATE` (aplicado a todas
  as tabelas com o campo).
- `handle_new_user()` — cria `profiles` ao surgir um usuário em `auth.users`.
- Derivação de `relevance_tier` a partir de `relevance_score` (via aplicação
  ou trigger — mantido na aplicação em `lib/relevance` para transparência).
