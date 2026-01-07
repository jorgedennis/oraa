-- Oraa Database Schema
-- Migration: Helper Functions
-- Created: 2026-01-03

-- ============================================================================
-- DROP EXISTING FUNCTIONS
-- ============================================================================

drop function if exists public.get_or_create_session(text) cascade;
drop function if exists public.use_anonymous_message(uuid) cascade;
drop function if exists public.use_daily_message(integer) cascade;
drop function if exists public.get_usage_status(uuid) cascade;
drop function if exists public.claim_session(uuid) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.start_conversation(uuid, uuid) cascade;
drop function if exists public.add_message(uuid, text, boolean) cascade;
drop function if exists public.end_conversation(uuid) cascade;
drop function if exists public.upsert_journal_entry(uuid, date, text, uuid) cascade;
drop function if exists public.acknowledge_insight(uuid, text, text) cascade;
drop function if exists public.dismiss_insight(uuid) cascade;
drop function if exists public.accept_thread_suggestion(uuid) cascade;
drop function if exists public.add_thread_entry(uuid, text, uuid) cascade;
drop function if exists public.export_user_data() cascade;
drop function if exists public.delete_all_conversations() cascade;
drop function if exists public.delete_user_data() cascade;
-- Note: user_owns_session and get_owned_session_ids are kept from migration 2
-- They are still needed for RLS policies

-- ============================================================================
-- SESSION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create or get an anonymous session for a device
create or replace function public.get_or_create_session(p_device_id text)
returns uuid as $$
declare
  v_session_id uuid;
begin
  -- Look for existing valid session
  select id into v_session_id
  from public.sessions
  where device_id = p_device_id
    and user_id is null
    and expires_at > now()
  order by created_at desc
  limit 1;
  
  -- Create new session if none exists
  if v_session_id is null then
    insert into public.sessions (device_id)
    values (p_device_id)
    returning id into v_session_id;
  end if;
  
  return v_session_id;
end;
$$ language plpgsql security definer;

comment on function public.get_or_create_session is 'Get existing or create new anonymous session for device';

-- ============================================================================
-- RATE LIMITING / MESSAGE ALLOWANCE
-- ============================================================================

-- Check and use an anonymous message (returns whether allowed)
create or replace function public.use_anonymous_message(p_session_id uuid)
returns jsonb as $$
declare
  v_session record;
begin
  -- Get session
  select * into v_session
  from public.sessions
  where id = p_session_id;
  
  if v_session is null then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'session_not_found'
    );
  end if;
  
  -- If session is claimed (has user), they should use daily limits instead
  if v_session.user_id is not null then
    return jsonb_build_object(
      'allowed', true,
      'reason', 'use_daily_limit',
      'user_id', v_session.user_id
    );
  end if;
  
  -- Check anonymous allowance
  if v_session.messages_used >= v_session.message_allowance then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'allowance_exceeded',
      'messages_used', v_session.messages_used,
      'message_allowance', v_session.message_allowance,
      'message', 'Create a free account to continue chatting'
    );
  end if;
  
  -- Increment usage
  update public.sessions
  set messages_used = messages_used + 1
  where id = p_session_id;
  
  return jsonb_build_object(
    'allowed', true,
    'reason', 'anonymous_allowance',
    'messages_used', v_session.messages_used + 1,
    'messages_remaining', v_session.message_allowance - v_session.messages_used - 1
  );
end;
$$ language plpgsql security definer;

comment on function public.use_anonymous_message is 'Check and consume anonymous message allowance (10 lifetime)';

-- Check and use a daily message for registered users
create or replace function public.use_daily_message(p_daily_limit integer default 40)
returns jsonb as $$
declare
  v_user_id uuid;
  v_usage record;
  v_messages_sent integer;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'not_authenticated'
    );
  end if;
  
  -- Get or create today's usage record
  insert into public.user_daily_usage (user_id, usage_date, messages_sent)
  values (v_user_id, current_date, 0)
  on conflict (user_id, usage_date) do nothing;
  
  select * into v_usage
  from public.user_daily_usage
  where user_id = v_user_id and usage_date = current_date;
  
  -- Check limit
  if v_usage.messages_sent >= p_daily_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'messages_sent', v_usage.messages_sent,
      'daily_limit', p_daily_limit,
      'message', 'Daily message limit reached. Come back tomorrow!'
    );
  end if;
  
  -- Increment
  update public.user_daily_usage
  set messages_sent = messages_sent + 1
  where user_id = v_user_id and usage_date = current_date;
  
  return jsonb_build_object(
    'allowed', true,
    'reason', 'daily_allowance',
    'messages_sent', v_usage.messages_sent + 1,
    'messages_remaining', p_daily_limit - v_usage.messages_sent - 1
  );
