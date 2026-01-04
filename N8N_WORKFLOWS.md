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

### State Management (`/store/auth.ts` & `/store/chat.ts`)
Zustand stores that:
- Persist auth state in AsyncStorage
- Automatically initialize on app start
- Handle anonymous → registered user transitions
- Track usage limits and rate limiting
- Manage conversation state

### Usage Example

```typescript
import { useAuthStore, useChatStore } from '@/store';

// In a component
const { isAuthenticated, isAnonymous, email, usageStatus } = useAuthStore();
const { messages, sendMessage, isSending } = useChatStore();

// Send a message
await sendMessage("I'm feeling stressed");

// Check usage
console.log(usageStatus.messages_remaining);
```

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

### Nodes

#### 1. Webhook
- **Path:** `auth`
- **Method:** POST
- **Authentication:** None
- **Respond:** Using 'Respond to Webhook' Node

#### 2. Switch (Route by Action)
- **Mode:** Rules
- **Routing Rules:**
  - **Output 0 (Signup):**
    - Type: String
    - Value: `{{ $json.body.action }}`
    - Operation: equals
    - Compare to: `signup`
  
  - **Output 1 (Login):**
    - Type: String
    - Value: `{{ $json.body.action }}`
    - Operation: equals
    - Compare to: `login`
  
  - **Output 2 (Get Session):**
    - Type: String
    - Value: `{{ $json.body.action }}`
    - Operation: equals
    - Compare to: `get_session`

#### 3. Code: Signup User

```javascript
// Get email and password from the request
const email = $input.first().json.body.email;
const password = $input.first().json.body.password;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Check if email and password were provided
if (!email || !password) {
  return {
    json: {
      success: false,
      error: 'Email and password are required'
    }
  };
}

// Call Supabase to create a new user
try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/auth/v1/signup`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      email: email,
      password: password,
      email_confirm: false
    }),
    json: true
  });

  if (response.user) {
    return {
      json: {
        success: true,
        user_id: response.user.id,
        email: response.user.email,
        jwt: response.access_token,
        message: 'Account created successfully!'
      }
    };
  } else {
    return {
      json: {
        success: false,
        error: response.msg || response.message || 'Signup failed',
        details: response
      }
    };
  }
} catch (error) {
  return {
    json: {
      success: false,
      error: 'Failed to connect to authentication service',
      details: error.message
    }
  };
}
```

#### 4. Code: Login User

```javascript
// Get email and password from the request
const email = $input.first().json.body.email;
const password = $input.first().json.body.password;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Check if email and password were provided
if (!email || !password) {
  return {
    json: {
      success: false,
      error: 'Email and password are required'
    }
  };
}

// Call Supabase to log the user in
try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({
      email: email,
      password: password
    }),
    json: true
  });

  if (response.access_token) {
    return {
      json: {
        success: true,
        user_id: response.user.id,
        email: response.user.email,
        jwt: response.access_token,
        refresh_token: response.refresh_token,
        message: 'Login successful!'
      }
    };
  } else {
    return {
      json: {
        success: false,
        error: response.error_description || response.msg || 'Invalid email or password',
        details: response
      }
    };
  }
} catch (error) {
  return {
    json: {
      success: false,
      error: 'Failed to connect to authentication service',
      details: error.message
    }
  };
}
```

#### 5. Code: Get Session

```javascript
const deviceId = $input.first().json.body.device_id;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Check if device ID was provided
if (!deviceId) {
  return {
    json: {
      success: false,
      error: 'device_id is required'
    }
  };
}

