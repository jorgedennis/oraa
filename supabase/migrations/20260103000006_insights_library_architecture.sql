-- Oraa Database Schema
-- Migration: Insights Library Architecture
-- Created: 2026-01-07
-- 
-- This migration implements the template-based insights system:
-- - Large-scale template library (1,700-2,300 templates)
-- - Hybrid retrieval (pgvector + Postgres full-text search)
-- - Chunk-based detection cadence
-- - Detect → Accumulate → Promote model
-- - Insight advice content per template

-- ============================================================================
-- 1. ENABLE PGVECTOR EXTENSION
-- ============================================================================

-- Enable pgvector extension for semantic search (embedding similarity)
create extension if not exists vector;

-- ============================================================================
-- 2. CREATE INSIGHT CATEGORIES TABLE
-- ============================================================================

-- Hierarchical organization of insight templates
-- Structure: Domain (5) → Category (10-20) → Subcategory (5-15) → Template (5-20)
create table if not exists public.insight_categories (
  id uuid primary key default gen_random_uuid(),
  domain_id text not null references public.domains(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  parent_category_id uuid references public.insight_categories(id) on delete set null,
  display_order integer default 0 not null,
  created_at timestamptz default now() not null,
  
  constraint unique_category_slug unique(domain_id, slug)
);

comment on table public.insight_categories is 'Hierarchical organization of insight templates by domain';
comment on column public.insight_categories.slug is 'URL-friendly identifier unique within domain';
comment on column public.insight_categories.parent_category_id is 'Self-reference for nested categories (subcategories)';

create index if not exists idx_insight_categories_domain on public.insight_categories(domain_id);
create index if not exists idx_insight_categories_parent on public.insight_categories(parent_category_id) where parent_category_id is not null;

-- ============================================================================
-- 3. CREATE INSIGHT TEMPLATES TABLE
-- ============================================================================

-- The template library: curated insight texts with search support
-- Target: 1,700-2,300 templates across all domains
create table if not exists public.insight_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  insight_text text not null,
  domain_id text not null references public.domains(id) on delete cascade,
  category_id uuid references public.insight_categories(id) on delete set null,
  subcategory text,
  subtype text check (subtype in ('pattern', 'belief', 'trigger', 'coping_style')),
  search_variants text[] default array[]::text[],
  search_keywords text[] default array[]::text[],
  embedding vector(1536), -- OpenAI text-embedding-ada-002 dimension
  prevalence text default 'common' check (prevalence in ('very_common', 'common', 'less_common', 'rare')),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.insight_templates is 'Curated library of insight templates (1,700-2,300 templates)';
comment on column public.insight_templates.slug is 'Unique identifier like "over-responsibility" for exact matching';
comment on column public.insight_templates.insight_text is 'Canonical user-facing wording following guardrails';
comment on column public.insight_templates.search_variants is 'Array of synonyms/paraphrases for retrieval (5-15 per template)';
comment on column public.insight_templates.search_keywords is 'Explicit keywords for BM25 lexical search';
comment on column public.insight_templates.embedding is 'Pre-computed vector embedding for semantic search';
comment on column public.insight_templates.prevalence is 'Expected frequency: very_common, common, less_common, rare';

-- Full-text search column (tsvector) for lexical search (BM25-like)
-- Using a regular column + trigger instead of generated column because to_tsvector is not immutable
alter table public.insight_templates 
  add column if not exists search_vector tsvector;

-- Function to update search_vector
create or replace function public.insight_templates_search_vector_update()
returns trigger as $$
begin
  new.search_vector := to_tsvector('english', 
    coalesce(new.insight_text, '') || ' ' || 
    coalesce(array_to_string(new.search_variants, ' '), '') || ' ' ||
    coalesce(array_to_string(new.search_keywords, ' '), '')
  );
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update search_vector on insert/update
create trigger insight_templates_search_vector_trigger
  before insert or update on public.insight_templates
  for each row execute function public.insight_templates_search_vector_update();

-- Indexes for efficient retrieval
create index if not exists idx_insight_templates_domain on public.insight_templates(domain_id) where is_active = true;
create index if not exists idx_insight_templates_category on public.insight_templates(category_id) where is_active = true;
create index if not exists idx_insight_templates_slug on public.insight_templates(slug);
create index if not exists idx_insight_templates_subtype on public.insight_templates(subtype) where is_active = true;

-- GIN index for full-text search
create index if not exists idx_insight_templates_search_vector on public.insight_templates using gin(search_vector);

-- IVFFlat index for vector similarity search (pgvector)
-- Note: lists = 100 is suitable for up to ~100k vectors; adjust if library grows significantly
create index if not exists idx_insight_templates_embedding on public.insight_templates 
  using ivfflat (embedding vector_cosine_ops) 
  with (lists = 100) 
  where embedding is not null;

-- ============================================================================
-- 4. CREATE INSIGHT TEMPLATE ADVICE TABLE
-- ============================================================================

-- Advice content per template - 6 sections per template
create table if not exists public.insight_template_advice (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.insight_templates(id) on delete cascade,
  section text not null check (section in (
    'what_this_means', 
    'how_to_recognize_it', 
    'what_to_watch_out_for', 
    'relationship_effects', 
    'the_upside', 
    'practical_strategies'
  )),
  content text not null,
  display_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint unique_template_section unique(template_id, section)
);

comment on table public.insight_template_advice is 'Advice content sections for each insight template';
comment on column public.insight_template_advice.section is 'One of 6 advice sections: what_this_means, how_to_recognize_it, what_to_watch_out_for, relationship_effects, the_upside, practical_strategies';
comment on column public.insight_template_advice.content is 'The advice text for this section';
comment on column public.insight_template_advice.display_order is 'Order within each section type (for multiple strategies etc)';

create index if not exists idx_insight_advice_template on public.insight_template_advice(template_id);

-- ============================================================================
-- 5. CREATE INSIGHT EVIDENCE TABLE
-- ============================================================================

-- Accumulation tracking (per user + template)
-- Tracks evidence across sessions for promotion logic
create table if not exists public.insight_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  template_id uuid references public.insight_templates(id) on delete cascade,
  novel_insight_hash text, -- For novel insights (hash of insight text as identifier)
  cross_session_hits integer default 0 not null,
  last_session_id_with_hit uuid references public.sessions(id) on delete set null,
  max_confidence numeric(3,2) default 0.00 check (max_confidence >= 0.00 and max_confidence <= 1.00),
  first_detected_at timestamptz default now() not null,
  last_detected_at timestamptz default now() not null,
  best_evidence_summary text,
  best_conversation_id uuid references public.conversations(id) on delete set null,
  status text default 'accumulating' check (status in ('accumulating', 'promoted', 'dismissed')),
  promoted_at timestamptz,
  promotion_reason text check (promotion_reason in ('slam_dunk', 'within_session_repeat', 'cross_session_recurrence')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Either template_id or novel_insight_hash must be set, but not both
  constraint check_template_or_novel check (
    (template_id is not null and novel_insight_hash is null) or 
    (template_id is null and novel_insight_hash is not null)
  )
);

comment on table public.insight_evidence is 'Tracks evidence accumulation for insight template promotion per user';
comment on column public.insight_evidence.cross_session_hits is 'Distinct previous sessions with strong hit (≥0.65)';
comment on column public.insight_evidence.last_session_id_with_hit is 'Prevents double-counting same session for cross_session_hits';
comment on column public.insight_evidence.max_confidence is 'Highest confidence score seen for this template';
comment on column public.insight_evidence.best_evidence_summary is 'One sentence summary for debugging/UX';
comment on column public.insight_evidence.status is 'accumulating (collecting evidence), promoted (staged), dismissed (user said No)';
comment on column public.insight_evidence.promotion_reason is 'Why this was promoted: slam_dunk (≥0.88), within_session_repeat (2+ hits), cross_session_recurrence';
comment on column public.insight_evidence.novel_insight_hash is 'For novel insights: hash of insight text as identifier';

-- Unique constraints (separate for template and novel to allow both patterns)
create unique index if not exists idx_insight_evidence_user_template 
  on public.insight_evidence(user_id, template_id) where template_id is not null;
create unique index if not exists idx_insight_evidence_user_novel 
  on public.insight_evidence(user_id, novel_insight_hash) where novel_insight_hash is not null;

create index if not exists idx_insight_evidence_user on public.insight_evidence(user_id, status);
create index if not exists idx_insight_evidence_template on public.insight_evidence(template_id) where template_id is not null;
create index if not exists idx_insight_evidence_accumulating on public.insight_evidence(user_id) where status = 'accumulating';

-- ============================================================================
-- 6. CREATE SESSION INSIGHT TRACKING TABLE
-- ============================================================================

-- Within-session tracking (ephemeral - resets each session)
-- Tracks within_session_hits for promotion logic
create table if not exists public.session_insight_tracking (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  template_id uuid references public.insight_templates(id) on delete cascade,
  novel_insight_hash text, -- For novel insights
  within_session_hits integer default 0 not null,
  max_confidence_this_session numeric(3,2) default 0.00 check (max_confidence_this_session >= 0.00 and max_confidence_this_session <= 1.00),
  chunks_with_hit uuid[] default array[]::uuid[], -- Prevents double-counting same chunk
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Either template_id or novel_insight_hash must be set, but not both
  constraint check_session_template_or_novel check (
    (template_id is not null and novel_insight_hash is null) or 
    (template_id is null and novel_insight_hash is not null)
  )
);

comment on table public.session_insight_tracking is 'Within-session tracking for promotion logic (resets each session)';
comment on column public.session_insight_tracking.within_session_hits is 'Distinct chunks in current session with strong hit (≥0.65)';
comment on column public.session_insight_tracking.max_confidence_this_session is 'Highest confidence score in this session';
comment on column public.session_insight_tracking.chunks_with_hit is 'Array of chunk IDs to prevent same-chunk counting';

-- Unique constraints
create unique index if not exists idx_session_tracking_session_template 
  on public.session_insight_tracking(session_id, template_id) where template_id is not null;
create unique index if not exists idx_session_tracking_session_novel 
  on public.session_insight_tracking(session_id, novel_insight_hash) where novel_insight_hash is not null;

create index if not exists idx_session_tracking_session on public.session_insight_tracking(session_id);
create index if not exists idx_session_tracking_user on public.session_insight_tracking(user_id, session_id);

-- ============================================================================
-- 7. MODIFY INSIGHTS TABLE
-- ============================================================================

-- Add template-based columns to existing insights table
alter table public.insights 
  add column if not exists template_id uuid references public.insight_templates(id) on delete set null,
  add column if not exists is_novel boolean default false not null,
  add column if not exists detection_confidence numeric(3,2) check (detection_confidence >= 0.00 and detection_confidence <= 1.00),
  add column if not exists promotion_reason text check (promotion_reason in ('slam_dunk', 'within_session_repeat', 'cross_session_recurrence'));

comment on column public.insights.template_id is 'Reference to insight template (NULL for novel insights)';
comment on column public.insights.is_novel is 'True if this is a novel insight not from template library';
comment on column public.insights.detection_confidence is 'Confidence score at time of promotion (0.00-1.00)';
comment on column public.insights.promotion_reason is 'Why promoted: slam_dunk, within_session_repeat, cross_session_recurrence';

create index if not exists idx_insights_template on public.insights(template_id) where template_id is not null;
create index if not exists idx_insights_novel on public.insights(user_id, is_novel) where is_novel = true;

-- ============================================================================
-- 8. MODIFY STAGING_QUEUE TABLE
-- ============================================================================

-- Add template-based columns to staging queue
alter table public.staging_queue 
  add column if not exists template_id uuid references public.insight_templates(id) on delete set null,
  add column if not exists confidence numeric(3,2) check (confidence >= 0.00 and confidence <= 1.00),
  add column if not exists promotion_reason text check (promotion_reason in ('slam_dunk', 'within_session_repeat', 'cross_session_recurrence')),
  add column if not exists evidence_summary text;

comment on column public.staging_queue.template_id is 'Reference to insight template (NULL for novel insights)';
comment on column public.staging_queue.confidence is 'Detection confidence score (0.00-1.00)';
comment on column public.staging_queue.promotion_reason is 'Why promoted: slam_dunk, within_session_repeat, cross_session_recurrence';
comment on column public.staging_queue.evidence_summary is 'One sentence describing the evidence for this insight';

create index if not exists idx_staging_template on public.staging_queue(template_id) where template_id is not null;

-- ============================================================================
-- 9. MODIFY SESSIONS TABLE
-- ============================================================================

-- Add session summary for rolling summary in chunk-based detection
alter table public.sessions 
  add column if not exists session_summary text,
  add column if not exists last_activity_at timestamptz default now() not null;

comment on column public.sessions.session_summary is 'Rolling summary of session for chunk-based insight detection';
comment on column public.sessions.last_activity_at is 'Last message timestamp for session timeout detection (15 min inactivity)';

create index if not exists idx_sessions_last_activity on public.sessions(last_activity_at) where user_id is null;

-- ============================================================================
-- 10. HYBRID RETRIEVAL FUNCTION
-- ============================================================================

-- Function to retrieve candidate templates using both semantic and lexical search
-- Returns up to p_top_k candidates from each method, then caller should union/dedupe
create or replace function public.get_insight_template_candidates(
  p_query_text text,
  p_query_embedding vector(1536) default null,
  p_domain_ids text[] default null,
  p_top_k integer default 40,
  p_similarity_threshold numeric default 0.60
)
returns table (
  id uuid,
  slug text,
  insight_text text,
  domain_id text,
  category_id uuid,
  subtype text,
  retrieval_score numeric,
  retrieval_source text
) as $$
begin
  -- If embedding provided, do semantic search
  if p_query_embedding is not null then
    return query
    select 
      t.id,
      t.slug,
      t.insight_text,
      t.domain_id,
      t.category_id,
      t.subtype,
      (1 - (t.embedding <=> p_query_embedding))::numeric as retrieval_score,
      'semantic'::text as retrieval_source
    from public.insight_templates t
    where t.is_active = true
      and t.embedding is not null
      and (p_domain_ids is null or t.domain_id = any(p_domain_ids))
      and (1 - (t.embedding <=> p_query_embedding)) >= p_similarity_threshold
    order by t.embedding <=> p_query_embedding
    limit p_top_k;
  end if;
  
  -- Lexical search (full-text) - always run if query_text provided
  if p_query_text is not null and length(trim(p_query_text)) > 0 then
    return query
    select 
      t.id,
      t.slug,
      t.insight_text,
      t.domain_id,
      t.category_id,
      t.subtype,
      ts_rank_cd(t.search_vector, plainto_tsquery('english', p_query_text))::numeric as retrieval_score,
      'lexical'::text as retrieval_source
    from public.insight_templates t
    where t.is_active = true
      and (p_domain_ids is null or t.domain_id = any(p_domain_ids))
      and t.search_vector @@ plainto_tsquery('english', p_query_text)
    order by ts_rank_cd(t.search_vector, plainto_tsquery('english', p_query_text)) desc
    limit p_top_k;
  end if;
end;
$$ language plpgsql stable;

comment on function public.get_insight_template_candidates is 'Hybrid retrieval: returns candidates from semantic (pgvector) and lexical (full-text) search';

-- ============================================================================
-- 11. GET TEMPLATE ADVICE FUNCTION
-- ============================================================================

-- Function to get all advice sections for a template
create or replace function public.get_template_advice(p_template_id uuid)
returns table (
  section text,
  content text,
  display_order integer
) as $$
begin
  return query
  select 
    a.section,
    a.content,
    a.display_order
  from public.insight_template_advice a
  where a.template_id = p_template_id
  order by 
    case a.section
      when 'what_this_means' then 1
      when 'how_to_recognize_it' then 2
      when 'what_to_watch_out_for' then 3
      when 'relationship_effects' then 4
      when 'the_upside' then 5
      when 'practical_strategies' then 6
    end,
    a.display_order;
end;
$$ language plpgsql stable;

comment on function public.get_template_advice is 'Get all advice sections for an insight template in display order';

-- ============================================================================
-- 12. RLS POLICIES
-- ============================================================================

-- insight_templates: public read (templates are shared library)
alter table public.insight_templates enable row level security;

create policy "Anyone can view active insight templates"
  on public.insight_templates for select
  using (is_active = true);

-- insight_categories: public read
alter table public.insight_categories enable row level security;

create policy "Anyone can view insight categories"
  on public.insight_categories for select
  using (true);

-- insight_template_advice: public read
alter table public.insight_template_advice enable row level security;

create policy "Anyone can view template advice"
  on public.insight_template_advice for select
  using (true);

-- insight_evidence: users see only their own
alter table public.insight_evidence enable row level security;

create policy "Users can view their own insight evidence"
  on public.insight_evidence for select
  using (auth.uid() = user_id);

create policy "Users can insert their own insight evidence"
  on public.insight_evidence for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own insight evidence"
  on public.insight_evidence for update
  using (auth.uid() = user_id);

-- session_insight_tracking: users see only their own
alter table public.session_insight_tracking enable row level security;

create policy "Users can view their own session tracking"
  on public.session_insight_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert their own session tracking"
  on public.session_insight_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own session tracking"
  on public.session_insight_tracking for update
  using (auth.uid() = user_id);

-- ============================================================================
-- 13. GRANTS FOR SERVICE ROLE (n8n workflows)
-- ============================================================================

-- Grant full access to service role for n8n workflows
grant all on public.insight_templates to service_role;
grant all on public.insight_categories to service_role;
grant all on public.insight_template_advice to service_role;
grant all on public.insight_evidence to service_role;
grant all on public.session_insight_tracking to service_role;

-- Grant execute on functions
grant execute on function public.get_insight_template_candidates to service_role;
grant execute on function public.get_template_advice to service_role;
grant execute on function public.get_insight_template_candidates to anon;
grant execute on function public.get_template_advice to anon;
grant execute on function public.get_insight_template_candidates to authenticated;
grant execute on function public.get_template_advice to authenticated;

