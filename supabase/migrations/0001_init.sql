-- ===========================================================================
-- Market Radar USA — Schema inicial
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).
-- ===========================================================================

create extension if not exists "pgcrypto";     -- gen_random_uuid
create extension if not exists "pg_trgm";       -- busca por similaridade

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (espelha auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories / tags / companies
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  color text default '#c9a24b',
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  website text,
  description text,
  country text default 'US',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  feed_url text,
  type text not null default 'blog'
    check (type in ('blog','newsletter','tech','startup','saas_directory',
                    'podcast','youtube','community','report','trends','profile','other')),
  category_id uuid references public.categories(id) on delete set null,
  priority text not null default 'media' check (priority in ('alta','media','baixa')),
  authority int not null default 50 check (authority between 0 and 100),
  is_active boolean not null default true,
  collection_method text not null default 'rss' check (collection_method in ('rss','api','manual')),
  terms_ok boolean not null default false,
  last_collected_at timestamptz,
  last_status text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sources_active on public.sources(is_active, priority);
create index if not exists idx_sources_last on public.sources(last_collected_at);
create trigger trg_sources_updated before update on public.sources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- contents (núcleo)
-- ---------------------------------------------------------------------------
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  title_pt text,
  url text not null,
  url_hash text not null unique,
  title_hash text,
  content_hash text,
  author text,
  image_url text,
  country text default 'US',
  excerpt text,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending','processing','processed','failed','archived')),
  relevance_score numeric(5,2),
  relevance_tier text check (relevance_tier in ('essencial','muito_relevante','relevante','monitorar','baixa')),
  novelty_score int check (novelty_score between 0 and 100),
  br_potential_score int check (br_potential_score between 0 and 100),
  is_read boolean not null default false,
  is_saved boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('portuguese',
      coalesce(title,'') || ' ' || coalesce(title_pt,'') || ' ' || coalesce(excerpt,''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_contents_status on public.contents(status);
create index if not exists idx_contents_published on public.contents(published_at desc);
create index if not exists idx_contents_relevance on public.contents(relevance_score desc);
create index if not exists idx_contents_category on public.contents(category_id);
create index if not exists idx_contents_source on public.contents(source_id);
create index if not exists idx_contents_read on public.contents(is_read);
create index if not exists idx_contents_saved on public.contents(is_saved);
create index if not exists idx_contents_search on public.contents using gin(search_vector);
create trigger trg_contents_updated before update on public.contents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- content_ai_analyses (1:1 com contents)
-- ---------------------------------------------------------------------------
create table if not exists public.content_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null unique references public.contents(id) on delete cascade,
  summary_pt text,
  key_learnings text[],
  translated_body text,
  strategy text,
  audience text,
  monetization text,
  tools text[],
  funnel text,
  offer text,
  br_is_common boolean,
  br_maturity text,
  br_niches text[],
  br_adaptation text,
  br_difficulties text,
  br_initial_investment text,
  br_product_type text,
  br_mvp text,
  br_recurrence_potential text,
  br_execution_difficulty text,
  br_validation_speed text,
  opportunity_score int check (opportunity_score between 0 and 100),
  opportunity_breakdown jsonb,
  model_used text,
  tokens_used int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ai_analyses_updated before update on public.content_ai_analyses
  for each row execute function public.set_updated_at();

-- N:N
create table if not exists public.content_tags (
  content_id uuid references public.contents(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (content_id, tag_id)
);
create table if not exists public.content_companies (
  content_id uuid references public.contents(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  primary key (content_id, company_id)
);

-- ---------------------------------------------------------------------------
-- collections / collection_items (pessoal)
-- ---------------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  emoji text default '⭐',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_collections_user on public.collections(user_id);
create trigger trg_collections_updated before update on public.collections
  for each row execute function public.set_updated_at();

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  item_type text not null check (item_type in
    ('content','saas','strategy','funnel','offer','trend','opportunity')),
  item_id uuid not null,
  note text,
  created_at timestamptz not null default now(),
  unique (collection_id, item_type, item_id)
);
create index if not exists idx_collitems_collection on public.collection_items(collection_id);

-- ---------------------------------------------------------------------------
-- opportunities (pessoal)
-- ---------------------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_content_id uuid references public.contents(id) on delete set null,
  working_name text not null,
  problem text,
  audience text,
  value_proposition text,
  monetization text,
  pricing text,
  ticket text,
  mvp text,
  initial_features text[],
  acquisition text,
  funnel text,
  launch_offer text,
  risks text,
  competitors text[],
  validation_plan text,
  hypotheses text[],
  roadmap text,
  opportunity_score int check (opportunity_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_opportunities_user on public.opportunities(user_id);
create trigger trg_opportunities_updated before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- projects (Fase 3 — estrutura pronta)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  name text not null,
  description text,
  category text,
  origin text,
  audience text,
  business_model text,
  status text not null default 'ideia'
    check (status in ('ideia','em_analise','validando','em_construcao','testando','lancado','pausado','descartado')),
  priority text default 'media',
  potential int,
  complexity int,
  next_action text,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_user on public.projects(user_id);
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- trends / saas_tools / strategies / funnels / offers (Fase 2-3 — estrutura)
-- ---------------------------------------------------------------------------
create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'emergente'
    check (status in ('emergente','em_crescimento','consolidada','em_queda','saturada')),
  mentions int default 0,
  growth numeric default 0,
  br_potential int,
  chart_data jsonb,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_trends_updated before update on public.trends
  for each row execute function public.set_updated_at();

create table if not exists public.trend_mentions (
  trend_id uuid references public.trends(id) on delete cascade,
  content_id uuid references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trend_id, content_id)
);

create table if not exists public.saas_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  description text,
  problem_solved text,
  audience text,
  category_id uuid references public.categories(id) on delete set null,
  billing_model text check (billing_model in
    ('assinatura','uso','unico','freemium','hibrido','desconhecido')),
  plans jsonb,
  has_free_plan boolean,
  has_recurrence boolean,
  features text[],
  differentiator text,
  country text default 'US',
  founded_at date,
  growth_signals text,
  competitors text[],
  br_alternative text,
  br_potential int,
  complexity int,
  br_mvp text,
  opportunity_score int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_saas_updated before update on public.saas_tools
  for each row execute function public.set_updated_at();

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  how_it_works text,
  companies text[],
  examples text[],
  steps text[],
  tools text[],
  business_type text,
  difficulty text,
  cost text,
  test_timeframe text,
  metrics text[],
  br_adaptation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_strategies_updated before update on public.strategies
  for each row execute function public.set_updated_at();

create table if not exists public.funnels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in
    ('lead_magnet','webinar','vsl','quiz','desafio','newsletter','produto_entrada',
     'tripwire','high_ticket','freemium','trial','demo','comunidade','assinatura','aplicacao','conteudo')),
  company text,
  traffic_source text,
  entry_page text,
  steps jsonb,
  main_offer text,
  order_bump text,
  upsell text,
  downsell text,
  recurrence text,
  follow_up text,
  channels text[],
  notes text,
  image_url text,
  reference_link text,
  br_adaptation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_funnels_updated before update on public.funnels
  for each row execute function public.set_updated_at();

-- Apenas trechos curtos / estrutura / análise. Nunca a íntegra protegida.
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  headline text,
  subheadline text,
  product text,
  audience text,
  main_pain text,
  promise text,
  unique_mechanism text,
  price text,
  discount text,
  guarantee text,
  bonus text,
  scarcity text,
  urgency text,
  social_proof text,
  cta text,
  order_bump text,
  upsell text,
  revenue_model text,
  link text,
  found_at timestamptz default now(),
  analysis text,
  br_adaptation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_offers_updated before update on public.offers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- alerts (Fase 3 — estrutura)
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword text not null,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.alert_matches (
  alert_id uuid references public.alerts(id) on delete cascade,
  content_id uuid references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (alert_id, content_id)
);

-- ---------------------------------------------------------------------------
-- briefings
-- ---------------------------------------------------------------------------
create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text not null default 'Radar diário do mercado americano',
  intro_pt text,
  top_news jsonb,
  trends jsonb,
  saas jsonb,
  strategies jsonb,
  top_opportunity jsonb,
  alerts jsonb,
  recommended jsonb,
  model_used text,
  created_at timestamptz not null default now()
);
create index if not exists idx_briefings_date on public.briefings(date desc);

-- ---------------------------------------------------------------------------
-- Logs / operação
-- ---------------------------------------------------------------------------
create table if not exists public.collection_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_found int default 0,
  items_new int default 0,
  items_skipped int default 0,
  status text,
  error text
);
create index if not exists idx_collogs_source on public.collection_logs(source_id, started_at desc);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  operation text not null,
  model text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,5),
  content_id uuid references public.contents(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_aiusage_created on public.ai_usage_logs(created_at desc);

create table if not exists public.ai_prompts (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  template text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger trg_aiprompts_updated before update on public.ai_prompts
  for each row execute function public.set_updated_at();
