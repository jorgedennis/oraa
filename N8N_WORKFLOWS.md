# Oraa n8n Workflows Documentation

> **Note:** API keys and secrets have been redacted. Replace `YOUR_*` placeholders with actual credentials.

---

## Overview

All backend logic runs through n8n workflows hosted at your n8n instance.

**Base URL:** `https://n8n.srv1244885.hstgr.cloud/webhook`

**Supabase URL:** `https://ybpsseqzzhttnbpiqaws.supabase.co`

---

## Integration with React Native App

The React Native app connects to these workflows through:

### API Layer (`/api/index.ts`)
Contains typed functions for calling each workflow endpoint:
- `authAPI.getSession(deviceId)` - Get or create anonymous session
- `authAPI.signup(email, password)` - Create new account
- `authAPI.login(email, password)` - Login existing user
- `chatAPI.sendMessage(params)` - Send chat message
- `threadsAPI.fetchThreads()` - Fetch all threads
- `threadsAPI.fetchThread(id)` - Fetch single thread with context
- `threadsAPI.createThread(params)` - Create new thread
- `insightsAPI.fetchStagingQueue()` - Fetch pending insights
- `insightsAPI.respondToInsight(params)` - Respond to staged insight
- `insightsAPI.fetchMapInsights()` - Fetch Map insights by domain

### State Management (`/store/*.ts`)
Zustand stores that:
- Persist auth state in AsyncStorage
- Manage threads and insights state
- Handle thread context in conversations
- Track staging queue

---

## Workflow #1: Auth - User Session Management

### Configuration

**Webhook URL:** `/webhook/auth`  
**Method:** POST  
**Respond:** Using 'Respond to Webhook' Node

### Flow Diagram

```
Webhook → Switch → [Signup User] ─┐
                 → [Login User] ───┤→ Merge → Respond to Webhook
                 → [Get Session] ──┘
                 → [Error Handler]
```

### API Usage

#### Get Anonymous Session
```bash
POST /webhook/auth
Content-Type: application/json

{
  "action": "get_session",
  "device_id": "unique-device-id-123"
}
```

#### Signup
```bash
POST /webhook/auth
Content-Type: application/json

{
  "action": "signup",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```bash
POST /webhook/auth
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

---

## Workflow #2: Chat - Message Processing

### Configuration

**Webhook URL:** `/webhook/chat`  
**Method:** POST  
**Respond:** Using 'Respond to Webhook' Node

### Enhanced Flow Diagram (with Thread Context)

```
Webhook → Check Rate Limit → Switch ─→ [Output 0: Allowed] → Start Conversation
                                   │                          ↓
                                   │                   Load Thread Context (if any)
                                   │                          ↓
                                   │                      Store User Message
                                   │                          ↓
                                   │                   Get Conversation History
                                   │                          ↓
                                   │                   Assemble Context + Call OpenAI
                                   │                          ↓
                                   │                   Store AI Response
                                   │                          ↓
                                   │                   Check for Soft Reminders
                                   │                          ↓
                                   │                   Infer Thread Context
                                   │                          ↓
                                   │                   Respond to Webhook
                                   │
                                   └→ [Output 1: Not Allowed] → Respond Error
```

### Enhanced Request Body

```json
{
  "session_id": "uuid-from-auth",
  "user_id": "uuid-if-authenticated",
  "conversation_id": "existing-conversation-uuid",
  "message": "User's message text",
  "thread_ids": ["thread-uuid-1", "thread-uuid-2"]  // Optional: active thread context
}
```

### Enhanced Response

```json
{
  "success": true,
  "message": "AI response text",
  "conversation_id": "conversation-uuid",
  "rate_limit": {
    "allowed": true,
    "messages_used": 5,
    "messages_remaining": 35
  },
  "inferred_threads": [
    { "id": "thread-uuid", "title": "Mom" }
  ],
  "reminder": {
    "insight_id": "insight-uuid",
    "observation": "You tend to take on responsibility for fixing situations...",
    "domain": "relational"
  }
}
```