try {
  const sessionResponse = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/get_or_create_session`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ p_device_id: deviceId }),
    json: true
  });
  
  const sessionId = typeof sessionResponse === 'string' ? sessionResponse : sessionResponse;
  
  const usageResponse = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/get_usage_status`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ p_session_id: sessionId }),
    json: true
  });

  return {
    json: {
      success: true,
      session_id: sessionId,
      usage_status: usageResponse,
      message: 'Session created successfully!'
    }
  };
} catch (error) {
  return {
    json: {
      success: false,
      error: 'Failed to connect to database',
      details: error.message
    }
  };
}
```

#### 6. Merge
- **Mode:** Append

#### 7. Respond to Webhook
- **Respond With:** First Incoming Item

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

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-here",
  "usage_status": {
    "type": "anonymous",
    "messages_used": 0,
    "messages_remaining": 10,
    "is_lifetime_limit": true
  }
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

**Response:**
```json
{
  "success": true,
  "user_id": "uuid-here",
  "email": "user@example.com",
  "jwt": "jwt-token-here",
  "message": "Account created successfully!"
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

**Response:**
```json
{
  "success": true,
  "user_id": "uuid-here",
  "email": "user@example.com",
  "jwt": "jwt-token-here",
  "refresh_token": "refresh-token-here",
  "message": "Login successful!"
}
```

---

## Workflow #2: Chat - Message Processing

### Configuration

**Webhook URL:** `/webhook/chat`  
**Method:** POST  
**Respond:** Using 'Respond to Webhook' Node

### Flow Diagram

```
Webhook → Check Rate Limit → Switch ─→ [Output 0: Allowed] → Start Conversation
                                    │                          ↓
                                    │                      Store User Message
                                    │                          ↓
                                    │                   Get Conversation History
                                    │                          ↓
                                    │                      Call OpenAI
                                    │                          ↓
                                    │                   Store AI Response
                                    │                          ↓
                                    │                   Respond to Webhook
                                    │
                                    └→ [Output 1: Not Allowed] → Respond Error
```

### Nodes

#### 1. Webhook
- **Path:** `chat`
- **Method:** POST
- **Authentication:** None
- **Respond:** Using 'Respond to Webhook' Node

#### 2. Code: Check Rate Limit

```javascript
const body = $input.first().json.body;
const sessionId = body.session_id;
const userId = body.user_id;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

if (!sessionId && !userId) {
  return {
    json: {
      ...body,
      rate_limit: {
        allowed: false,
        error: 'session_id or user_id required'
      }
    }
  };
}

try {
  // Determine which rate limit function to call
  let rateLimitResponse;
  
  if (sessionId) {
    // Anonymous user - check session allowance
    rateLimitResponse = await this.helpers.httpRequest({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/rpc/use_anonymous_message`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ p_session_id: sessionId }),
      json: true
    });
  } else {
    // Registered user - check daily limit
    rateLimitResponse = await this.helpers.httpRequest({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/rpc/use_daily_message`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ p_daily_limit: 40 }),
      json: true
    });
  }
  
  // Ensure allowed is a proper boolean
  const isAllowed = rateLimitResponse.allowed === true || rateLimitResponse.allowed === 'true';
  
  // Pass through the original request + rate limit info
  return {
    json: {
      ...body,
      rate_limit: {
        ...rateLimitResponse,
        allowed: isAllowed
      }
    }
  };
  
} catch (error) {
  return {
    json: {
      ...body,
      rate_limit: {
        allowed: false,
        error: 'Rate limit check failed',
        details: error.message
      }
    }
  };
}
```

#### 3. Switch (Check if Allowed)
- **Mode:** Rules
- **Routing Rules:**
  - **Output 0 (Allowed):**
    - Type: Boolean
    - Value: `{{ $json.rate_limit.allowed }}`
    - Operation: is true
  
  - **Output 1 (Not Allowed):**
    - Fallback (Otherwise)

- **Convert types where required:** ✅ Enabled

#### 4. Code: Start or Get Conversation

```javascript
const data = $input.first().json;
const conversationId = data.conversation_id;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// If conversation_id provided, use it. Otherwise create new one.
if (conversationId) {
  return {
    json: {
      ...data,
      conversation_id: conversationId,
      is_new_conversation: false
    }
  };
}

// Create new conversation
try {
  const newConvId = await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/start_conversation`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_session_id: data.session_id,
      p_thread_id: data.thread_id || null
    }),
    json: true
  });
  
  return {
    json: {
      ...data,
      conversation_id: newConvId,
      is_new_conversation: true
    }
  };
} catch (error) {
  throw new Error('Failed to start conversation: ' + error.message);
}
```

#### 5. Code: Store User Message

```javascript
const data = $input.first().json;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/add_message`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_conversation_id: data.conversation_id,
      p_content: data.message,
      p_is_user: true
    }),
    json: true
  });
  
  return { json: data };
} catch (error) {
  throw new Error('Failed to store message: ' + error.message);
}
```

#### 6. Code: Get Conversation History

```javascript
const data = $input.first().json;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  const messages = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${data.conversation_id}&order=sequence_number.asc`,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    json: true
  });
  
  return {
    json: {
      ...data,
      conversation_history: messages
    }
  };
} catch (error) {
  throw new Error('Failed to get history: ' + error.message);
}
```

#### 7. Code: Call OpenAI

```javascript
const data = $input.first().json;
const messages = data.conversation_history;

// Convert to OpenAI format
const openaiMessages = [
  {
    role: 'system',
    content: 'You are Oraa, a compassionate AI companion for emotional support and self-reflection. You listen deeply, ask thoughtful questions, and help users understand themselves better. You are warm, honest, and provide gentle pushback when needed. You are not a therapist, but a supportive friend to think with.'
  },
  ...messages.map(msg => ({
    role: msg.is_user ? 'user' : 'assistant',
    content: msg.content
  }))
];

try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: openaiMessages,
      temperature: 0.8,
      max_tokens: 500
    }),
    json: true
  });
  
  const aiMessage = response.choices[0].message.content;
  
  return {
    json: {
      ...data,
      ai_response: aiMessage
    }
  };
} catch (error) {
  throw new Error('OpenAI failed: ' + error.message);
}
```

#### 8. Code: Store AI Response

```javascript
const data = $input.first().json;

