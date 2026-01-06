-- Oraa Database Schema
-- Migration: Threads & Insights System
-- Created: 2026-01-03
-- 
-- This migration implements the full Threads & Insights system as per the product spec:
-- - Self Insights (portable patterns about the user, live in Map domains)
-- - Thread Insights (contextual observations about others/dynamics, live in Threads)
-- - Threads (ongoing storylines: People, Self, Situation types)
-- - Insight-Thread associations for cross-referencing

-- ============================================================================
-- 1. UPDATE DOMAINS TABLE (5 domains per spec)
-- ============================================================================

-- Clear existing domains and use the 5 from the spec
delete from public.domains;

insert into public.domains (id, name, icon, display_order) values
  ('relational', 'Relational', '🤝', 1),
  ('emotional', 'Emotional', '💙', 2),
  ('cognitive', 'Cognitive', '🧠', 3),
  ('somatic', 'Somatic', '🫀', 4),
  ('behavioral', 'Behavioral', '⚡', 5);

-- ============================================================================
-- 2. ADD THREAD TYPE FIELD
-- ============================================================================

-- Add type column to threads table
alter table public.threads 
  add column if not exists type text default 'people' not null 
  check (type in ('people', 'self', 'situation'));

-- Add archived status option
alter table public.threads 
  drop constraint if exists threads_status_check;
alter table public.threads 
  add constraint threads_status_check 
  check (status in ('active', 'resolved', 'paused', 'archived'));

-- Add index for filtering by type
create index if not exists idx_threads_type on public.threads(user_id, type) where deleted_at is null;

-- ============================================================================
-- 3. UPDATE INSIGHTS TABLE
-- ============================================================================

-- Add insight_type column to distinguish self vs thread insights
alter table public.insights 
  add column if not exists insight_type text default 'self' not null 
  check (insight_type in ('self', 'thread'));

-- Add thread_id for thread insights (nullable - only set for thread insights)
alter table public.insights 
  add column if not exists thread_id uuid references public.threads(id) on delete set null;

-- Add first_detected_at timestamp
alter table public.insights 
  add column if not exists first_detected_at timestamptz default now();

-- Add detection_count for re-detection tracking
alter table public.insights 
  add column if not exists detection_count integer default 1 not null;

-- Update status check to include 'staged' status
alter table public.insights 
  drop constraint if exists insights_status_check;
alter table public.insights 
  add constraint insights_status_check 
  check (status in ('pending', 'staged', 'acknowledged', 'dismissed'));

-- Add index for thread insights
create index if not exists idx_insights_thread on public.insights(thread_id) where thread_id is not null;

-- Add index for insight type
create index if not exists idx_insights_type on public.insights(user_id, insight_type);

-- ============================================================================
-- 4. CREATE INSIGHT-THREAD JUNCTION TABLE
-- ============================================================================

-- This table links self insights to threads where they've been detected
-- Self insights live in the Map but are referenced in Threads through this junction
create table if not exists public.insight_thread_associations (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.insights(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  detected_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  
  constraint unique_insight_thread unique(insight_id, thread_id)
);

comment on table public.insight_thread_associations is 'Links self insights to threads where they have been detected';
comment on column public.insight_thread_associations.detected_at is 'When the insight was detected in this thread context';

-- Indexes for both query directions
create index if not exists idx_insight_thread_assoc_insight on public.insight_thread_associations(insight_id);
create index if not exists idx_insight_thread_assoc_thread on public.insight_thread_associations(thread_id);

-- ============================================================================
-- 5. RENAME THREAD_PATTERNS TO THREAD_INSIGHTS
-- ============================================================================

-- Rename the table for clarity (these are thread-specific insights about others/dynamics)
alter table if exists public.thread_patterns rename to thread_insights;

-- Update the column name from 'pattern' to 'observation' to match spec terminology
alter table public.thread_insights 
  rename column pattern to observation;

-- Add additional columns for thread insights
alter table public.thread_insights 
  add column if not exists status text default 'active' not null 
  check (status in ('active', 'revised', 'archived'));

alter table public.thread_insights 
  add column if not exists user_response text 
  check (user_response in ('yes', 'partially', 'no'));

alter table public.thread_insights 
  add column if not exists user_note text;

alter table public.thread_insights 
  add column if not exists acknowledged_at timestamptz;

-- Update index name
drop index if exists idx_thread_patterns_thread_id;
create index if not exists idx_thread_insights_thread_id on public.thread_insights(thread_id);

-- ============================================================================
-- 6. ADD STAGING QUEUE TABLE
-- ============================================================================

-- Unified staging queue for items awaiting user review
create table if not exists public.staging_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_type text not null check (item_type in ('self_insight', 'thread_insight', 'thread_suggestion')),
  item_id uuid not null,
  thread_id uuid references public.threads(id) on delete cascade,
  created_at timestamptz default now() not null,
  reviewed_at timestamptz,
  
  constraint unique_staging_item unique(user_id, item_type, item_id)
);

