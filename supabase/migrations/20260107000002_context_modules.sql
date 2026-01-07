-- Oraa Database Schema
-- Migration: Context Modules (Romance & Love)
-- Created: 2026-01-07
-- 
-- This migration creates tables for context-based modules (Romance & Love).
-- Templates can appear in both mechanism-based Core Domains and context-based modules.
-- See INSIGHTS_LIBRARY_STRUCTURE.md for architecture details.

-- ============================================================================
-- 1. CREATE CONTEXT MODULES TABLE
-- ============================================================================

-- Defines each context module (Romance & Love, future: Family Dynamics, Work & Career)
create table if not exists public.context_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  display_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

comment on table public.context_modules is 'Context-based modules for organizing insights by life context (Romance, Family, Work, etc.)';
comment on column public.context_modules.slug is 'URL-friendly identifier like "romance_love"';
comment on column public.context_modules.name is 'Display name like "Romance & Love"';

create index if not exists idx_context_modules_active on public.context_modules(is_active) where is_active = true;

-- ============================================================================
-- 2. CREATE CONTEXT SUBDOMAINS TABLE
-- ============================================================================

-- Subdomains within each context module (e.g., 8 romance subdomains)
create table if not exists public.context_subdomains (
  id uuid primary key default gen_random_uuid(),
  context_module_id uuid not null references public.context_modules(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  display_order integer default 0 not null,
  created_at timestamptz default now() not null,
  
  constraint unique_context_subdomain unique(context_module_id, slug)
);

comment on table public.context_subdomains is 'Subdomains within context modules (e.g., Romance subdomains: Attachment & Security, Intimacy & Sex, etc.)';
comment on column public.context_subdomains.slug is 'URL-friendly identifier like "attachment_security"';

create index if not exists idx_context_subdomains_module on public.context_subdomains(context_module_id);
create index if not exists idx_context_subdomains_slug on public.context_subdomains(slug);

-- ============================================================================
-- 3. CREATE TEMPLATE CONTEXTS JUNCTION TABLE
-- ============================================================================

-- Many-to-many: Links templates to context modules/subdomains
create table if not exists public.template_contexts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.insight_templates(id) on delete cascade,
  context_module_id uuid not null references public.context_modules(id) on delete cascade,
  context_subdomain_id uuid references public.context_subdomains(id) on delete set null,
  is_exclusive boolean default false not null,
  relevance_level text default 'primary' check (relevance_level in ('primary', 'secondary')),
  created_at timestamptz default now() not null,
  
  constraint unique_template_context unique(template_id, context_module_id, context_subdomain_id)
);

comment on table public.template_contexts is 'Links insight templates to context modules (e.g., Romance & Love)';
comment on column public.template_contexts.is_exclusive is 'If true, template only appears in this context module, not in Core Domains';
comment on column public.template_contexts.relevance_level is 'primary = main subdomain, secondary = also relevant';

create index if not exists idx_template_contexts_template on public.template_contexts(template_id);
create index if not exists idx_template_contexts_module on public.template_contexts(context_module_id);
create index if not exists idx_template_contexts_subdomain on public.template_contexts(context_subdomain_id) where context_subdomain_id is not null;
create index if not exists idx_template_contexts_exclusive on public.template_contexts(context_module_id, is_exclusive) where is_exclusive = true;

-- ============================================================================
-- 4. CREATE ADVICE OVERLAYS TABLE
-- ============================================================================

-- Context-specific advice additions (e.g., romance-specific examples)
create table if not exists public.insight_template_advice_overlays (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.insight_templates(id) on delete cascade,
  context_module_id uuid not null references public.context_modules(id) on delete cascade,
  section text not null check (section in (
    'what_this_means', 
    'how_to_recognize_it', 
    'what_to_watch_out_for', 
    'relationship_effects', 
    'the_upside', 
    'practical_strategies'
  )),
  overlay_content text not null,
  display_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint unique_template_context_section unique(template_id, context_module_id, section)
);

comment on table public.insight_template_advice_overlays is 'Context-specific advice additions (e.g., romance examples added to base advice)';
comment on column public.insight_template_advice_overlays.overlay_content is 'Additional content shown when viewing advice in this context module';

create index if not exists idx_advice_overlays_template on public.insight_template_advice_overlays(template_id);
create index if not exists idx_advice_overlays_module on public.insight_template_advice_overlays(context_module_id);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Context modules: public read
alter table public.context_modules enable row level security;
create policy "Anyone can view active context modules"
  on public.context_modules for select
  using (is_active = true);

-- Context subdomains: public read
alter table public.context_subdomains enable row level security;
create policy "Anyone can view context subdomains"
  on public.context_subdomains for select
  using (true);

-- Template contexts: public read
alter table public.template_contexts enable row level security;
create policy "Anyone can view template contexts"
  on public.template_contexts for select
  using (true);

-- Advice overlays: public read
alter table public.insight_template_advice_overlays enable row level security;
create policy "Anyone can view advice overlays"
  on public.insight_template_advice_overlays for select
  using (true);

-- ============================================================================
-- 6. GRANTS FOR SERVICE ROLE
-- ============================================================================

grant all on public.context_modules to service_role;
grant all on public.context_subdomains to service_role;
grant all on public.template_contexts to service_role;
grant all on public.insight_template_advice_overlays to service_role;

