# Conversation List Implementation

## ✅ What's Been Implemented

### 1. **Conversation Store** (`store/conversations.ts`)
- Manages list of conversations
- Tracks current conversation ID
- Fetches conversations from n8n (endpoint needed)
- Handles conversation selection

### 2. **Updated Drawer Navigation** (`components/navigation/drawer-content.tsx`)
- **Expandable Chat Section:**
  - Tap "Chat" to expand/collapse conversation list
  - Shows expand/collapse arrow (▶/▼)
  
- **New Conversation Button:**
  - Always visible at top when Chat is expanded
  - Distinct styling (dashed border, blue text)
  - Separated from old conversations with divider
  
- **Conversation List:**
  - Shows up to 8 conversations visible
  - Scrollable within dropdown window
  - Other nav items remain visible at bottom
  - Shows conversation preview, date, and message count
  - Highlights active conversation
  
- **Visual Separation:**
  - Conversations dropdown has distinct background
  - Clear separation between new chat button and old chats
  - Other nav items pushed down but remain visible

### 3. **Nested Route Structure**
- `app/(drawer)/chat/_layout.tsx` - Chat layout with nested routes
- `app/(drawer)/chat/index.tsx` - New conversation route
- `app/(drawer)/chat/[id].tsx` - Existing conversation route

### 4. **Updated Chat Store** (`store/chat.ts`)
- Added `loadConversation()` function
- Syncs conversation ID when switching conversations
- Clears messages when starting new conversation

## 🎨 Visual Structure

```
Drawer Sidebar:
┌─────────────────────────┐
│ 🎯 Oraa                  │
│ Your thinking partner    │
├─────────────────────────┤
│ 💬 Chat ▼               │ ← Expandable
│ ┌─────────────────────┐ │
│ │ ➕ New conversation │ │ ← Distinct styling
│ ├─────────────────────┤ │ ← Separator
│ │ 📝 Work stress ✓    │ │ ← Active (highlighted)
│ │ 📝 Relationship     │ │
│ │ 📝 Career anxiety   │ │
│ │ ... (scrollable)    │ │ ← Max 8 visible
│ └─────────────────────┘ │
├─────────────────────────┤
│ 🗺️ Map                  │ ← Other nav items
│ ✨ Insights             │ ← Remain visible
│ 🧵 Threads              │
│ 📔 Journal               │
├─────────────────────────┤
│ ⚙️ Settings              │
└─────────────────────────┘
```

## 🔧 How It Works

### Starting a New Conversation
1. User taps "New conversation" in drawer
2. Navigates to `/(drawer)/chat` (index route)
3. Chat store clears messages and conversation ID
4. User sends first message → n8n creates new conversation
5. Conversation ID is saved and added to list

### Switching to Existing Conversation
1. User taps conversation in drawer
2. Navigates to `/(drawer)/chat/[id]`
3. Conversation store selects that conversation
4. Chat store loads conversation (messages will be fetched)
5. Messages display in chat screen

### Expanding/Collapsing Chat Section
- Tap "Chat" to toggle expand/collapse
- Auto-expands when on chat screen
- Fetches conversations when expanded

## 📋 TODO: n8n Endpoints Needed

### 1. **Fetch Conversations Endpoint**
**URL:** `POST /webhook/conversations`

**Request:**
```json
{
  "session_id": "uuid" (optional, for anonymous),
  "user_id": "uuid" (optional, for registered)
}
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "started_at": "2026-01-04T12:00:00Z",
      "ended_at": null,
      "message_count": 5,
      "preview": "I've been feeling stressed lately...",
      "thread_id": null
    }
  ]
}
```

**Implementation Notes:**
- Query `conversations` table filtered by `session_id` or `user_id`
- Order by `started_at DESC` (newest first)
- Include preview (first user message or AI summary)
- Count messages per conversation

### 2. **Fetch Conversation Messages Endpoint**
**URL:** `POST /webhook/conversations/:id/messages`

**Request:**
```json
{
  "conversation_id": "uuid",
  "session_id": "uuid" (optional),
  "user_id": "uuid" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "content": "Hello Oraa",
      "is_user": true,
      "created_at": "2026-01-04T12:00:00Z"
    },
    {
      "id": "uuid",
      "content": "Hello! How can I help?",
      "is_user": false,
      "created_at": "2026-01-04T12:00:01Z"
    }
  ]
}
```

**Implementation Notes:**
- Query `messages` table filtered by `conversation_id`
- Order by `created_at ASC` (oldest first)
- Verify user/session has access to conversation (RLS)

## 🎯 Current Behavior

### What Works Now:
- ✅ Drawer shows expandable Chat section
- ✅ "New conversation" button appears
- ✅ Conversation list UI (when endpoint is ready)
- ✅ Navigation between conversations
- ✅ New conversation creation
- ✅ Visual separation and styling

### What Needs n8n Endpoints:
- ⏳ Fetching conversation list (shows empty for now)
- ⏳ Loading messages for existing conversations
- ⏳ Conversation preview text

## 🚀 Next Steps

1. **Create n8n workflows:**
   - Workflow #3: Fetch Conversations
   - Workflow #4: Fetch Conversation Messages

2. **Update chat store:**
   - Implement message loading in `loadConversation()`
   - Handle conversation preview generation

3. **Add features:**
   - Delete conversation option
   - Rename conversation
   - Search conversations
   - Conversation archiving

## 📝 Testing

To test the UI (without backend):
1. Open drawer
2. Tap "Chat" to expand
3. See "New conversation" button
4. See empty conversation list (until endpoint is ready)
5. Tap "New conversation" → navigates to chat
6. Send message → creates conversation
7. Open drawer again → should see conversation in list

Once endpoints are ready:
- Conversations will populate automatically
- Tapping a conversation will load its messages
- Preview text will show in list