comment on table public.staging_queue is 'Queue of insights and suggestions awaiting user review';
comment on column public.staging_queue.item_type is 'Type of item: self_insight, thread_insight, or thread_suggestion';
comment on column public.staging_queue.item_id is 'Reference to the actual item in its respective table';
comment on column public.staging_queue.thread_id is 'Associated thread for thread insights and some suggestions';

-- Index for fetching pending items
create index if not exists idx_staging_queue_pending on public.staging_queue(user_id, reviewed_at) 
  where reviewed_at is null;

-- ============================================================================
-- 7. ADD TOPIC MENTIONS TABLE (For Thread Suggestion Generation)
-- ============================================================================

-- Track topic/person mention frequency for suggesting new threads
create table if not exists public.topic_mentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  topic_text text not null,
  topic_type text default 'general' check (topic_type in ('person', 'self', 'situation', 'general')),
  mention_count integer default 1 not null,
  last_mentioned_at timestamptz default now() not null,
  first_mentioned_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  thread_created boolean default false not null,
  
  constraint unique_user_topic unique(user_id, topic_text)
);

comment on table public.topic_mentions is 'Tracks topic mention frequency for thread suggestion generation';
comment on column public.topic_mentions.topic_type is 'Category of topic: person, self-related, situation, or general';
comment on column public.topic_mentions.thread_created is 'Whether a thread has been created for this topic';

-- Index for frequency lookups
create index if not exists idx_topic_mentions_user on public.topic_mentions(user_id, mention_count desc);
create index if not exists idx_topic_mentions_topic on public.topic_mentions(user_id, topic_text);

-- ============================================================================
-- 8. ADD CONVERSATION-THREAD JUNCTION (Multi-Thread Support)
-- ============================================================================

-- Support for conversations having multiple active threads (up to 2-3)
create table if not exists public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  is_inferred boolean default false not null,
  added_at timestamptz default now() not null,
  
  constraint unique_conversation_thread unique(conversation_id, thread_id)
);

comment on table public.conversation_threads is 'Links conversations to their active thread contexts';
comment on column public.conversation_threads.is_inferred is 'True if thread was auto-inferred, false if manually added';

create index if not exists idx_conversation_threads_conv on public.conversation_threads(conversation_id);
create index if not exists idx_conversation_threads_thread on public.conversation_threads(thread_id);

-- ============================================================================
-- 9. ENABLE RLS ON NEW TABLES
-- ============================================================================

alter table public.insight_thread_associations enable row level security;
alter table public.staging_queue enable row level security;
alter table public.topic_mentions enable row level security;
alter table public.conversation_threads enable row level security;
alter table public.thread_insights enable row level security;

-- ============================================================================
-- 10. RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Insight-Thread Associations
create policy "Users can view own insight associations"
  on public.insight_thread_associations for select
  using (
    insight_id in (select id from public.insights where user_id = auth.uid())
  );

create policy "Users can create insight associations"
  on public.insight_thread_associations for insert
  with check (
    insight_id in (select id from public.insights where user_id = auth.uid())
  );