end;
$$ language plpgsql security definer;

comment on function public.use_daily_message is 'Check and consume daily message allowance (40/day for registered users)';

-- Use daily message by user_id (for n8n workflows that don't have auth context)
create or replace function public.use_daily_message_by_user_id(p_user_id uuid, p_daily_limit integer default 40)
returns jsonb as $$
declare
  v_usage record;
  v_messages_sent integer;
begin
  if p_user_id is null then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'user_id_required',
      'message', 'user_id is required'
    );
  end if;
  
  -- Get or create today's usage record
  insert into public.user_daily_usage (user_id, usage_date, messages_sent)
  values (p_user_id, current_date, 0)
  on conflict (user_id, usage_date) do nothing;
  
  select * into v_usage
  from public.user_daily_usage
  where user_id = p_user_id and usage_date = current_date;
  
  -- Check limit
  if v_usage.messages_sent >= p_daily_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'messages_sent', v_usage.messages_sent,
      'messages_limit', p_daily_limit,
      'messages_remaining', 0,
      'message', 'Daily message limit reached. Come back tomorrow!'
    );
  end if;
  
  -- Increment
  update public.user_daily_usage
  set messages_sent = messages_sent + 1
  where user_id = p_user_id and usage_date = current_date;
  
  return jsonb_build_object(
    'allowed', true,
    'reason', 'daily_allowance',
    'messages_sent', v_usage.messages_sent + 1,
    'messages_limit', p_daily_limit,
    'messages_remaining', p_daily_limit - v_usage.messages_sent - 1
  );
end;
$$ language plpgsql security definer;

comment on function public.use_daily_message_by_user_id is 'Check and consume daily message allowance by user_id (for n8n workflows)';

-- Get current usage status (for displaying in UI)
create or replace function public.get_usage_status(p_session_id uuid default null)
returns jsonb as $$
declare
  v_user_id uuid;
  v_session record;
  v_daily_usage record;
  v_daily_limit integer := 40;
begin
  v_user_id := auth.uid();
  
  -- If authenticated, return daily usage
  if v_user_id is not null then
    select * into v_daily_usage
    from public.user_daily_usage
    where user_id = v_user_id and usage_date = current_date;
    
    return jsonb_build_object(
      'type', 'registered',
      'messages_used', coalesce(v_daily_usage.messages_sent, 0),
      'messages_limit', v_daily_limit,
      'messages_remaining', v_daily_limit - coalesce(v_daily_usage.messages_sent, 0),
      'resets_at', (current_date + 1)::timestamptz
    );
  end if;
  
  -- If anonymous with session, return session usage
  if p_session_id is not null then
    select * into v_session
    from public.sessions
    where id = p_session_id;
    
    if v_session is not null then
      return jsonb_build_object(
        'type', 'anonymous',
        'messages_used', v_session.messages_used,
        'messages_limit', v_session.message_allowance,
        'messages_remaining', v_session.message_allowance - v_session.messages_used,
        'is_lifetime_limit', true
      );
    end if;
  end if;
  
  return jsonb_build_object(
    'type', 'unknown',
    'error', 'No valid session or user found'
  );
end;
$$ language plpgsql security definer;

comment on function public.get_usage_status is 'Get current message usage status for UI display';

-- Get usage status by user_id (for n8n workflows)
create or replace function public.get_usage_status_by_user_id(p_user_id uuid)
returns jsonb as $$
declare
  v_daily_usage record;
  v_daily_limit integer := 40;
begin
  if p_user_id is null then
    return jsonb_build_object(
      'type', 'unknown',
      'error', 'user_id is required'
    );
  end if;
  
  select * into v_daily_usage
  from public.user_daily_usage
  where user_id = p_user_id and usage_date = current_date;
  
  return jsonb_build_object(
    'type', 'registered',
    'messages_used', coalesce(v_daily_usage.messages_sent, 0),
    'messages_limit', v_daily_limit,
    'messages_remaining', v_daily_limit - coalesce(v_daily_usage.messages_sent, 0),
    'resets_at', (current_date + 1)::timestamptz
  );
