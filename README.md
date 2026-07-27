# Market Radar USA

Central **privada** de inteligência de mercado. Acompanha o mercado americano
(marketing digital, funis, infoprodutos, SaaS, IA aplicada, automação, tráfego,
copy, growth, e-commerce, comunidades, assinaturas, agências e novos modelos de
negócio) e usa IA para traduzir, resumir, classificar e **transformar tudo em
oportunidades práticas para o mercado brasileiro**.

> Uso próprio (single-tenant). Sem cadastro público.

## Documentos de planejamento
- [`PLANO-DE-DESENVOLVIMENTO.md`](./PLANO-DE-DESENVOLVIMENTO.md) — arquitetura, stack, fases.
- [`BANCO-DE-DADOS.md`](./BANCO-DE-DADOS.md) — modelagem, enums, RLS, auditoria.
- [`FONTES-E-INTEGRACOES.md`](./FONTES-E-INTEGRACOES.md) — fontes, compliance, IA, cron.
- [`.env.example`](./.env.example) — todas as credenciais necessárias.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth +
RLS) · RSS (`rss-parser`) · IA plugável (Anthropic/OpenAI) · Vercel Cron · Deploy Vercel.

## O que já existe (MVP — Fase 1)
- ✅ Login privado (Supabase Auth) + rotas protegidas por middleware
- ✅ Schema completo + RLS + seed de fontes reais
- ✅ Painel administrativo (cadastro/edição/pausa de fontes, disparos, logs, consumo de IA)
- ✅ Coleta por RSS (manual + cron)
- ✅ Pipeline de IA: tradução, resumo, aprendizados, classificação, análise "Como aplicar no Brasil" + nota 0–100
- ✅ Feed de inteligência com filtros (período, categoria, não lidos, salvos, ordenação)
- ✅ Página de análise completa do conteúdo (com toggle original/PT/lado a lado)
- ✅ Favoritos e coleções
- ✅ Busca global (PT/EN)
- ✅ Briefing diário ("Radar diário do mercado americano")
- ✅ Banco de oportunidades (criar a partir de um conteúdo)
- ✅ Deploy preparado para Vercel (`vercel.json` com crons)

Módulos de Fase 2/3 (Radar de tendências, Radar de SaaS, Biblioteca de funis, Banco
de ofertas, Projetos/Kanban, Alertas) já têm **tabelas prontas no banco** e telas
marcadas como "em breve", conforme o plano de fases.

## Rodando localmente

```bash
# 1. Dependências
npm install

# 2. Ambiente
cp .env.example .env.local
# Preencha: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#           SUPABASE_SERVICE_ROLE_KEY, AI_PROVIDER e a chave do provedor de IA.

# 3. Banco (Supabase)
#    No SQL Editor do painel, execute em ordem:
#      supabase/migrations/0001_init.sql
#      supabase/migrations/0002_rls.sql
#      supabase/seed.sql
#    (ou, com a CLI do Supabase: `supabase db push`)

# 4. Usuário privado (uma vez)
npm run create-user voce@dominio.com "SuaSenhaForte"

# 5. Subir
npm run dev   # http://localhost:3000
```

Depois de logar: vá em **Administração → Rodar coleta**, depois **Processar
pendentes (IA)** e **Gerar briefing diário**. O feed e o dashboard se preenchem.

### Verificações
```bash
npm run typecheck   # tipos
npm run lint        # lint
npm run build       # build de produção
```

## Deploy na Vercel
1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente do `.env.example` (inclua `CRON_SECRET`).
3. `vercel.json` já registra os cron jobs (coleta horária, processamento a cada 15
   min, briefing diário). A Vercel autentica os crons via `CRON_SECRET`.
4. Deploy.

## APIs e credenciais necessárias
| Serviço | Variável | MVP? |
|---|---|---|
| Supabase (URL, anon, service_role) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| Provedor de IA | `AI_PROVIDER` + `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` ou `OPENAI_API_KEY`/`OPENAI_MODEL` | ✅ |
| Cron | `CRON_SECRET` | ✅ (prod) |
| Product Hunt / Reddit / YouTube / SerpApi | `PRODUCT_HUNT_TOKEN`, `REDDIT_*`, `YOUTUBE_API_KEY`, `SERPAPI_KEY` | ❌ (Fase 2-3) |

Onde uma integração depende de credencial paga/externa, a **estrutura já existe** e o
ponto de inserção da chave está comentado no código (`// TODO(cred): …`) e listado em
`FONTES-E-INTEGRACOES.md`.

## Compliance de conteúdo
Coletamos apenas **título, link, metadados, trechos curtos, resumos gerados e análises
próprias** — nunca o conteúdo íntegro protegido. Cada fonte tem `terms_ok` para você
confirmar os termos de uso antes de confiar plenamente na coleta.

## Segurança
Autenticação Supabase, rotas privadas via middleware, **RLS ligado em todas as
tabelas**, `service_role` e chaves de IA apenas no servidor, validação com Zod, rate
limiting nos disparos manuais e logs de coleta/atividade/consumo.

---

> `legacy/relatorio-pau-brasil.html` — relatório estático antigo ("Pau Brasil"),
> preservado aqui e não faz parte da aplicação Next.js.