create policy "Users can delete own insight associations"
  on public.insight_thread_associations for delete
  using (
    insight_id in (select id from public.insights where user_id = auth.uid())
  );

-- Staging Queue
create policy "Users can view own staging queue"
  on public.staging_queue for select
  using (user_id = auth.uid());

create policy "Users can insert to own staging queue"
  on public.staging_queue for insert
  with check (user_id = auth.uid());

create policy "Users can update own staging queue"
  on public.staging_queue for update
  using (user_id = auth.uid());

create policy "Users can delete from own staging queue"
  on public.staging_queue for delete
  using (user_id = auth.uid());

-- Topic Mentions
create policy "Users can view own topic mentions"
  on public.topic_mentions for select
  using (user_id = auth.uid());

create policy "Users can insert own topic mentions"
  on public.topic_mentions for insert
  with check (user_id = auth.uid());

create policy "Users can update own topic mentions"
  on public.topic_mentions for update
  using (user_id = auth.uid());

create policy "Users can delete own topic mentions"
  on public.topic_mentions for delete
  using (user_id = auth.uid());

-- Conversation Threads
create policy "Users can view own conversation threads"
  on public.conversation_threads for select
  using (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid()
         or session_id in (select public.get_owned_session_ids())
    )
  );

create policy "Users can insert conversation threads"
  on public.conversation_threads for insert
  with check (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid()
         or session_id in (select public.get_owned_session_ids())
    )
  );

create policy "Users can delete conversation threads"
  on public.conversation_threads for delete
  using (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid()
         or session_id in (select public.get_owned_session_ids())
    )
  );

-- Thread Insights (formerly thread_patterns)
create policy "Users can view own thread insights"
  on public.thread_insights for select
  using (
    thread_id in (select id from public.threads where user_id = auth.uid())
  );

create policy "Users can create thread insights"
  on public.thread_insights for insert
  with check (
    thread_id in (select id from public.threads where user_id = auth.uid())
  );

create policy "Users can update own thread insights"
  on public.thread_insights for update
  using (
    thread_id in (select id from public.threads where user_id = auth.uid())
  );

create policy "Users can delete own thread insights"
  on public.thread_insights for delete
  using (
    thread_id in (select id from public.threads where user_id = auth.uid())
  );

-- ============================================================================
-- 11. HELPER FUNCTIONS
-- ============================================================================

-- Function to get all self insights associated with a thread
create or replace function public.get_thread_self_insights(p_thread_id uuid)
returns table (
  insight_id uuid,
  observation text,
  domain_id text,
  user_response text,
  detected_at timestamptz
) as $$
begin
  return query
  select 
    i.id as insight_id,
    i.observation,
    i.domain_id,
    i.user_response,
    ita.detected_at
  from public.insight_thread_associations ita
  join public.insights i on i.id = ita.insight_id
  where ita.thread_id = p_thread_id
    and i.insight_type = 'self'
    and i.status = 'acknowledged'
  order by ita.detected_at desc;
end;
$$ language plpgsql security definer;

comment on function public.get_thread_self_insights is 'Get all self insights associated with a specific thread';

