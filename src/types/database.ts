/**
 * Tipos do banco (mantidos à mão, alinhados a supabase/migrations).
 * Em produção você pode gerar automaticamente com:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

// ---- Row types ----

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
} & Timestamps;

export type Category = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  country: string | null;
  created_at: string;
};

export type SourcePriority = "alta" | "media" | "baixa";
export type SourceType =
  | "blog" | "newsletter" | "tech" | "startup" | "saas_directory"
  | "podcast" | "youtube" | "community" | "report" | "trends" | "profile" | "other";

export type Source = {
  id: string;
  name: string;
  url: string | null;
  feed_url: string | null;
  type: SourceType;
  category_id: string | null;
  priority: SourcePriority;
  authority: number;
  is_active: boolean;
  collection_method: "rss" | "api" | "manual";
  terms_ok: boolean;
  last_collected_at: string | null;
  last_status: string | null;
  last_error: string | null;
} & Timestamps;

export type ContentStatus =
  | "pending" | "processing" | "processed" | "failed" | "archived";
export type RelevanceTier =
  | "essencial" | "muito_relevante" | "relevante" | "monitorar" | "baixa";

export type Content = {
  id: string;
  source_id: string | null;
  category_id: string | null;
  title: string;
  title_pt: string | null;
  url: string;
  url_hash: string;
  title_hash: string | null;
  content_hash: string | null;
  author: string | null;
  image_url: string | null;
  country: string | null;
  excerpt: string | null;
  published_at: string | null;
  collected_at: string;
  status: ContentStatus;
  relevance_score: number | null;
  relevance_tier: RelevanceTier | null;
  novelty_score: number | null;
  br_potential_score: number | null;
  is_read: boolean;
  is_saved: boolean;
} & Timestamps;

export type ContentAiAnalysis = {
  id: string;
  content_id: string;
  summary_pt: string | null;
  key_learnings: string[] | null;
  translated_body: string | null;
  strategy: string | null;
  audience: string | null;
  monetization: string | null;
  tools: string[] | null;
  funnel: string | null;
  offer: string | null;
  br_is_common: boolean | null;
  br_maturity: string | null;
  br_niches: string[] | null;
  br_adaptation: string | null;
  br_difficulties: string | null;
  br_initial_investment: string | null;
  br_product_type: string | null;
  br_mvp: string | null;
  br_recurrence_potential: string | null;
  br_execution_difficulty: string | null;
  br_validation_speed: string | null;
  opportunity_score: number | null;
  opportunity_breakdown: Json | null;
  model_used: string | null;
  tokens_used: number | null;
} & Timestamps;

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  emoji: string | null;
} & Timestamps;

export type CollectionItemType =
  | "content" | "saas" | "strategy" | "funnel" | "offer" | "trend" | "opportunity";

export type CollectionItem = {
  id: string;
  collection_id: string;
  item_type: CollectionItemType;
  item_id: string;
  note: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  user_id: string;
  source_content_id: string | null;
  working_name: string;
  problem: string | null;
  audience: string | null;
  value_proposition: string | null;
  monetization: string | null;
  pricing: string | null;
  ticket: string | null;
  mvp: string | null;
  initial_features: string[] | null;
  acquisition: string | null;
  funnel: string | null;
  launch_offer: string | null;
  risks: string | null;
  competitors: string[] | null;
  validation_plan: string | null;
  hypotheses: string[] | null;
  roadmap: string | null;
  opportunity_score: number | null;
  notes: string | null;
} & Timestamps;

export type Briefing = {
  id: string;
  date: string;
  title: string;
  intro_pt: string | null;
  top_news: Json | null;
  trends: Json | null;
  saas: Json | null;
  strategies: Json | null;
  top_opportunity: Json | null;
  alerts: Json | null;
  recommended: Json | null;
  model_used: string | null;
  created_at: string;
};

export type CollectionLog = {
  id: string;
  source_id: string | null;
  started_at: string;
  finished_at: string | null;
  items_found: number;
  items_new: number;
  items_skipped: number;
  status: string | null;
  error: string | null;
};

export type AiUsageLog = {
  id: string;
  operation: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  content_id: string | null;
  created_at: string;
};

export type AiPrompt = {
  id: string;
  key: string;
  name: string;
  template: string;
  is_active: boolean;
  updated_at: string;
};

// ---- Helper para montar as três variações (Row/Insert/Update) ----
type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      categories: TableDef<Category>;
      companies: TableDef<Company>;
      sources: TableDef<Source>;
      contents: TableDef<Content>;
      content_ai_analyses: TableDef<ContentAiAnalysis>;
      collections: TableDef<Collection>;
      collection_items: TableDef<CollectionItem>;
      opportunities: TableDef<Opportunity>;
      briefings: TableDef<Briefing>;
      collection_logs: TableDef<CollectionLog>;
      ai_usage_logs: TableDef<AiUsageLog>;
      ai_prompts: TableDef<AiPrompt>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