### Context Assembly Logic

When `thread_ids` are provided, load context for each thread:

```javascript
// For each thread_id:
const threadContext = await supabase.rpc('get_thread_context', { p_thread_id: threadId });

// Assemble into system prompt addition:
const contextBlock = `
## Active Thread Context

### Thread: ${thread.title}

**Timeline:**
${thread.timeline.map(e => `- ${e.date}: ${e.summary}`).join('\n')}

**Your patterns here:**
${thread.your_patterns_here.map(i => `- ${i.observation}`).join('\n')}

**Working understanding:**
${thread.working_understanding.map(i => `- ${i.observation}`).join('\n')}

**Still curious about:**
${thread.still_curious_about.map(q => `? ${q.question}`).join('\n')}
`;
```

---

## Workflow #3: Threads - Thread Management

### Configuration

**Webhook URL:** `/webhook/threads`  
**Method:** POST  
**Respond:** Using 'Respond to Webhook' Node

### Flow Diagram

```
Webhook → Switch (by action) → [list] ─────────────┐
                             → [get] ──────────────┤
                             → [create] ───────────┤→ Merge → Respond
                             → [create_from_suggestion] ─┤
                             → [update] ───────────┤
                             → [delete] ───────────┤
                             → [suggestions] ──────┤
                             → [dismiss_suggestion] ┘
```

### Nodes

#### Switch (Route by Action)
- Route based on `$json.body.action`

#### Code: List Threads

```javascript
const body = $input.first().json.body;
const userId = body.user_id;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const threads = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/threads?user_id=eq.${userId}&deleted_at=is.null&order=last_mentioned_at.desc.nullsfirst`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  return {
    json: {
      success: true,
      threads: threads
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

#### Code: Get Thread (with Full Context)

```javascript
const body = $input.first().json.body;
const threadId = body.thread_id;
const userId = body.user_id;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  // Use the helper function to get full context
  const context = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/get_thread_context`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ p_thread_id: threadId }),
    json: true
  });
  
  return {
    json: {
      success: true,
      thread: context
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

#### Code: Create Thread

```javascript
const body = $input.first().json.body;
const { title, type, initial_understanding, user_id } = body;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const thread = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/threads`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: user_id,
      title: title,
      type: type || 'people',
      current_understanding: initial_understanding,
      status: 'active',
      mention_count: 0
    }),
    json: true
  });
  
  return {
    json: {
      success: true,
      thread: thread[0]
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

#### Code: Create Thread from Suggestion

```javascript
const body = $input.first().json.body;
const { suggestion_id, type, user_id } = body;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const result = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/create_thread_from_suggestion`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_suggestion_id: suggestion_id,
      p_type: type || 'people'
    }),
    json: true
  });
  
  // Get the created thread
  const thread = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/threads?id=eq.${result}`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  return {
    json: {
      success: true,
      thread: thread[0]
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

### API Usage

#### List Threads
```bash
POST /webhook/threads
Content-Type: application/json

{
  "action": "list",
  "user_id": "user-uuid"
}
```

#### Get Thread with Context
```bash
POST /webhook/threads
Content-Type: application/json

{
  "action": "get",
  "thread_id": "thread-uuid",
  "user_id": "user-uuid"
}
```

#### Create Thread
```bash
POST /webhook/threads
Content-Type: application/json

{
  "action": "create",
  "user_id": "user-uuid",
  "title": "Mom",
  "type": "people",
  "initial_understanding": "Working on boundaries..."
}
```

---

## Workflow #4: Insights - Insight Management

### Configuration

**Webhook URL:** `/webhook/insights`  
**Method:** POST  
**Respond:** Using 'Respond to Webhook' Node

### Flow Diagram

```
Webhook → Switch (by action) → [staging_queue] ────┐
                             → [respond] ──────────┤
                             → [map] ──────────────┤→ Merge → Respond
                             → [delete] ───────────┘