end;
$$ language plpgsql security definer;

comment on function public.get_usage_status_by_user_id is 'Get usage status by user_id (for n8n workflows)';

-- ============================================================================
-- CLAIM SESSION (Anonymous to Authenticated)
-- ============================================================================

-- Claim an anonymous session when user creates account
-- Transfers all conversations and generates journal entries
create or replace function public.claim_session(p_session_id uuid)
returns jsonb as $$
declare
  v_user_id uuid;
  v_conversation_count integer;
  v_session_device_id text;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated to claim a session';
  end if;
  
  -- Verify session exists and is unclaimed
  select device_id into v_session_device_id
  from public.sessions
  where id = p_session_id
    and user_id is null;
  
  if v_session_device_id is null then
    raise exception 'Session not found or already claimed';
  end if;
  
  -- Claim the session
  update public.sessions
  set user_id = v_user_id,
      claimed_at = now()
  where id = p_session_id;
  
  -- Transfer all conversations from this session to the user
  update public.conversations
  set user_id = v_user_id
  where session_id = p_session_id
    and user_id is null;
  
  get diagnostics v_conversation_count = row_count;
  
  -- Also claim any other sessions from the same device
  update public.sessions
  set user_id = v_user_id,
      claimed_at = now()
  where device_id = v_session_device_id
    and user_id is null
    and id != p_session_id;
  
  -- Transfer conversations from those sessions too
  update public.conversations
  set user_id = v_user_id
  where session_id in (
    select id from public.sessions
    where device_id = v_session_device_id
      and user_id = v_user_id
  )
  and user_id is null;
  
  return jsonb_build_object(
    'success', true,
    'conversations_claimed', v_conversation_count,
    'session_id', p_session_id
  );
end;
$$ language plpgsql security definer;

comment on function public.claim_session is 'Claim anonymous session and transfer data to authenticated user';

-- ============================================================================
-- USER CREATION TRIGGER
-- ============================================================================

-- Automatically create user profile and preferences when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create user profile
  insert into public.users (id, email, is_anonymous)
  values (
    new.id,
    new.email,
    new.email is null -- Anonymous if no email
  );
  
  -- Create default preferences
  insert into public.user_preferences (user_id)
  values (new.id);
  
  -- Initialize all 7 domain entries for the user
  insert into public.user_domains (user_id, domain_id)
  select new.id, d.id
  from public.domains d;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CONVERSATION MANAGEMENT
-- ============================================================================

-- Start a new conversation
create or replace function public.start_conversation(
  p_session_id uuid default null,
  p_thread_id uuid default null
)
returns uuid as $$
declare
  v_user_id uuid;
  v_conversation_id uuid;
begin
  v_user_id := auth.uid();
  
  -- Validate session if provided
  if p_session_id is not null then
    if not exists (
      select 1 from public.sessions
      where id = p_session_id
      and (user_id = v_user_id or user_id is null)
    ) then
      raise exception 'Invalid session';
    end if;
  end if;
  
  -- Validate thread if provided
  if p_thread_id is not null and v_user_id is not null then
    if not exists (
      select 1 from public.threads
      where id = p_thread_id and user_id = v_user_id
    ) then
      raise exception 'Invalid thread';
    end if;
  end if;
  
  insert into public.conversations (user_id, session_id, thread_id)
  values (v_user_id, p_session_id, p_thread_id)
  returning id into v_conversation_id;
  
  return v_conversation_id;
end;
$$ language plpgsql security definer;

comment on function public.start_conversation is 'Start a new conversation, optionally linked to session or thread';

-- Add a message to a conversation
create or replace function public.add_message(
  p_conversation_id uuid,
  p_content text,
  p_is_user boolean
)
returns uuid as $$
declare
  v_message_id uuid;
  v_sequence integer;
begin
  -- Get next sequence number
  select coalesce(max(sequence_number), 0) + 1 into v_sequence
  from public.messages
  where conversation_id = p_conversation_id;
  
  -- Insert message
  insert into public.messages (conversation_id, content, is_user, sequence_number)
  values (p_conversation_id, p_content, p_is_user, v_sequence)
  returning id into v_message_id;
  
  -- Update conversation message count
  update public.conversations
  set message_count = v_sequence
  where id = p_conversation_id;
  
  return v_message_id;
