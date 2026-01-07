-- Oraa Database Schema
-- Migration: Initial Schema
-- Created: 2026-01-03
--
-- ⚠️ WARNING: This migration uses DROP TABLE statements.
-- This is ONLY safe for fresh/empty databases.
-- DO NOT run this on a database with existing user data!
-- 
-- If you need to modify existing tables, use ALTER TABLE instead.
-- See MIGRATION_GUIDELINES.md for safe migration practices.

-- ============================================================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ⚠️ DANGEROUS: Only use for initial setup on empty database
-- ============================================================================

drop table if exists public.user_daily_usage cascade;
drop table if exists public.thread_suggestions cascade;
drop table if exists public.insights cascade;
drop table if exists public.user_domains cascade;
drop table if exists public.journal_reflections cascade;
drop table if exists public.journal_entries cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.thread_questions cascade;
drop table if exists public.thread_patterns cascade;
drop table if exists public.thread_entries cascade;
drop table if exists public.threads cascade;
drop table if exists public.domains cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.sessions cascade;
drop table if exists public.users cascade;

-- Drop existing functions
drop function if exists public.handle_updated_at() cascade;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

-- Extends Supabase auth.users with app-specific profile data
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  is_anonymous boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.users is 'User profiles extending Supabase auth';
comment on column public.users.is_anonymous is 'True until user creates a full account';

-- Anonymous device sessions (can be claimed by user when they register)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  user_id uuid references public.users(id) on delete set null,
  claimed_at timestamptz,
  message_allowance integer default 10 not null,
  messages_used integer default 0 not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '30 days') not null
);

comment on table public.sessions is 'Anonymous device sessions that can be claimed by registered users';
comment on column public.sessions.device_id is 'Unique device identifier generated client-side';
comment on column public.sessions.claimed_at is 'Timestamp when session was linked to a registered user';
comment on column public.sessions.message_allowance is 'Lifetime message cap for anonymous sessions (default 10)';
comment on column public.sessions.messages_used is 'Number of messages consumed by this anonymous session';

create index idx_sessions_device_id on public.sessions(device_id);
create index idx_sessions_user_id on public.sessions(user_id) where user_id is not null;
create index idx_sessions_expires_at on public.sessions(expires_at);

-- User preferences
create table public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  theme text default 'ocean' not null,
  message_limit integer default 40 not null,
  notifications_enabled boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.user_preferences is 'User app preferences and settings';

-- ============================================================================
-- 2. DOMAINS (Static reference data)
-- ============================================================================

-- The 7 psychological domains for the user's "Map"
create table public.domains (
  id text primary key,
  name text not null,
  icon text not null,
  display_order integer not null
);

comment on table public.domains is 'Static reference table for the 7 psychological domains';

-- ============================================================================
-- 3. THREADS
-- ============================================================================

-- Ongoing storylines/topics that span multiple conversations
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  current_understanding text,
  status text default 'active' not null check (status in ('active', 'resolved', 'paused')),
  mention_count integer default 0 not null,
  last_mentioned_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

comment on table public.threads is 'Ongoing storylines that span multiple conversations';
comment on column public.threads.current_understanding is 'AI-generated summary of current thread state';
comment on column public.threads.status is 'Thread lifecycle status: active, resolved, or paused';

create index idx_threads_user_id on public.threads(user_id);
create index idx_threads_status on public.threads(user_id, status) where deleted_at is null;

-- Timeline entries for threads (conversation summaries)
create table public.thread_entries (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  conversation_id uuid, -- Will be foreign key after conversations table
  summary text not null,
  entry_date date not null,
  created_at timestamptz default now() not null
);

comment on table public.thread_entries is 'Timeline of conversation summaries linked to a thread';

create index idx_thread_entries_thread_id on public.thread_entries(thread_id, entry_date desc);

-- Patterns noticed in threads
create table public.thread_patterns (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  pattern text not null,
  created_at timestamptz default now() not null
);

comment on table public.thread_patterns is 'AI-identified patterns within a thread';

create index idx_thread_patterns_thread_id on public.thread_patterns(thread_id);

-- Open questions for threads
create table public.thread_questions (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  question text not null,
  is_answered boolean default false not null,
  created_at timestamptz default now() not null
);

comment on table public.thread_questions is 'Open questions the AI is curious about for a thread';

create index idx_thread_questions_thread_id on public.thread_questions(thread_id);

-- ============================================================================
-- 4. CONVERSATIONS & MESSAGES
-- ============================================================================

-- Individual chat conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  thread_id uuid references public.threads(id) on delete set null,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  message_count integer default 0 not null,
  created_at timestamptz default now() not null,
  deleted_at timestamptz
);

