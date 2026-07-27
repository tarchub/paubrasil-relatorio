-- ===========================================================================
-- Seed — categorias, prompts e fontes reais (RSS).
-- Fontes entram com is_active=true mas terms_ok=false: revise os termos de uso
-- de cada uma no painel administrativo antes de confiar plenamente na coleta.
-- (A coleta funciona; terms_ok é um lembrete de compliance para você.)
-- ===========================================================================

-- ---- Categorias ----
insert into public.categories (slug, name, color) values
  ('marketing',    'Marketing Digital',    '#c9a24b'),
  ('funis',        'Funis de Vendas',      '#c9a24b'),
  ('infoprodutos', 'Infoprodutos',         '#c9a24b'),
  ('saas',         'SaaS',                 '#c9a24b'),
  ('ia',           'IA aplicada',          '#c9a24b'),
  ('automacao',    'Automação',            '#c9a24b'),
  ('trafego',      'Tráfego Pago',         '#c9a24b'),
  ('copywriting',  'Copywriting',          '#c9a24b'),
  ('growth',       'Growth',               '#c9a24b'),
  ('ecommerce',    'E-commerce',           '#c9a24b'),
  ('comunidades',  'Comunidades Pagas',    '#c9a24b'),
  ('assinaturas',  'Modelos de Assinatura','#c9a24b'),
  ('agencias',     'Agências',             '#c9a24b'),
  ('ferramentas',  'Ferramentas de Vendas','#c9a24b'),
  ('monetizacao',  'Monetização',          '#c9a24b'),
  ('modelos',      'Novos Modelos',        '#c9a24b')
on conflict (slug) do nothing;

-- ---- Fontes iniciais (RSS) ----
-- Ajuste feed_url após validar cada endpoint no admin.
insert into public.sources (name, url, feed_url, type, priority, authority, collection_method, is_active, terms_ok)
values
  ('TechCrunch',            'https://techcrunch.com',              'https://techcrunch.com/feed/',                 'tech',    'alta',  85, 'rss', true, false),
  ('Hacker News',           'https://news.ycombinator.com',        'https://hnrss.org/frontpage',                  'community','alta', 80, 'rss', true, false),
  ('HubSpot Marketing',     'https://blog.hubspot.com/marketing',  'https://blog.hubspot.com/marketing/rss.xml',   'blog',    'media', 75, 'rss', true, false),
  ('Search Engine Journal', 'https://www.searchenginejournal.com', 'https://www.searchenginejournal.com/feed/',    'blog',    'media', 70, 'rss', true, false),
  ('Social Media Examiner', 'https://www.socialmediaexaminer.com', 'https://www.socialmediaexaminer.com/feed/',    'blog',    'media', 68, 'rss', true, false),
  ('OpenAI Blog',           'https://openai.com/blog',             'https://openai.com/blog/rss.xml',              'report',  'alta',  82, 'rss', true, false),
  ('Shopify Blog',          'https://www.shopify.com/blog',        'https://www.shopify.com/blog.atom',            'blog',    'media', 72, 'rss', true, false),
  ('Y Combinator',          'https://www.ycombinator.com/blog',    'https://www.ycombinator.com/blog/rss',         'startup', 'media', 80, 'rss', true, false)
on conflict do nothing;

-- ---- Prompts de IA (editáveis no admin) ----
insert into public.ai_prompts (key, name, template) values
  ('translate_title', 'Tradução de título',
   'Traduza o título a seguir para português do Brasil, preservando termos técnicos de marketing/tech em inglês quando fizer sentido. Responda apenas com o título traduzido.'),
  ('analyze', 'Análise completa do conteúdo',
   'Você é um analista de inteligência de mercado. Analise o conteúdo do mercado americano e produza a análise estruturada em JSON conforme o schema fornecido, incluindo a seção "Como aplicar no Brasil" e a nota de oportunidade de 0 a 100.'),
  ('daily_briefing', 'Briefing diário',
   'Monte o "Radar diário do mercado americano" em português, com 5 novidades, 3 tendências, 3 SaaS, 2 estratégias, 1 oportunidade de alto potencial no Brasil, alertas e recomendações de leitura.')
on conflict (key) do nothing;