```

### Nodes

#### Code: Get Staging Queue

```javascript
const body = $input.first().json.body;
const userId = body.user_id;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const items = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/get_staging_queue`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({}),
    json: true
  });
  
  return {
    json: {
      success: true,
      items: items
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

#### Code: Respond to Insight

```javascript
const body = $input.first().json.body;
const { queue_id, response, note } = body;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const result = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/respond_to_staged_insight`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_queue_id: queue_id,
      p_response: response,
      p_note: note
    }),
    json: true
  });
  
  return {
    json: {
      success: true,
      ...result
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

#### Code: Get Map Insights

```javascript
const body = $input.first().json.body;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const domains = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/get_map_insights`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({}),
    json: true
  });
  
  return {
    json: {
      success: true,
      domains: domains
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

### API Usage

#### Get Staging Queue
```bash
POST /webhook/insights
Content-Type: application/json

{
  "action": "staging_queue",
  "user_id": "user-uuid"
}
```

#### Respond to Insight
```bash
POST /webhook/insights
Content-Type: application/json

{
  "action": "respond",
  "queue_id": "queue-item-uuid",
  "response": "yes",
  "note": "Optional user note"
}
```

#### Get Map Insights
```bash
POST /webhook/insights
Content-Type: application/json

{
  "action": "map",
  "user_id": "user-uuid"
}
```

---

## Workflow #5: Post-Conversation Processing

### Configuration

**Trigger:** Called after conversation ends (or after N messages)
**Purpose:** Generate insights, thread entries, open questions

### Flow Diagram

```
Trigger → Load Conversation → Load Active Threads
                                    ↓
                            Run Insight Detection
                                    ↓
                            Generate Thread Entries
                                    ↓
                            Generate Open Questions
                                    ↓
                            Update Topic Mentions
                                    ↓
                            Check Thread Suggestions
```

### Code: Insight Detection

```javascript
const data = $input.first().json;
const { conversation_id, user_id, thread_ids, messages } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Get existing self insights for duplicate checking
const existingInsights = await this.helpers.httpRequest({
  method: 'GET',
  url: `${supabaseUrl}/rest/v1/insights?user_id=eq.${user_id}&insight_type=eq.self&status=eq.acknowledged`,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
  json: true
});

// Build conversation transcript
const transcript = messages.map(m => 
  `${m.is_user ? 'User' : 'Oraa'}: ${m.content}`
).join('\n\n');

// Build existing insights list for checking
const existingList = existingInsights.map(i => i.observation).join('\n- ');

// Call OpenAI for insight detection
const detectionPrompt = `
You are analyzing a conversation to detect potential insights.

## Insight Types

1. **Self Insights** - Portable patterns about the user that apply across contexts
   - About the user's internal patterns, NOT about others
   - Should be generalizable (no names or specific contexts in the text)
   - Examples: "You tend to take on responsibility for fixing situations even when they're not yours to fix"

2. **Thread Insights** - Contextual observations about others or dynamics
   - About other people, relationships, or situational dynamics
   - Specific to a thread/relationship
   - Use provisional language ("tends to", "seems to")
   - Examples: "Mom tends to call when she's lonely, framing it as checking in"

## Existing Self Insights (avoid duplicates)
${existingList || 'None yet'}

## Guardrails

### For Self Insights:
- NO names or specific relationships in the text
- Must be about the user's patterns, not others
- Should be detectable in multiple contexts
- Single pattern per insight (don't combine)

### For Thread Insights:
- Must be about the other person or dynamic
- Use epistemic humility ("seems", "tends to")
- Bound to this specific relationship/context

## Conversation Transcript
${transcript}

## Output Format
Return a JSON array of detected insights:
[
  {
    "type": "self" | "thread",
    "observation": "The insight text",
    "domain": "relational" | "emotional" | "cognitive" | "somatic" | "behavioral",
    "confidence": 0.0-1.0,
    "is_redetection": boolean,
    "matched_insight_id": "uuid if redetection"
  }
]

Only return insights with confidence > 0.6. Return empty array if none detected.
`;