-- Function to associate an insight with a thread
create or replace function public.associate_insight_with_thread(
  p_insight_id uuid,
  p_thread_id uuid,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_assoc_id uuid;
begin
  -- Verify ownership
  if not exists (
    select 1 from public.insights 
    where id = p_insight_id and user_id = auth.uid()
  ) then
    raise exception 'Insight not found or access denied';
  end if;
  
  if not exists (
    select 1 from public.threads 
    where id = p_thread_id and user_id = auth.uid()
  ) then
    raise exception 'Thread not found or access denied';
  end if;
  
  -- Create association (on conflict do nothing for duplicates)
  insert into public.insight_thread_associations (insight_id, thread_id, conversation_id)
  values (p_insight_id, p_thread_id, p_conversation_id)
  on conflict (insight_id, thread_id) do update
  set detected_at = now()
  returning id into v_assoc_id;
  
  -- Increment detection count on the insight
  update public.insights
  set detection_count = detection_count + 1
  where id = p_insight_id;
  
  return v_assoc_id;
end;
$$ language plpgsql security definer;

comment on function public.associate_insight_with_thread is 'Link a self insight to a thread where it was detected';

-- Function to get pending staging items for a user
create or replace function public.get_staging_queue()
returns table (
  queue_id uuid,
  item_type text,
  item_id uuid,
  thread_id uuid,
  created_at timestamptz,
  -- Insight fields (null for thread suggestions)
  observation text,
  domain_id text,
  insight_thread_id uuid,
  -- Thread suggestion fields (null for insights)
  topic text,
  description text,
  mention_count integer
) as $$
begin
  return query
  select 
    sq.id as queue_id,
    sq.item_type,
    sq.item_id,
    sq.thread_id,
    sq.created_at,
    -- Self insight or thread insight data
    case 
      when sq.item_type in ('self_insight', 'thread_insight') then i.observation
      else null
    end as observation,
    case 
      when sq.item_type = 'self_insight' then i.domain_id
      else null
    end as domain_id,
    case 
      when sq.item_type = 'thread_insight' then i.thread_id
      else null
    end as insight_thread_id,
    -- Thread suggestion data
    case 
      when sq.item_type = 'thread_suggestion' then ts.topic
      else null
    end as topic,
    case 
      when sq.item_type = 'thread_suggestion' then ts.description
      else null
    end as description,
    case 
      when sq.item_type = 'thread_suggestion' then ts.mention_count
      else null
    end as mention_count
  from public.staging_queue sq
  left join public.insights i on sq.item_type in ('self_insight', 'thread_insight') and sq.item_id = i.id
  left join public.thread_suggestions ts on sq.item_type = 'thread_suggestion' and sq.item_id = ts.id
  where sq.user_id = auth.uid()
    and sq.reviewed_at is null
  order by sq.created_at desc;
end;
$$ language plpgsql security definer;

comment on function public.get_staging_queue is 'Get all pending items in the staging queue for the current user';

-- Function to respond to a staged insight
create or replace function public.respond_to_staged_insight(
  p_queue_id uuid,
  p_response text,
  p_note text default null
)
returns jsonb as $$
declare
  v_queue_item record;
begin
  -- Validate response
  if p_response not in ('yes', 'maybe', 'no', 'partially') then
    raise exception 'Invalid response. Must be yes, maybe, no, or partially';
  end if;
  
  -- Get queue item
  select * into v_queue_item
  from public.staging_queue
  where id = p_queue_id and user_id = auth.uid();
  
  if v_queue_item is null then
    raise exception 'Staging queue item not found';
  end if;
  
  -- Handle based on item type
  if v_queue_item.item_type = 'self_insight' then
    -- Update insight with response
    update public.insights
    set status = 'acknowledged',
        user_response = p_response,
        user_note = p_note,
        acknowledged_at = now()
    where id = v_queue_item.item_id;
    
    -- If there's an associated thread, create the association
    if v_queue_item.thread_id is not null then
      insert into public.insight_thread_associations (insight_id, thread_id)
      values (v_queue_item.item_id, v_queue_item.thread_id)
      on conflict (insight_id, thread_id) do nothing;
    end if;
    
  elsif v_queue_item.item_type = 'thread_insight' then
    -- Update the thread insight (in thread_insights table)
    update public.thread_insights
    set user_response = p_response,
        user_note = p_note,
        acknowledged_at = now()
    where id = v_queue_item.item_id;
  end if;
  
  -- Mark as reviewed
  update public.staging_queue
  set reviewed_at = now()
  where id = p_queue_id;
  
  return jsonb_build_object(
    'success', true,
    'item_type', v_queue_item.item_type,
    'response', p_response
  );
end;
$$ language plpgsql security definer;

comment on function public.respond_to_staged_insight is 'Respond to a staged insight with yes/maybe/no/partially';

-- Function to update topic mention counts
create or replace function public.update_topic_mention(
  p_topic_text text,
  p_topic_type text default 'general'
)
returns integer as $$
declare
  v_mention_count integer;
begin
  insert into public.topic_mentions (user_id, topic_text, topic_type, mention_count, last_mentioned_at)
  values (auth.uid(), p_topic_text, p_topic_type, 1, now())
  on conflict (user_id, topic_text) do update
  set mention_count = topic_mentions.mention_count + 1,
      last_mentioned_at = now()
  returning mention_count into v_mention_count;
  
  return v_mention_count;
end;
$$ language plpgsql security definer;

comment on function public.update_topic_mention is 'Increment mention count for a topic (used for thread suggestion generation)';

-- Function to get full thread context for AI
create or replace function public.get_thread_context(p_thread_id uuid)
returns jsonb as $$
declare
  v_thread record;
  v_entries jsonb;
  v_self_insights jsonb;
  v_thread_insights jsonb;
  v_questions jsonb;
begin
  -- Get thread
  select * into v_thread
  from public.threads
  where id = p_thread_id and user_id = auth.uid();
  
  if v_thread is null then
    return jsonb_build_object('error', 'Thread not found');
  end if;
  
  -- Get entries (last 10)
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'date', entry_date,
      'summary', summary
    ) order by entry_date desc
  ), '[]'::jsonb) into v_entries
  from (
    select id, entry_date, summary
    from public.thread_entries
    where thread_id = p_thread_id
    order by entry_date desc
    limit 10
  ) e;
  
  -- Get associated self insights
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'observation', i.observation,
      'domain', i.domain_id,
      'detected_at', ita.detected_at
    )
  ), '[]'::jsonb) into v_self_insights
  from public.insight_thread_associations ita
  join public.insights i on i.id = ita.insight_id
  where ita.thread_id = p_thread_id
    and i.status = 'acknowledged';
  
  -- Get thread insights (working understanding)
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'observation', observation,
      'user_response', user_response
    )
  ), '[]'::jsonb) into v_thread_insights
  from public.thread_insights
  where thread_id = p_thread_id
    and status = 'active';
  
  -- Get open questions
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'question', question,
      'is_answered', is_answered
    )
  ), '[]'::jsonb) into v_questions
  from public.thread_questions
  where thread_id = p_thread_id
    and is_answered = false;
  
  return jsonb_build_object(
    'id', v_thread.id,
    'title', v_thread.title,
    'type', v_thread.type,
    'current_understanding', v_thread.current_understanding,
    'status', v_thread.status,
    'mention_count', v_thread.mention_count,
    'timeline', v_entries,
    'your_patterns_here', v_self_insights,
    'working_understanding', v_thread_insights,
    'still_curious_about', v_questions
  );
