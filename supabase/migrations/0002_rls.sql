-- ===========================================================================
-- Market Radar USA — Row Level Security
-- Modelo single-user: qualquer usuário autenticado é o "dono" da plataforma.
-- Tabelas de inteligência global: leitura por autenticados; escrita por
-- autenticados (admin) e service_role (coleta/IA).
-- Tabelas pessoais: apenas o dono (user_id = auth.uid()).
-- ===========================================================================

-- Habilita RLS em tudo
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in (
        'profiles','categories','tags','companies','sources','contents',
        'content_ai_analyses','content_tags','content_companies','collections',
        'collection_items','opportunities','projects','trends','trend_mentions',
        'saas_tools','strategies','funnels','offers','alerts','alert_matches',
        'briefings','collection_logs','activity_logs','ai_usage_logs','ai_prompts')
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Helper: políticas de leitura para qualquer autenticado
-- (o service_role ignora RLS por padrão, então escrita server-side sempre passa)

-- ---- profiles: dono ----
create policy "profiles_self_select" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update to authenticated using (id = auth.uid());

-- ---- Inteligência global: SELECT p/ autenticados, escrita p/ autenticados ----
do $$
declare t text;
begin
  for t in select unnest(array[
    'categories','tags','companies','sources','contents','content_ai_analyses',
    'content_tags','content_companies','trends','trend_mentions','saas_tools',
    'strategies','funnels','offers','briefings'])
  loop
    execute format($f$
      create policy "%1$s_read" on public.%1$s
        for select to authenticated using (true);
    $f$, t);
    execute format($f$
      create policy "%1$s_write" on public.%1$s
        for all to authenticated using (true) with check (true);
    $f$, t);
  end loop;
end $$;

-- ---- Pessoais: apenas o dono ----
create policy "collections_owner" on public.collections
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "collection_items_owner" on public.collection_items
  for all to authenticated using (
    exists (select 1 from public.collections c
            where c.id = collection_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.collections c
            where c.id = collection_id and c.user_id = auth.uid())
  );

create policy "opportunities_owner" on public.opportunities
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "projects_owner" on public.projects
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "alerts_owner" on public.alerts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "alert_matches_owner" on public.alert_matches
  for all to authenticated using (
    exists (select 1 from public.alerts a where a.id = alert_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.alerts a where a.id = alert_id and a.user_id = auth.uid())
  );

-- ---- Operacionais: leitura por autenticados (admin), escrita por service_role ----
do $$
declare t text;
begin
  for t in select unnest(array['collection_logs','activity_logs','ai_usage_logs','ai_prompts'])
  loop
    execute format($f$
      create policy "%1$s_read" on public.%1$s
        for select to authenticated using (true);
    $f$, t);
  end loop;
end $$;

-- ai_prompts também é editável pelo admin autenticado
create policy "ai_prompts_write" on public.ai_prompts
  for all to authenticated using (true) with check (true);