const openaiResponse = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an insight detection system. Return only valid JSON.' },
      { role: 'user', content: detectionPrompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  }),
  json: true
});

const detectedInsights = JSON.parse(openaiResponse.choices[0].message.content);

// Process each detected insight
for (const insight of detectedInsights.insights || []) {
  if (insight.type === 'self') {
    if (insight.is_redetection && insight.matched_insight_id) {
      // Create association with thread
      for (const threadId of thread_ids || []) {
        await this.helpers.httpRequest({
          method: 'POST',
          url: `${supabaseUrl}/rest/v1/rpc/associate_insight_with_thread`,
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            p_insight_id: insight.matched_insight_id,
            p_thread_id: threadId,
            p_conversation_id: conversation_id
          }),
          json: true
        });
      }
    } else {
      // Add new insight to staging
      await this.helpers.httpRequest({
        method: 'POST',
        url: `${supabaseUrl}/rest/v1/rpc/add_self_insight_to_staging`,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          p_user_id: user_id,
          p_observation: insight.observation,
          p_domain_id: insight.domain,
          p_thread_id: thread_ids?.[0],
          p_conversation_id: conversation_id
        }),
        json: true
      });
    }
  } else if (insight.type === 'thread' && thread_ids?.length > 0) {
    // Add thread insight to staging
    await this.helpers.httpRequest({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/rpc/add_thread_insight_to_staging`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_thread_id: thread_ids[0],
        p_observation: insight.observation,
        p_conversation_id: conversation_id
      }),
      json: true
    });
  }
}

return { json: { success: true, insights_detected: detectedInsights.insights?.length || 0 } };
```

### Code: Thread Entry Generation

```javascript
const data = $input.first().json;
const { conversation_id, thread_ids, messages, user_id } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

if (!thread_ids || thread_ids.length === 0) {
  return { json: { success: true, entries_created: 0 } };
}

// Build conversation summary for entry generation
const transcript = messages.map(m => 
  `${m.is_user ? 'User' : 'Oraa'}: ${m.content}`
).join('\n\n');

// For each active thread, generate an entry
for (const threadId of thread_ids) {
  // Get thread details
  const thread = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/threads?id=eq.${threadId}`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  if (!thread[0]) continue;
  
  const entryPrompt = `
Generate a brief timeline entry (2-3 sentences) summarizing this conversation from the perspective of the "${thread[0].title}" thread.

Write as Oraa would, observing what was discussed. Include:
- What topics came up related to this thread
- Any emotional context or patterns noticed
- Any significant moments or shifts

Thread: ${thread[0].title}
Thread Type: ${thread[0].type}
Current Understanding: ${thread[0].current_understanding || 'None yet'}

Conversation:
${transcript}

Write only the summary, no preamble.
`;

  const openaiResponse = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: entryPrompt }
      ],
      temperature: 0.5,
      max_tokens: 200
    }),
    json: true
  });
  
  const summary = openaiResponse.choices[0].message.content.trim();
  
  // Add thread entry
  await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/add_thread_entry`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_thread_id: threadId,
      p_summary: summary,
      p_conversation_id: conversation_id
    }),
    json: true
  });
}

return { json: { success: true, entries_created: thread_ids.length } };
```

### Code: Open Question Generation