comment on table public.conversations is 'Chat conversations between user and Oraa';
comment on column public.conversations.user_id is 'Null for anonymous sessions until claimed';
comment on column public.conversations.session_id is 'Links anonymous conversations to device session';
comment on column public.conversations.thread_id is 'Optional link to an ongoing thread topic';

create index idx_conversations_user_id on public.conversations(user_id) where user_id is not null;
create index idx_conversations_session_id on public.conversations(session_id) where session_id is not null;
create index idx_conversations_thread_id on public.conversations(thread_id) where thread_id is not null;
create index idx_conversations_started_at on public.conversations(started_at desc);

-- Add foreign key constraint to thread_entries now that conversations exists
alter table public.thread_entries 
  add constraint fk_thread_entries_conversation 
  foreign key (conversation_id) references public.conversations(id) on delete set null;

-- Individual messages within conversations
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  content text not null,
  is_user boolean not null,
  sequence_number integer not null,
  created_at timestamptz default now() not null
);

comment on table public.messages is 'Individual messages within a conversation';
comment on column public.messages.is_user is 'True for user messages, false for AI messages';
comment on column public.messages.sequence_number is 'Order of message within conversation';

create index idx_messages_conversation on public.messages(conversation_id, sequence_number);

-- ============================================================================
-- 5. JOURNAL
-- ============================================================================

-- Daily journal entries generated from conversations
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  entry_date date not null,
  day_of_week text not null,
  summary text not null,
  conversation_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint unique_user_entry_date unique(user_id, entry_date)
);

comment on table public.journal_entries is 'AI-generated daily summaries of conversations';
comment on column public.journal_entries.summary is 'AI narrative of the day conversation';
comment on column public.journal_entries.conversation_count is 'Number of messages exchanged that day';

create index idx_journal_entries_user_date on public.journal_entries(user_id, entry_date desc);

-- User reflections on journal entries
create table public.journal_reflections (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null
);

comment on table public.journal_reflections is 'User-written reflections on journal entries';

create index idx_journal_reflections_entry on public.journal_reflections(journal_entry_id);

-- ============================================================================
-- 6. USER MAP (Domains)
-- ============================================================================

-- User's personalized domain analysis
create table public.user_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  domain_id text not null references public.domains(id),
  analysis text,
  updated_at timestamptz default now() not null,
  
  constraint unique_user_domain unique(user_id, domain_id)
);

comment on table public.user_domains is 'AI-generated analysis for each domain of a user Map';

create index idx_user_domains_user on public.user_domains(user_id);

-- ============================================================================
-- 7. INSIGHTS
-- ============================================================================

-- AI-surfaced observations from conversations
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  domain_id text references public.domains(id),
  conversation_id uuid references public.conversations(id) on delete set null,
  observation text not null,
  status text default 'pending' not null check (status in ('pending', 'acknowledged', 'dismissed')),
  user_response text check (user_response in ('yes', 'maybe', 'no')),
  user_note text,
  acknowledged_at timestamptz,
  created_at timestamptz default now() not null
);

comment on table public.insights is 'AI-surfaced observations that users can acknowledge';
comment on column public.insights.status is 'Workflow status: pending review, acknowledged, or dismissed';
comment on column public.insights.user_response is 'User agreement level: yes, maybe, or no';

create index idx_insights_user_id on public.insights(user_id);
create index idx_insights_status on public.insights(user_id, status);
create index idx_insights_domain on public.insights(user_id, domain_id);

-- Thread suggestions (topics the AI suggests tracking)
create table public.thread_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic text not null,
  description text not null,
  mention_count integer default 0 not null,
  status text default 'pending' not null check (status in ('pending', 'accepted', 'dismissed')),
  created_thread_id uuid references public.threads(id) on delete set null,
  created_at timestamptz default now() not null
);

comment on table public.thread_suggestions is 'AI-suggested topics that could become threads';
comment on column public.thread_suggestions.created_thread_id is 'Links to thread if suggestion was accepted';

create index idx_thread_suggestions_user on public.thread_suggestions(user_id);
create index idx_thread_suggestions_status on public.thread_suggestions(user_id, status);

-- ============================================================================
-- 8. USAGE TRACKING
-- ============================================================================

-- Track daily usage for registered users (rate limiting)
create table public.user_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  usage_date date not null default current_date,
  messages_sent integer default 0 not null,
  created_at timestamptz default now() not null,
  
  constraint unique_user_daily unique(user_id, usage_date)
);

comment on table public.user_daily_usage is 'Tracks daily message usage for registered users';
comment on column public.user_daily_usage.messages_sent is 'Number of messages sent on this date';

create index idx_user_daily_usage_user_date on public.user_daily_usage(user_id, usage_date desc);

-- ============================================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables with updated_at column
create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.user_preferences
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.threads
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.journal_entries
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.user_domains
  for each row execute function public.handle_updated_at();

