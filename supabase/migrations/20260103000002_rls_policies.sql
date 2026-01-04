-- Oraa Database Schema
-- Migration: Row-Level Security Policies
-- Created: 2026-01-03

-- ============================================================================
-- DROP EXISTING HELPER FUNCTIONS (if re-running)
-- ============================================================================

drop function if exists public.user_owns_session(uuid) cascade;
drop function if exists public.get_owned_session_ids() cascade;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.domains enable row level security;
alter table public.threads enable row level security;
alter table public.thread_entries enable row level security;
alter table public.thread_patterns enable row level security;
alter table public.thread_questions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_reflections enable row level security;
alter table public.user_domains enable row level security;
alter table public.insights enable row level security;
alter table public.thread_suggestions enable row level security;
alter table public.user_daily_usage enable row level security;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if current user owns a session (for anonymous access)
create or replace function public.user_owns_session(session_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.sessions
    where id = session_uuid
    and (
      user_id = auth.uid()
      or (user_id is null and device_id = current_setting('request.headers', true)::json->>'x-device-id')
    )
  );
end;
$$ language plpgsql security definer;

-- Get session IDs owned by the current context (user or device)
create or replace function public.get_owned_session_ids()
returns setof uuid as $$
begin
  return query
  select id from public.sessions
  where user_id = auth.uid()
     or (user_id is null and device_id = current_setting('request.headers', true)::json->>'x-device-id');
end;
$$ language plpgsql security definer;

-- ============================================================================
-- DOMAINS (Public read access - static reference data)
-- ============================================================================

create policy "Domains are viewable by everyone"
  on public.domains for select
  using (true);

-- ============================================================================
-- USERS
-- ============================================================================

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================================
-- SESSIONS
-- ============================================================================

-- Anonymous users can create sessions
create policy "Anyone can create a session"
  on public.sessions for insert
  with check (true);

-- Users can view their own sessions (claimed or by device_id)
create policy "Users can view own sessions"
  on public.sessions for select
  using (
    user_id = auth.uid()
    or (user_id is null and device_id = current_setting('request.headers', true)::json->>'x-device-id')
  );

-- Users can update their own sessions (for claiming)
create policy "Users can update own sessions"
  on public.sessions for update
  using (
    user_id = auth.uid()
    or (user_id is null and device_id = current_setting('request.headers', true)::json->>'x-device-id')
  );

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

-- Users can view their own conversations OR anonymous conversations from their session
create policy "Users can view own conversations"
  on public.conversations for select
  using (
    user_id = auth.uid()
    or session_id in (select public.get_owned_session_ids())
  );

-- Users can create conversations (either authenticated or via session)
create policy "Users can create conversations"
  on public.conversations for insert
  with check (
    user_id = auth.uid()
    or (user_id is null and public.user_owns_session(session_id))
  );

-- Users can update their own conversations
create policy "Users can update own conversations"
  on public.conversations for update
  using (
    user_id = auth.uid()
    or session_id in (select public.get_owned_session_ids())
  );

-- ============================================================================
-- MESSAGES
-- ============================================================================

-- Users can view messages from their conversations
create policy "Users can view own messages"
  on public.messages for select
  using (
    conversation_id in (
      select id from public.conversations
      where user_id = auth.uid()
         or session_id in (select public.get_owned_session_ids())
    )
  );

-- Users can insert messages into their conversations
create policy "Users can insert messages"
  on public.messages for insert
  with check (
    conversation_id in (
      select id from public.conversations
      where user_id = auth.uid()
         or session_id in (select public.get_owned_session_ids())
    )
  );

-- ============================================================================
-- THREADS
-- ============================================================================

create policy "Users can view own threads"
  on public.threads for select
  using (user_id = auth.uid() and deleted_at is null);

create policy "Users can create threads"
  on public.threads for insert
  with check (user_id = auth.uid());