```javascript
const data = $input.first().json;
const { thread_ids, messages, user_id } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

if (!thread_ids || thread_ids.length === 0) {
  return { json: { success: true, questions_generated: 0 } };
}

const transcript = messages.map(m => 
  `${m.is_user ? 'User' : 'Oraa'}: ${m.content}`
).join('\n\n');

let totalQuestions = 0;

for (const threadId of thread_ids) {
  // Get existing questions to avoid duplicates
  const existingQuestions = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/thread_questions?thread_id=eq.${threadId}&is_answered=eq.false`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  const existingList = existingQuestions.map(q => q.question).join('\n- ');
  
  const questionPrompt = `
Based on this conversation, generate 1-2 open questions that would be worth exploring in future conversations about this thread.

Questions should be:
- Genuinely curious, not leading
- About unexplored territory
- Specific enough to be actionable
- Different from existing questions

Existing questions (avoid duplicates):
${existingList || 'None yet'}

Conversation:
${transcript}

Return a JSON array of questions:
["Question 1?", "Question 2?"]

Return empty array if no good questions come up.
`;

  const openaiResponse = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Return only valid JSON array of strings.' },
        { role: 'user', content: questionPrompt }
      ],
      temperature: 0.6,
      max_tokens: 200
    }),
    json: true
  });
  
  const questions = JSON.parse(openaiResponse.choices[0].message.content);
  
  for (const question of questions) {
    await this.helpers.httpRequest({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/thread_questions`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        thread_id: threadId,
        question: question,
        is_answered: false
      }),
      json: true
    });
    totalQuestions++;
  }
}

return { json: { success: true, questions_generated: totalQuestions } };
```

---

## Workflow #6: Thread Context Inference

### Configuration

**Purpose:** Infer relevant threads from message content
**Called by:** Chat workflow on new messages

### Code: Infer Thread Context

```javascript
const data = $input.first().json;
const { message, user_id } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Get user's active threads
const threads = await this.helpers.httpRequest({
  method: 'GET',
  url: `${supabaseUrl}/rest/v1/threads?user_id=eq.${user_id}&status=eq.active&deleted_at=is.null`,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
  json: true
});

if (threads.length === 0) {
  return { json: { inferred_threads: [] } };
}

const threadList = threads.map(t => `- ${t.id}: "${t.title}" (${t.type}) - ${t.current_understanding || 'No context'}`).join('\n');

const inferPrompt = `
Given this message and the user's existing threads, which threads (if any) does this message relate to?

User's message: "${message}"

Available threads:
${threadList}

Return a JSON array of thread IDs that are relevant (max 2-3). Return empty array if none apply.
Example: ["uuid-1", "uuid-2"]
`;

const openaiResponse = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Return only valid JSON array of UUIDs.' },
      { role: 'user', content: inferPrompt }
    ],
    temperature: 0.3,
    max_tokens: 100
  }),
  json: true
});

const inferredIds = JSON.parse(openaiResponse.choices[0].message.content);

// Get thread details for response
const inferredThreads = threads
  .filter(t => inferredIds.includes(t.id))
  .map(t => ({ id: t.id, title: t.title }));

return { json: { inferred_threads: inferredThreads } };
```

---

## Workflow #7: Soft Reminder Check

### Configuration

**Purpose:** Check if message content matches existing self insights
**Called by:** Chat workflow during conversation

### Code: Check for Soft Reminders

```javascript
const data = $input.first().json;
const { message, user_id, thread_ids } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Get user's acknowledged self insights
const insights = await this.helpers.httpRequest({
  method: 'GET',
  url: `${supabaseUrl}/rest/v1/insights?user_id=eq.${user_id}&insight_type=eq.self&status=eq.acknowledged`,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
  json: true
});

if (insights.length === 0) {
  return { json: { reminder: null } };
}

const insightList = insights.map(i => 
  `- ${i.id}: "${i.observation}" (${i.domain_id})`
).join('\n');

const checkPrompt = `
Does this message show evidence of any of these previously-confirmed patterns?

Message: "${message}"

User's confirmed patterns:
${insightList}

If a pattern is clearly showing up, return the insight ID. Only return a match if it's clearly relevant.

Return JSON: { "match": true/false, "insight_id": "uuid or null" }
`;

const openaiResponse = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Return only valid JSON.' },
      { role: 'user', content: checkPrompt }
    ],
    temperature: 0.2,
    max_tokens: 50
  }),
  json: true
});

const result = JSON.parse(openaiResponse.choices[0].message.content);

if (result.match && result.insight_id) {
  const matchedInsight = insights.find(i => i.id === result.insight_id);
  
  // Create association with active thread if new
  if (thread_ids?.length > 0) {
    for (const threadId of thread_ids) {
      await this.helpers.httpRequest({
        method: 'POST',
        url: `${supabaseUrl}/rest/v1/rpc/associate_insight_with_thread`,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          p_insight_id: result.insight_id,
          p_thread_id: threadId
        }),
        json: true
      });
    }
  }
  
  return {
    json: {
      reminder: {
        insight_id: matchedInsight.id,
        observation: matchedInsight.observation,
        domain: matchedInsight.domain_id
      }
    }
  };
}

return { json: { reminder: null } };
```

---

## Workflow #8: Topic Mention Tracking & Thread Suggestions

### Configuration

**Purpose:** Track topic frequency and suggest new threads
**Called by:** Post-conversation workflow

### Code: Update Topic Mentions

```javascript
const data = $input.first().json;
const { messages, user_id } = data;

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Extract topics from conversation
const transcript = messages.map(m => m.content).join(' ');

const extractPrompt = `
Extract named topics, people, or themes from this conversation that might warrant tracking over time.

Conversation: "${transcript}"

Return JSON array of topics:
[
  { "text": "topic name", "type": "person" | "self" | "situation" | "general" }
]

Guidelines:
- People: specific individuals mentioned (Mom, Alex, my boss)
- Self: internal patterns or identity themes (career identity, body image)
- Situation: time-bound circumstances (the move, job search)
- General: other recurring themes

Return empty array if nothing significant.
`;

const openaiResponse = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Return only valid JSON array.' },
      { role: 'user', content: extractPrompt }
    ],
    temperature: 0.3,
    max_tokens: 200
  }),
  json: true
});

const topics = JSON.parse(openaiResponse.choices[0].message.content);

const mentionCounts = [];
for (const topic of topics) {
  const count = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/update_topic_mention`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_topic_text: topic.text,
      p_topic_type: topic.type
    }),
    json: true
  });
  mentionCounts.push({ topic: topic.text, count });
}

