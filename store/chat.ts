import { chatAPI } from '@/api';
import { create } from 'zustand';
import { useAuthStore } from './auth';

export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface ActiveThread {
  id: string;
  title: string;
  isInferred: boolean;
}

export interface InsightReminder {
  id: string;
  observation: string;
  domain?: string;
  dismissed: boolean;
}

interface ChatState {
  // State
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Thread context state
  activeThreads: ActiveThread[];
  inferredThreads: ActiveThread[];
  maxActiveThreads: number;
  
  // Soft reminder state
  currentReminder: InsightReminder | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  setError: (error: string | null) => void;
  
  // Thread context actions
  setActiveThreads: (threads: ActiveThread[]) => void;
  addThreadContext: (thread: ActiveThread) => boolean;
  removeThreadContext: (threadId: string) => void;
  setInferredThreads: (threads: ActiveThread[]) => void;
  acceptInferredThread: (threadId: string) => void;
  clearThreadContext: () => void;
  
  // Reminder actions
  showReminder: (reminder: InsightReminder) => void;
  dismissReminder: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  messages: [],
  conversationId: null,
  isLoading: false,
  isSending: false,
  error: null,
  
  // Thread context state
  activeThreads: [],
  inferredThreads: [],
  maxActiveThreads: 3,
  
  // Reminder state
  currentReminder: null,

  // Send a message
  sendMessage: async (content: string) => {
    try {
      set({ isSending: true, error: null });
      
      const authStore = useAuthStore.getState();
      const { sessionId, userId } = authStore;
      
      // Add user message optimistically
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        is_user: true,
        created_at: new Date().toISOString()
      };
      
      set(state => ({
        messages: [...state.messages, userMessage]
      }));
      
      // Get active thread IDs for context
      const activeThreadIds = get().activeThreads.map(t => t.id);
      
      // Send to API
      const response = await chatAPI.sendMessage({
        session_id: sessionId || undefined,
        user_id: userId || undefined,
        conversation_id: get().conversationId || undefined,
        message: content,
        thread_ids: activeThreadIds.length > 0 ? activeThreadIds : undefined
      });
      
      // Check if rate limited
      if (!response.success) {
        set({ 
          error: response.message,
          isSending: false 
        });
        return;
      }
      
      // Update conversation ID if new
      if (response.conversation_id && !get().conversationId) {
        set({ conversationId: response.conversation_id });
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        is_user: false,
        created_at: new Date().toISOString()
      };
      
      set(state => ({
        messages: [...state.messages, aiMessage],
        isSending: false
      }));
      
      // Handle inferred threads from response
      if (response.inferred_threads && response.inferred_threads.length > 0) {
        const inferredAsActive: ActiveThread[] = response.inferred_threads.map(t => ({
          id: t.id,
          title: t.title,
          isInferred: true
        }));
        get().setInferredThreads(inferredAsActive);
      }
      
      // Handle soft reminder from response
      if (response.reminder) {
        get().showReminder({
          id: response.reminder.insight_id,
          observation: response.reminder.observation,
          domain: response.reminder.domain,
          dismissed: false
        });
      }
      
      // Update usage status in auth store
      if (response.rate_limit) {
        authStore.updateUsageStatus({
          type: response.rate_limit.reason === 'anonymous_allowance' ? 'anonymous' : 'registered',
          messages_used: response.rate_limit.messages_used || 0,
          messages_limit: (response.rate_limit.messages_used || 0) + (response.rate_limit.messages_remaining || 0),
          messages_remaining: response.rate_limit.messages_remaining || 0
        });
      }
      
    } catch (error: any) {
      console.error('Send message error:', error);
      set({ 
        error: error.message || 'Failed to send message',
        isSending: false 
      });
    }
  },

  // Clear conversation (start new)
  clearConversation: () => {
    set({
      messages: [],
      conversationId: null,
      error: null,
      // Don't clear activeThreads - user may want to continue with same context
      inferredThreads: [],
      currentReminder: null
    });
  },

  // Load conversation messages
  loadConversation: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null, conversationId });
      
      const response = await chatAPI.fetchMessages(conversationId);
      
      if (response.success && response.messages) {
        set({ 
          isLoading: false,
          conversationId,
          messages: response.messages
        });
      } else {
        throw new Error(response.error || 'Failed to load messages');
      }
    } catch (error: any) {
      console.error('Load conversation error:', error);
      set({ 
        error: error.message || 'Failed to load conversation',
        isLoading: false,
        messages: []
      });
    }
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
  
  // Thread context actions
  setActiveThreads: (threads: ActiveThread[]) => {
    const maxThreads = get().maxActiveThreads;
    set({ activeThreads: threads.slice(0, maxThreads) });
  },
  
  addThreadContext: (thread: ActiveThread) => {
    const { activeThreads, maxActiveThreads } = get();
    
    // Check if already active
    if (activeThreads.some(t => t.id === thread.id)) {
      return false;
    }
    
    // Check if at max capacity
    if (activeThreads.length >= maxActiveThreads) {
      return false;
    }
    
    set({ activeThreads: [...activeThreads, thread] });
    return true;
  },
  
  removeThreadContext: (threadId: string) => {
    set(state => ({
      activeThreads: state.activeThreads.filter(t => t.id !== threadId)
    }));
  },
  
  setInferredThreads: (threads: ActiveThread[]) => {
    // Filter out any that are already active
    const activeIds = get().activeThreads.map(t => t.id);
    const filtered = threads.filter(t => !activeIds.includes(t.id));
    set({ inferredThreads: filtered });
  },
  
  acceptInferredThread: (threadId: string) => {
    const { inferredThreads, activeThreads, maxActiveThreads } = get();
    
    // Find the inferred thread
    const thread = inferredThreads.find(t => t.id === threadId);
    if (!thread) return;
    
    // Check capacity
    if (activeThreads.length >= maxActiveThreads) return;
    
    // Move from inferred to active
    set({
      activeThreads: [...activeThreads, { ...thread, isInferred: false }],
      inferredThreads: inferredThreads.filter(t => t.id !== threadId)
    });
  },
  
  clearThreadContext: () => {
    set({ activeThreads: [], inferredThreads: [] });
  },
  
  // Reminder actions
  showReminder: (reminder: InsightReminder) => {
    set({ currentReminder: reminder });
  },
  
  dismissReminder: () => {
    const current = get().currentReminder;
    if (current) {
      set({ currentReminder: { ...current, dismissed: true } });
    }
    // Clear after animation
    setTimeout(() => {
      set({ currentReminder: null });
    }, 300);
  }
}));

