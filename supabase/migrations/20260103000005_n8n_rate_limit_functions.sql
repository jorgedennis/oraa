-- Oraa Database Schema
-- Migration: n8n Rate Limit Functions
-- Created: 2026-01-03
-- Purpose: Add functions that accept user_id for n8n workflows (which don't have auth context)

-- ============================================================================
-- RATE LIMITING FUNCTIONS FOR N8N WORKFLOWS
-- ============================================================================

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