// Check for suggestion threshold (4+ mentions, no existing thread)
const THRESHOLD = 4;
const suggestionCandidates = mentionCounts.filter(m => m.count >= THRESHOLD);

for (const candidate of suggestionCandidates) {
  // Check if thread or suggestion already exists
  const existingThread = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/threads?user_id=eq.${user_id}&title=ilike.${encodeURIComponent('%' + candidate.topic + '%')}&deleted_at=is.null`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  if (existingThread.length > 0) continue;
  
  const existingSuggestion = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/thread_suggestions?user_id=eq.${user_id}&topic=ilike.${encodeURIComponent('%' + candidate.topic + '%')}&status=eq.pending`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  if (existingSuggestion.length > 0) continue;
  
  // Create suggestion
  const suggestionDesc = `${candidate.topic} has come up ${candidate.count} times now. Want me to track this over time?`;
  
  await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/thread_suggestions`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      user_id: user_id,
      topic: candidate.topic,
      description: suggestionDesc,
      mention_count: candidate.count,
      status: 'pending'
    }),
    json: true
  });
  
  // Add to staging queue
  const suggestions = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/thread_suggestions?user_id=eq.${user_id}&topic=eq.${encodeURIComponent(candidate.topic)}&status=eq.pending`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  if (suggestions[0]) {
    await this.helpers.httpRequest({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/staging_queue`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        user_id: user_id,
        item_type: 'thread_suggestion',
        item_id: suggestions[0].id
      }),
      json: true
    });
  }
}

return { json: { success: true, topics_tracked: topics.length } };
```

---

## Rate Limiting

### Anonymous Users
- **Limit:** 10 messages (lifetime)
- **Tracked by:** `session_id`
- **Function:** `use_anonymous_message(session_id)`

### Registered Users
- **Limit:** 40 messages per day
- **Tracked by:** `user_id` + `usage_date`
- **Function:** `use_daily_message()`
- **Resets:** Daily at midnight UTC

---

## Supabase Functions Used

### Session & Auth
- `get_or_create_session(device_id)` - Get or create anonymous session
- `get_usage_status(session_id)` - Get current message usage
- `claim_session(session_id)` - Transfer anonymous data to registered user

### Rate Limiting
- `use_anonymous_message(session_id)` - Check and consume anonymous message
- `use_daily_message(daily_limit)` - Check and consume daily message

### Conversations
- `start_conversation(session_id, thread_id)` - Create new conversation
- `add_message(conversation_id, content, is_user)` - Store message

### Threads
- `get_thread_context(thread_id)` - Get full thread context for AI
- `create_thread_from_suggestion(suggestion_id, type)` - Create thread
- `add_thread_entry(thread_id, summary, conversation_id)` - Add timeline entry

### Insights
- `get_staging_queue()` - Get pending insights/suggestions
- `respond_to_staged_insight(queue_id, response, note)` - Process user response
- `get_map_insights()` - Get insights by domain for Map view
- `add_self_insight_to_staging(...)` - Add new self insight
- `add_thread_insight_to_staging(...)` - Add new thread insight
- `associate_insight_with_thread(...)` - Link insight to thread

### Topics
- `update_topic_mention(topic_text, topic_type)` - Track topic frequency

---

## Environment Variables Needed

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-key

# n8n
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.cloud/webhook
```

---

## Testing

### Test Threads Workflow
```bash
# List threads
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/threads \
  -H "Content-Type: application/json" \
  -d '{"action":"list","user_id":"user-uuid"}'

# Get thread with context
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/threads \
  -H "Content-Type: application/json" \
  -d '{"action":"get","thread_id":"thread-uuid","user_id":"user-uuid"}'

# Create thread
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/threads \
  -H "Content-Type: application/json" \
  -d '{"action":"create","user_id":"user-uuid","title":"Mom","type":"people"}'
```

### Test Insights Workflow
```bash
# Get staging queue
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/insights \
  -H "Content-Type: application/json" \
  -d '{"action":"staging_queue","user_id":"user-uuid"}'

# Respond to insight
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/insights \
  -H "Content-Type: application/json" \
  -d '{"action":"respond","queue_id":"queue-uuid","response":"yes"}'

# Get Map insights
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/insights \
  -H "Content-Type: application/json" \
  -d '{"action":"map","user_id":"user-uuid"}'
```

### Test Chat with Thread Context
```bash
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id":"session-uuid",
    "message":"I talked to mom today and felt guilty again",
    "thread_ids":["mom-thread-uuid"]
  }'
```

---

## Troubleshooting

### Common Errors

**"Function not found"**
- Solution: Run the migration to create the new functions

**"Thread not found"**
- Solution: Verify thread_id exists and user has access

**"Invalid response"**
- Solution: Ensure response is one of: yes, maybe, no, partially

### Debugging

1. Go to n8n Executions tab
2. Click on failed execution
3. Click on red node to see error details
4. Check node input/output data

---

## Summary of New Workflows

| Workflow | Endpoint | Purpose |
|----------|----------|---------|
| Threads | `/webhook/threads` | Thread CRUD, suggestions |
| Insights | `/webhook/insights` | Staging queue, Map, responses |
| Post-Conversation | (internal) | Insight detection, entries, questions |
| Thread Inference | (internal) | Infer relevant threads |
| Soft Reminders | (internal) | Detect pattern re-occurrence |
| Topic Tracking | (internal) | Track frequency, suggest threads |