end;
$$ language plpgsql security definer;

comment on function public.get_thread_context is 'Get full thread context for AI conversation';

-- Function to add thread insight to staging
create or replace function public.add_thread_insight_to_staging(
  p_thread_id uuid,
  p_observation text,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_insight_id uuid;
  v_queue_id uuid;
  v_user_id uuid;
begin
  -- Get user_id from thread
  select user_id into v_user_id
  from public.threads
  where id = p_thread_id;
  
  if v_user_id is null then
    raise exception 'Thread not found';
  end if;
  
  -- Create the thread insight
  insert into public.thread_insights (thread_id, observation)
  values (p_thread_id, p_observation)
  returning id into v_insight_id;
  
  -- Add to staging queue
  insert into public.staging_queue (user_id, item_type, item_id, thread_id)
  values (v_user_id, 'thread_insight', v_insight_id, p_thread_id)
  returning id into v_queue_id;
  
  return v_queue_id;
end;
$$ language plpgsql security definer;

comment on function public.add_thread_insight_to_staging is 'Create a thread insight and add it to the staging queue';

-- Function to add self insight to staging
create or replace function public.add_self_insight_to_staging(
  p_user_id uuid,
  p_observation text,
  p_domain_id text,
  p_thread_id uuid default null,
  p_conversation_id uuid default null
)
returns uuid as $$
declare
  v_insight_id uuid;
  v_queue_id uuid;
begin
  -- Create the self insight
  insert into public.insights (user_id, observation, domain_id, insight_type, conversation_id, status)
  values (p_user_id, p_observation, p_domain_id, 'self', p_conversation_id, 'staged')
  returning id into v_insight_id;
  
  -- Add to staging queue
  insert into public.staging_queue (user_id, item_type, item_id, thread_id)
  values (p_user_id, 'self_insight', v_insight_id, p_thread_id)
  returning id into v_queue_id;
  
  return v_queue_id;
end;
$$ language plpgsql security definer;

comment on function public.add_self_insight_to_staging is 'Create a self insight and add it to the staging queue';

-- Function to create a thread (manual or from suggestion)
create or replace function public.create_thread_from_suggestion(
  p_suggestion_id uuid default null,
  p_title text default null,
  p_type text default 'people',
  p_initial_understanding text default null
)
returns uuid as $$
declare
  v_thread_id uuid;
  v_suggestion record;
begin
  if p_suggestion_id is not null then
    -- Get suggestion
    select * into v_suggestion
    from public.thread_suggestions
    where id = p_suggestion_id
      and user_id = auth.uid()
      and status = 'pending';
    
    if v_suggestion is null then
      raise exception 'Thread suggestion not found or already processed';
    end if;
    
    -- Create thread from suggestion
    insert into public.threads (user_id, title, type, current_understanding, mention_count)
    values (
      auth.uid(),
      v_suggestion.topic,
      coalesce(p_type, 'people'),
      v_suggestion.description,
      v_suggestion.mention_count
    )
    returning id into v_thread_id;
    
    -- Update suggestion
    update public.thread_suggestions
    set status = 'accepted',
        created_thread_id = v_thread_id
    where id = p_suggestion_id;
    
    -- Mark topic as having thread created
    update public.topic_mentions
    set thread_created = true
    where user_id = auth.uid() and topic_text = v_suggestion.topic;
    
  else
    -- Manual thread creation
    if p_title is null then
      raise exception 'Title is required for manual thread creation';
    end if;
    
    insert into public.threads (user_id, title, type, current_understanding)
    values (auth.uid(), p_title, p_type, p_initial_understanding)
    returning id into v_thread_id;
  end if;
  
  return v_thread_id;
end;
$$ language plpgsql security definer;

comment on function public.create_thread_from_suggestion is 'Create a thread manually or from a suggestion';

-- Function to get Map insights by domain
create or replace function public.get_map_insights()
returns table (
  domain_id text,
  domain_name text,
  domain_icon text,
  insights jsonb
) as $$
begin
  return query
  select 
    d.id as domain_id,
    d.name as domain_name,
    d.icon as domain_icon,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'observation', i.observation,
            'user_response', i.user_response,
            'user_note', i.user_note,
            'first_detected_at', i.first_detected_at,
            'detection_count', i.detection_count,
            'acknowledged_at', i.acknowledged_at,
            'thread_associations', (
              select coalesce(jsonb_agg(
                jsonb_build_object(
                  'thread_id', t.id,
                  'thread_title', t.title,
                  'detected_at', ita.detected_at
                )
              ), '[]'::jsonb)
              from public.insight_thread_associations ita
              join public.threads t on t.id = ita.thread_id
              where ita.insight_id = i.id
            )
          ) order by i.acknowledged_at desc nulls last
        )
        from public.insights i
        where i.user_id = auth.uid()
          and i.domain_id = d.id
          and i.insight_type = 'self'
          and i.status = 'acknowledged'
      ),
      '[]'::jsonb
    ) as insights
  from public.domains d
  order by d.display_order;
end;
$$ language plpgsql security definer;

comment on function public.get_map_insights is 'Get all acknowledged self insights organized by domain for the Map view';

-- ============================================================================
-- 12. UPDATE USER CREATION TRIGGER TO USE NEW DOMAINS
-- ============================================================================

-- Drop and recreate the trigger function with new domain IDs
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
  
  -- Initialize all 5 domain entries for the user (using new domain IDs)
  insert into public.user_domains (user_id, domain_id)
  select new.id, d.id
  from public.domains d;
  
  return new;
end;
$$ language plpgsql security definer;