// YOUR SUPABASE INFO
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

try {
  await this.helpers.httpRequest({
    method: 'POST',
    url: `${supabaseUrl}/rest/v1/rpc/add_message`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      p_conversation_id: data.conversation_id,
      p_content: data.ai_response,
      p_is_user: false
    }),
    json: true
  });
  
  return {
    json: {
      success: true,
      message: data.ai_response,
      conversation_id: data.conversation_id,
      rate_limit: data.rate_limit
    }
  };
} catch (error) {
  throw new Error('Failed to store AI response: ' + error.message);
}
```

#### 9. Respond to Webhook (Success Path)
- **Respond With:** First Incoming Item

#### 10. Respond to Webhook (Error Path - Output 1)
- **Respond With:** First Incoming Item
- This returns the rate limit error when messages are exhausted

### API Usage

#### Send Chat Message (New Conversation)
```bash
POST /webhook/chat
Content-Type: application/json

{
  "session_id": "uuid-from-auth",
  "message": "Hey Oraa, I've been feeling stressed lately."
}
```

**Response:**
```json
{
  "success": true,
  "message": "I hear you. What's been contributing to that stress?",
  "conversation_id": "new-uuid",
  "rate_limit": {
    "allowed": true,
    "reason": "anonymous_allowance",
    "messages_used": 1,
    "messages_remaining": 9
  }
}
```

#### Continue Conversation
```bash
POST /webhook/chat
Content-Type: application/json

{
  "session_id": "uuid-from-auth",
  "conversation_id": "existing-conversation-uuid",
  "message": "It's mostly work. I can't find balance."
}
```

**Response:**
```json
{
  "success": true,
  "message": "That sounds exhausting. What does balance look like for you?",
  "conversation_id": "same-uuid",
  "rate_limit": {
    "allowed": true,
    "messages_used": 2,
    "messages_remaining": 8
  }
}
```

#### Rate Limit Exceeded
```json
{
  "allowed": false,
  "reason": "allowance_exceeded",
  "messages_used": 10,
  "message_allowance": 10,
  "message": "Create a free account to continue chatting"
}
```

---

## Rate Limiting

### Anonymous Users
- **Limit:** 10 messages (lifetime)
- **Tracked by:** `session_id`
- **Function:** `use_anonymous_message(session_id)`
- **Prompt to sign up:** After reaching limit

### Registered Users
- **Limit:** 40 messages per day
- **Tracked by:** `user_id` + `usage_date`
- **Function:** `use_daily_message()`
- **Resets:** Daily at midnight UTC

---

## Supabase Functions Used

### Authentication & Sessions
- `get_or_create_session(device_id)` - Get or create anonymous session
- `get_usage_status(session_id)` - Get current message usage
- `claim_session(session_id)` - Transfer anonymous data to registered user

### Rate Limiting
- `use_anonymous_message(session_id)` - Check and consume anonymous message
- `use_daily_message(daily_limit)` - Check and consume daily message

### Conversations & Messages
- `start_conversation(session_id, thread_id)` - Create new conversation
- `add_message(conversation_id, content, is_user)` - Store message
- `end_conversation(conversation_id)` - Mark conversation as ended

---

## Environment Variables Needed

Replace these placeholders with actual values:

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

### Test Auth Workflow
```bash
# Get Session
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"get_session","device_id":"test-device-123"}'

# Signup
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"signup","email":"test@test.com","password":"test123"}'

# Login
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@test.com","password":"test123"}'
```

### Test Chat Workflow
```bash
# First message
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"your-session-id","message":"Hello!"}'

# Continue conversation
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"your-session-id","conversation_id":"conv-id","message":"Tell me more"}'
```

---

## Future Workflows (To Be Built)

- **Workflow #3:** Insight Generation
- **Workflow #4:** Daily Journal Generation
- **Workflow #5:** Thread Detection & Management
- **Workflow #6:** User Map Domain Analysis
- **Workflow #7:** Data Export (GDPR)

---

## Troubleshooting

### Common Errors

**"Wrong type: 'true' is a boolean but was expecting a string"**
- Solution: Enable "Convert types where required" in Switch node

**"Request failed with status code 429" (OpenAI)**
- Solution: Check OpenAI billing and API quota

**"Request failed with status code 401" (Supabase)**
- Solution: Verify service_role key is correct and not expired

**"Function not found"**
- Solution: Run `supabase db push` to apply migrations

### Debugging

1. Go to n8n Executions tab
2. Click on failed execution
3. Click on red node to see error details
4. Check node input/output data

---

## Notes

- All sensitive keys should be stored in n8n credentials manager (not hardcoded)
- Use environment variables for production
- Enable CORS if calling from web browsers
- Add request validation for production use
- Implement retry logic for API failures
- Add logging and monitoring for production

