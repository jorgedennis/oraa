# Supabase Migration Guidelines

## ⚠️ CRITICAL RULES - NEVER VIOLATE THESE

### 1. **NEVER DROP TABLES WITH USER DATA**
```sql
-- ❌ NEVER DO THIS:
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;

-- ✅ INSTEAD: Use ALTER TABLE
alter table public.messages add column if not exists new_field text;
```

### 2. **NEVER DELETE USER DATA**
```sql
-- ❌ NEVER DO THIS:
delete from public.messages;
delete from public.conversations;

-- ✅ INSTEAD: Only delete reference/seed data if necessary
-- And only if explicitly required by spec
```

### 3. **ALWAYS USE IF NOT EXISTS / IF EXISTS**
```sql
-- ✅ SAFE: Won't break if column already exists
alter table public.threads 
  add column if not exists type text default 'people';

-- ✅ SAFE: Won't break if table already exists  
create table if not exists public.new_table (...);
```

### 4. **CHECK BEFORE MODIFYING**
- Always check if tables/columns exist before modifying
- Use `IF NOT EXISTS` for additions
- Use `IF EXISTS` for removals (and be very careful!)

## Migration Best Practices

### ✅ Safe Operations

1. **Adding columns**
```sql
alter table public.threads 
  add column if not exists new_field text;
```

2. **Adding tables**
```sql
create table if not exists public.new_table (
  id uuid primary key default gen_random_uuid(),
  -- ...
);
```

3. **Adding indexes**
```sql
create index if not exists idx_name on public.table(column);
```

4. **Adding functions**
```sql
create or replace function public.function_name(...)
-- (create or replace is safe - updates existing)
```

5. **Adding RLS policies**
```sql
create policy "policy_name"
  on public.table for select
  using (...);
-- (will error if exists, which is fine - just fix the name)
```

### ⚠️ Dangerous Operations (Use with Extreme Caution)

1. **Dropping columns**
```sql
-- Only if absolutely necessary and data loss is acceptable
alter table public.table drop column if exists old_column;
```

2. **Renaming tables**
```sql
-- Only if you've verified no data will be lost
alter table public.old_name rename to new_name;
```

3. **Changing column types**
```sql
-- May require data migration
alter table public.table alter column column_name type new_type;
```

### ❌ NEVER DO THESE

1. **DROP TABLE** (unless table is empty/experimental)
2. **DELETE FROM** user data tables
3. **TRUNCATE** user data tables
4. **CASCADE DELETE** without understanding impact

## Migration Checklist

Before creating a migration, ask:

- [ ] Does this modify existing user data? → Use ALTER, not DROP/CREATE
- [ ] Does this add new tables? → Use `CREATE TABLE IF NOT EXISTS`
- [ ] Does this add columns? → Use `ADD COLUMN IF NOT EXISTS`
- [ ] Does this remove anything? → Is data loss acceptable? Document why.
- [ ] Have I tested on a copy of production data?
- [ ] Is this migration reversible? (Can we rollback?)

## Migration Naming Convention

```
YYYYMMDDHHMMSS_description.sql

Example:
20260107120000_add_thread_type_column.sql
20260107120001_add_insight_associations.sql
```

## What Happened (Lesson Learned)

**Date:** 2026-01-07  
**Issue:** Migration `20260103000001_initial_schema.sql` used `DROP TABLE` statements, which deleted all existing data when applied to a database that already had messages, conversations, etc.

**Root Cause:** Migration was written as "initial setup" but applied to existing database.

**Prevention:** 
- Never use DROP TABLE in migrations
- Always use ALTER TABLE for modifications
- Always use IF NOT EXISTS / IF EXISTS
- Test migrations on data copy first

## Safe Migration Template

```sql
-- Migration: Brief description
-- Created: YYYY-MM-DD
-- 
-- Changes:
-- - Add column X to table Y
-- - Create new table Z
-- - Add function ABC

-- ============================================================================
-- 1. ADD NEW COLUMNS (Safe - uses IF NOT EXISTS)
-- ============================================================================

alter table public.threads 
  add column if not exists type text default 'people' not null 
  check (type in ('people', 'self', 'situation'));

-- ============================================================================
-- 2. CREATE NEW TABLES (Safe - uses IF NOT EXISTS)
-- ============================================================================

create table if not exists public.new_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- 3. ADD INDEXES (Safe - uses IF NOT EXISTS)
-- ============================================================================

create index if not exists idx_new_table_user 
  on public.new_table(user_id);

-- ============================================================================
-- 4. ADD FUNCTIONS (Safe - CREATE OR REPLACE)
-- ============================================================================

create or replace function public.new_function(...)
returns ... as $$
begin
  -- function body
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 5. ADD RLS POLICIES (Safe - will error if exists, just fix name)
-- ============================================================================

create policy "Users can view own data"
  on public.new_table for select
  using (user_id = auth.uid());
```

## Review Process

Before running any migration:

1. **Read the entire migration file**
2. **Check for DROP/DELETE/TRUNCATE statements**
3. **Verify IF NOT EXISTS / IF EXISTS usage**
4. **Test on local/staging first**
5. **Backup production before applying**

## Emergency Rollback

If a migration causes issues:

1. **Stop immediately** - Don't run more migrations
2. **Check Supabase backups** - Settings → Database → Backups
3. **Restore from backup** if available
4. **Fix the migration** and test thoroughly
5. **Re-apply** after fixing

---

**Remember:** Migrations are for schema changes, not data deletion. User data is sacred!

