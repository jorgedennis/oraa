# Oraa Supabase Database

This directory contains the database schema, migrations, and configuration for Oraa's Supabase backend.

## Structure

```
supabase/
├── config.toml                           # Supabase local config
├── migrations/
│   ├── 20260103000001_initial_schema.sql # Tables, indexes, triggers
│   ├── 20260103000002_rls_policies.sql   # Row-level security
│   ├── 20260103000003_functions.sql      # Helper functions
│   ├── 20260103000004_threads_insights_schema.sql # Threads & Insights
│   └── .migration-check.sh              # Safety check script
├── seed.sql                              # Initial data (domains)
├── MIGRATION_GUIDELINES.md               # ⚠️ READ THIS BEFORE CREATING MIGRATIONS
└── README.md
```

## ⚠️ CRITICAL: Migration Safety

**BEFORE creating or running any migration:**

1. **Read `MIGRATION_GUIDELINES.md`** - Contains rules to prevent data loss
2. **Run safety check:** `bash supabase/migrations/.migration-check.sh`
3. **Never use DROP TABLE** on tables with user data
4. **Always use IF NOT EXISTS** for additions

## Setup

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref ybpsseqzzhttnbpiqaws
```

### 4. Check migrations before applying

```bash
bash supabase/migrations/.migration-check.sh
```

### 5. Run migrations

```bash
supabase db push
```

### 6. Seed the database (reference data only)

Run `seed.sql` in Supabase SQL Editor or:

```bash
# Copy seed.sql content and paste in Supabase Dashboard → SQL Editor
```

## Testing Checklist

Before running migrations:

- [ ] Read `MIGRATION_GUIDELINES.md`
- [ ] Ran safety check script
- [ ] No DROP TABLE statements found
- [ ] All additions use IF NOT EXISTS
- [ ] Tested on local/staging first
- [ ] Backup production database

## What Happened (2026-01-07)

Migration `20260103000001_initial_schema.sql` used `DROP TABLE` statements, which deleted all existing data when applied to a database with messages/conversations.

**Lesson:** Never use DROP TABLE in migrations. Always use ALTER TABLE for modifications.

## Key Functions

| Function | Description |
|----------|-------------|
| `get_or_create_session(device_id)` | Get or create anonymous session |
| `claim_session(session_id)` | Claim session when user registers |
| `use_anonymous_message(session_id)` | Check/consume anonymous message (10 lifetime) |
| `use_daily_message(daily_limit?)` | Check/consume daily message (40/day default) |
| `get_usage_status(session_id?)` | Get current usage for UI display |
| `start_conversation(session_id?, thread_id?)` | Start new conversation |
| `add_message(conversation_id, content, is_user)` | Add message |
| `get_thread_context(thread_id)` | Get full thread context for AI |
| `get_staging_queue()` | Get pending insights/suggestions |
| `get_map_insights()` | Get Map insights by domain |
| `associate_insight_with_thread(...)` | Link insight to thread |

## Rate Limiting

| User Type | Limit | Scope |
|-----------|-------|-------|
| Anonymous | 10 messages | Lifetime (per device) |
| Registered (Free) | 40 messages | Per day (resets midnight) |

## Row-Level Security

All tables have RLS enabled:
- **Authenticated users**: Can only access their own data
- **Anonymous sessions**: Access via `session_id` and `device_id` header
- **Service role**: Bypasses RLS (for backend/AI operations)

## Environment Variables

Required in your app:

```
EXPO_PUBLIC_SUPABASE_URL=https://ybpsseqzzhttnbpiqaws.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For backend/server:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