end;
$$ language plpgsql security definer;

comment on function public.add_message is 'Add a message to a conversation with auto-incrementing sequence';

-- End a conversation
create or replace function public.end_conversation(p_conversation_id uuid)
returns void as $$
begin
  update public.conversations
  set ended_at = now()
  where id = p_conversation_id
    and ended_at is null;
end;
$$ language plpgsql security definer;

comment on function public.end_conversation is 'Mark a conversation as ended';

-- ============================================================================
-- JOURNAL MANAGEMENT
-- ============================================================================

-- Generate or update journal entry for a day
create or replace function public.upsert_journal_entry(
  p_user_id uuid,
  p_entry_date date,
  p_summary text,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_entry_id uuid;
  v_day_of_week text;
  v_conversation_count integer;
begin
  -- Get day of week
  v_day_of_week := to_char(p_entry_date, 'Day');
  
  -- Count conversations for that day
  select count(*) into v_conversation_count
  from public.conversations
  where user_id = p_user_id
    and date(started_at) = p_entry_date;
  
  -- Upsert journal entry
  insert into public.journal_entries (
    user_id, conversation_id, entry_date, day_of_week, summary, conversation_count
  )
  values (
    p_user_id, p_conversation_id, p_entry_date, trim(v_day_of_week), p_summary, v_conversation_count
  )
  on conflict (user_id, entry_date) do update
  set summary = excluded.summary,
      conversation_count = excluded.conversation_count,
      updated_at = now()
  returning id into v_entry_id;
  
  return v_entry_id;
end;
$$ language plpgsql security definer;

comment on function public.upsert_journal_entry is 'Create or update journal entry for a specific date';

-- ============================================================================
-- INSIGHT MANAGEMENT
-- ============================================================================

-- Acknowledge an insight with user response
create or replace function public.acknowledge_insight(
  p_insight_id uuid,
  p_response text,
  p_note text default null
)
returns void as $$
begin
  -- Validate response
  if p_response not in ('yes', 'maybe', 'no') then
    raise exception 'Invalid response. Must be yes, maybe, or no';
  end if;
  
  update public.insights
  set status = 'acknowledged',
      user_response = p_response,
      user_note = p_note,
      acknowledged_at = now()
  where id = p_insight_id
    and user_id = auth.uid();
end;
$$ language plpgsql security definer;

comment on function public.acknowledge_insight is 'Acknowledge an insight with yes/maybe/no response';

-- Dismiss an insight
create or replace function public.dismiss_insight(p_insight_id uuid)
returns void as $$
begin
  update public.insights
  set status = 'dismissed'
  where id = p_insight_id
    and user_id = auth.uid();
end;
$$ language plpgsql security definer;

comment on function public.dismiss_insight is 'Dismiss a pending insight';

-- ============================================================================
-- THREAD MANAGEMENT
-- ============================================================================

-- Create a thread from a suggestion
create or replace function public.accept_thread_suggestion(p_suggestion_id uuid)
returns uuid as $$
declare
  v_thread_id uuid;
  v_suggestion record;
begin
  -- Get suggestion
  select * into v_suggestion
  from public.thread_suggestions
  where id = p_suggestion_id
    and user_id = auth.uid()
    and status = 'pending';
  
  if v_suggestion is null then
    raise exception 'Thread suggestion not found or already processed';
  end if;
  
  -- Create thread
  insert into public.threads (user_id, title, current_understanding, mention_count)
  values (
    auth.uid(),
    v_suggestion.topic,
    v_suggestion.description,
    v_suggestion.mention_count
  )
  returning id into v_thread_id;
  
  -- Update suggestion
  update public.thread_suggestions
  set status = 'accepted',
      created_thread_id = v_thread_id
  where id = p_suggestion_id;
  
  return v_thread_id;
end;
$$ language plpgsql security definer;

comment on function public.accept_thread_suggestion is 'Accept a thread suggestion and create the thread';

-- Add entry to thread timeline
create or replace function public.add_thread_entry(
  p_thread_id uuid,
  p_summary text,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_entry_id uuid;
begin
  -- Verify thread ownership
  if not exists (
    select 1 from public.threads
    where id = p_thread_id and user_id = auth.uid()
  ) then
    raise exception 'Thread not found';
  end if;
  
  insert into public.thread_entries (thread_id, conversation_id, summary, entry_date)
  values (p_thread_id, p_conversation_id, p_summary, current_date)
  returning id into v_entry_id;
  
  -- Update thread mention count and timestamp
  update public.threads
  set mention_count = mention_count + 1,
      last_mentioned_at = now()
  where id = p_thread_id;
  
  return v_entry_id;
end;
$$ language plpgsql security definer;

comment on function public.add_thread_entry is 'Add a new entry to a threads timeline';

-- ============================================================================
-- DATA EXPORT
-- ============================================================================

-- Export all user data as JSON (GDPR compliance)
create or replace function public.export_user_data()
returns jsonb as $$
declare
  v_user_id uuid;
  v_data jsonb;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;
  
  select jsonb_build_object(
    'user', (select row_to_json(u) from public.users u where id = v_user_id),
    'preferences', (select row_to_json(p) from public.user_preferences p where user_id = v_user_id),
    'conversations', (
      select coalesce(jsonb_agg(row_to_json(c)), '[]'::jsonb)
      from public.conversations c
      where user_id = v_user_id
    ),
    'messages', (
      select coalesce(jsonb_agg(row_to_json(m)), '[]'::jsonb)
      from public.messages m
      where conversation_id in (
        select id from public.conversations where user_id = v_user_id
      )
    ),
    'threads', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      from public.threads t
      where user_id = v_user_id
    ),
    'journal_entries', (
      select coalesce(jsonb_agg(row_to_json(j)), '[]'::jsonb)
      from public.journal_entries j
      where user_id = v_user_id
    ),
    'insights', (
      select coalesce(jsonb_agg(row_to_json(i)), '[]'::jsonb)
      from public.insights i
      where user_id = v_user_id
    ),
    'user_domains', (
      select coalesce(jsonb_agg(row_to_json(d)), '[]'::jsonb)
      from public.user_domains d
      where user_id = v_user_id
    ),
    'exported_at', now()
  ) into v_data;
  
  return v_data;
end;
$$ language plpgsql security definer;

comment on function public.export_user_data is 'Export all user data as JSON for GDPR compliance';

-- ============================================================================
-- DATA DELETION
-- ============================================================================

-- Soft delete all user conversations
create or replace function public.delete_all_conversations()
returns integer as $$
declare
  v_count integer;
begin
  update public.conversations
  set deleted_at = now()
  where user_id = auth.uid()
    and deleted_at is null;
  
  get diagnostics v_count = row_count;
  
  return v_count;
end;
$$ language plpgsql security definer;

comment on function public.delete_all_conversations is 'Soft delete all user conversations';

-- Hard delete all user data (account deletion)
create or replace function public.delete_user_data()
returns void as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;
  
  -- Delete in order respecting foreign keys
  delete from public.journal_reflections
  where journal_entry_id in (
    select id from public.journal_entries where user_id = v_user_id
  );
  
  delete from public.journal_entries where user_id = v_user_id;
  delete from public.messages
  where conversation_id in (
    select id from public.conversations where user_id = v_user_id
  );
  delete from public.conversations where user_id = v_user_id;
  delete from public.thread_entries
  where thread_id in (
    select id from public.threads where user_id = v_user_id
  );
  delete from public.thread_patterns
  where thread_id in (
    select id from public.threads where user_id = v_user_id
  );
  delete from public.thread_questions
  where thread_id in (
    select id from public.threads where user_id = v_user_id
  );
  delete from public.threads where user_id = v_user_id;
  delete from public.thread_suggestions where user_id = v_user_id;
  delete from public.insights where user_id = v_user_id;
  delete from public.user_domains where user_id = v_user_id;
  delete from public.user_daily_usage where user_id = v_user_id;
  delete from public.user_preferences where user_id = v_user_id;
  delete from public.sessions where user_id = v_user_id;
  delete from public.users where id = v_user_id;
  
  -- Note: The auth.users record should be deleted via Supabase admin API
end;
$$ language plpgsql security definer;

comment on function public.delete_user_data is 'Permanently delete all user data';