create policy "Users can update own threads"
  on public.threads for update
  using (user_id = auth.uid());

-- ============================================================================
-- THREAD ENTRIES
-- ============================================================================

create policy "Users can view own thread entries"
  on public.thread_entries for select
  using (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

create policy "Users can create thread entries"
  on public.thread_entries for insert
  with check (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

-- ============================================================================
-- THREAD PATTERNS
-- ============================================================================

create policy "Users can view own thread patterns"
  on public.thread_patterns for select
  using (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

create policy "Users can create thread patterns"
  on public.thread_patterns for insert
  with check (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

create policy "Users can delete own thread patterns"
  on public.thread_patterns for delete
  using (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

-- ============================================================================
-- THREAD QUESTIONS
-- ============================================================================

create policy "Users can view own thread questions"
  on public.thread_questions for select
  using (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

create policy "Users can create thread questions"
  on public.thread_questions for insert
  with check (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

create policy "Users can update own thread questions"
  on public.thread_questions for update
  using (
    thread_id in (
      select id from public.threads where user_id = auth.uid()
    )
  );

-- ============================================================================
-- JOURNAL ENTRIES
-- ============================================================================

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (user_id = auth.uid());

create policy "Users can create journal entries"
  on public.journal_entries for insert
  with check (user_id = auth.uid());

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (user_id = auth.uid());

-- ============================================================================
-- JOURNAL REFLECTIONS
-- ============================================================================

create policy "Users can view own journal reflections"
  on public.journal_reflections for select
  using (
    journal_entry_id in (
      select id from public.journal_entries where user_id = auth.uid()
    )
  );

create policy "Users can create journal reflections"
  on public.journal_reflections for insert
  with check (
    journal_entry_id in (
      select id from public.journal_entries where user_id = auth.uid()
    )
  );

create policy "Users can update own journal reflections"
  on public.journal_reflections for update
  using (
    journal_entry_id in (
      select id from public.journal_entries where user_id = auth.uid()
    )
  );

create policy "Users can delete own journal reflections"
  on public.journal_reflections for delete
  using (
    journal_entry_id in (
      select id from public.journal_entries where user_id = auth.uid()
    )
  );

-- ============================================================================
-- USER DOMAINS (Map)
-- ============================================================================

create policy "Users can view own domain analysis"
  on public.user_domains for select
  using (user_id = auth.uid());

create policy "Users can create domain analysis"
  on public.user_domains for insert
  with check (user_id = auth.uid());

create policy "Users can update own domain analysis"
  on public.user_domains for update
  using (user_id = auth.uid());

-- ============================================================================
-- INSIGHTS
-- ============================================================================

create policy "Users can view own insights"
  on public.insights for select
  using (user_id = auth.uid());

create policy "Users can create insights"
  on public.insights for insert
  with check (user_id = auth.uid());

create policy "Users can update own insights"
  on public.insights for update
  using (user_id = auth.uid());

-- ============================================================================
-- THREAD SUGGESTIONS
-- ============================================================================

create policy "Users can view own thread suggestions"
  on public.thread_suggestions for select
  using (user_id = auth.uid());

create policy "Users can create thread suggestions"
  on public.thread_suggestions for insert
  with check (user_id = auth.uid());

create policy "Users can update own thread suggestions"
  on public.thread_suggestions for update
  using (user_id = auth.uid());

-- ============================================================================
-- USER DAILY USAGE
-- ============================================================================

create policy "Users can view own usage"
  on public.user_daily_usage for select
  using (user_id = auth.uid());

create policy "Users can insert own usage"
  on public.user_daily_usage for insert
  with check (user_id = auth.uid());

create policy "Users can update own usage"
  on public.user_daily_usage for update
  using (user_id = auth.uid());

-- ============================================================================
-- SERVICE ROLE BYPASS
-- Note: Service role (used by backend/AI) bypasses RLS by default in Supabase
-- ============================================================================

