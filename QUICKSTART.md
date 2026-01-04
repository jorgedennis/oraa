# 🚀 Quick Start - Testing Your Connected App

## Prerequisites
- ✅ n8n workflows deployed and active
- ✅ Supabase database with all tables
- ✅ OpenAI API key configured in n8n
- ✅ Node.js and Expo CLI installed

## Start the App

```bash
cd /Users/jvrgasi/Desktop/oraa

# Install dependencies (if not already done)
npm install

# Start Expo dev server
npm start
```

## Testing Checklist

### ✅ 1. Anonymous User Flow
- [ ] App launches successfully
- [ ] Landing page animation plays
- [ ] Tap "Continue anonymously"
- [ ] Chat screen loads
- [ ] Send a message: "Hello"
- [ ] AI responds (may take 3-5 seconds)
- [ ] Check Settings → Shows "Anonymous" and "0/10" messages

### ✅ 2. Signup Flow
- [ ] From Settings, tap "Create account"
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `password123`
- [ ] Tap "Create Account"
- [ ] Success alert appears
- [ ] Settings shows email and "Registered" type
- [ ] Message limit updated to "0/40"

### ✅ 3. Logout/Login Flow
- [ ] From Settings, tap "Logout"
- [ ] Confirm logout
- [ ] Returns to anonymous session
- [ ] Go to Settings → Tap "Login"
- [ ] Enter same credentials
- [ ] Logged back in successfully
- [ ] Previous message count restored

### ✅ 4. Rate Limiting
Anonymous (10 messages):
- [ ] Send 10 user messages
- [ ] Try to send 11th message
- [ ] Error: "Anonymous users limited to 10 messages"

Registered (40/day):
- [ ] Login as registered user
- [ ] Send messages (counter increments)
- [ ] Limit enforced at 40 messages

### ✅ 5. Conversation Persistence
- [ ] Send several messages
- [ ] Close app completely
- [ ] Reopen app
- [ ] Chat screen shows previous messages
- [ ] Can continue conversation

## Quick Debugging

### App won't start?
```bash
# Clear cache and restart
npx expo start -c
```

### Can't create session?
```bash
# Test n8n auth webhook directly
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/auth \
  -H "Content-Type: application/json" \
  -d '{"action": "get_session", "device_id": "test-123"}'

# Should return: {"success": true, "session_id": "..."}
```

### Messages not sending?
```bash
# Test n8n chat webhook
curl -X POST https://n8n.srv1244885.hstgr.cloud/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "YOUR_SESSION_ID", "message": "test"}'
```

### Check n8n executions
1. Go to: https://n8n.srv1244885.hstgr.cloud
2. Click "Executions" tab
3. View recent workflow runs
4. Check for errors

### Check Supabase data
1. Go to: https://ybpsseqzzhttnbpiqaws.supabase.co
2. Navigate to "Table Editor"
3. Check tables:
   - `sessions` - Should have your anonymous session
   - `users` - Should have registered users
   - `conversations` - Should have conversation records
   - `messages` - Should have all messages

## App Structure Reference

```
oraa/
├── api/
│   └── index.ts          # API functions for n8n webhooks
├── store/
│   ├── auth.ts           # Auth state management
│   ├── chat.ts           # Chat state management
│   └── index.ts          # Store exports
├── app/
│   ├── _layout.tsx       # Root layout (initializes auth)
│   ├── index.tsx         # Landing page
│   ├── modal.tsx         # Login/Signup modal
│   └── (drawer)/
│       ├── chat.tsx      # Main chat screen
│       └── settings.tsx  # Settings screen
└── components/
    └── screens/
        ├── landing-screen.tsx
        ├── chat-screen.tsx
        └── settings-screen.tsx
```

## State Flow

### Auth Store State
```typescript
{
  isAuthenticated: boolean,    // True if user has session
  isAnonymous: boolean,         // True if using anonymous session
  deviceId: string,             // Unique device identifier
  sessionId: string | null,     // Anonymous session ID
  userId: string | null,        // Registered user ID
  email: string | null,         // User email (if registered)
  jwt: string | null,           // Auth token (if registered)
  usageStatus: {
    type: 'anonymous' | 'registered',
    messages_used: number,
    messages_limit: number,
    messages_remaining: number
  }
}
```

### Chat Store State
```typescript
{
  messages: Message[],          // Array of chat messages
  conversationId: string | null, // Current conversation ID
  isSending: boolean,           // True while sending message
  error: string | null          // Error message if any
}
```

## Using the Stores in Components

```typescript
import { useAuthStore, useChatStore } from '@/store';

// In a component
function MyComponent() {
  // Get specific state
  const isAnonymous = useAuthStore(state => state.isAnonymous);
  const messages = useChatStore(state => state.messages);
  
  // Get actions
  const { signup, login, logout } = useAuthStore();
  const { sendMessage } = useChatStore();
  
  // Use them
  const handleLogin = async () => {
    await login(email, password);
  };
  
  const handleSend = async (text: string) => {
    await sendMessage(text);
  };
  
  return (
    <View>
      {/* Your UI */}
    </View>
  );
}
```

## Pro Tips

1. **Use React Native Debugger** - Great for inspecting Zustand store state
2. **Check AsyncStorage** - Use Flipper or React Native Debugger to see persisted data
3. **Monitor n8n executions** - Watch workflows run in real-time
4. **Check Supabase logs** - See database operations in Supabase dashboard
5. **Test on real device** - Some things work differently than in simulator

## Next Features to Build

Once everything is working, consider:
- [ ] Insights generation workflow
- [ ] Journal entry workflow
- [ ] Thread detection workflow
- [ ] Map/domains visualization
- [ ] Export data functionality
- [ ] Push notifications
- [ ] Offline message queue

---

Need help? Check:
- `/CONNECTED.md` - Full integration guide
- `/N8N_WORKFLOWS.md` - Workflow documentation
- `/supabase/migrations/` - Database schema

**You're all set! 🎉**

