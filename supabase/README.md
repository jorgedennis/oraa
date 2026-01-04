# Oraa Supabase Database

This directory contains the database schema, migrations, and configuration for Oraa's Supabase backend.

## Structure

```
supabase/
├── config.toml                           # Supabase local config
├── migrations/
│   ├── 20260103000001_initial_schema.sql # Tables, indexes, triggers
│   ├── 20260103000002_rls_policies.sql   # Row-level security
│   └── 20260103000003_functions.sql      # Helper functions
├── seed.sql                              # Initial data (domains)
└── README.md
```

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run migrations

```bash
supabase db push
```

### 5. Seed the database

```bash
supabase db reset --seed-only
```

## Local Development

Start local Supabase:

```bash
supabase start
```

This gives you:
- Local PostgreSQL database
- Local Auth server
- Local Storage server
- Studio UI at http://localhost:54323

## Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles (extends auth.users) |
| `sessions` | Anonymous device sessions |
| `user_preferences` | User settings (theme, limits) |
| `conversations` | Chat conversations |
| `messages` | Individual messages |
| `threads` | Ongoing storylines |
| `thread_entries` | Timeline entries for threads |
| `journal_entries` | Daily AI-generated summaries |
| `insights` | AI observations for review |
| `domains` | 7 psychological domains (static) |
| `user_domains` | User's map analysis per domain |

### Key Flows

#### Anonymous to Authenticated

1. User starts app → device_id generated
2. `get_or_create_session(device_id)` → session created
3. Conversations stored with `session_id`
4. User signs up → `claim_session(session_id)`
5. All data transferred to user account

#### Insight Workflow

1. AI generates insight during conversation
2. Insight stored with `status = 'pending'`
3. User reviews in Insights screen
4. `acknowledge_insight(id, 'yes'|'maybe'|'no', note)`
5. Acknowledged insights enrich the user's Map

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
| `acknowledge_insight(id, response, note?)` | Respond to insight |
| `accept_thread_suggestion(id)` | Create thread from suggestion |
| `export_user_data()` | GDPR data export |
| `delete_user_data()` | Account deletion |

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
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For backend/server:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

