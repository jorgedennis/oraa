import { create } from 'zustand';
import { chatAPI } from '@/api';
import { useAuthStore } from './auth';

export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

interface ChatState {
  // State
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  messages: [],
  conversationId: null,
  isLoading: false,
  isSending: false,
  error: null,

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
      
      // Send to API
      const response = await chatAPI.sendMessage({
        session_id: sessionId || undefined,
        user_id: userId || undefined,
        conversation_id: get().conversationId || undefined,
        message: content
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
      error: null
    });
  },

  // Load conversation messages
  loadConversation: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null, conversationId });
      
      // TODO: Create n8n endpoint to fetch conversation messages
      // For now, just set the conversation ID and clear messages
      // When endpoint is ready, fetch messages here:
      // const response = await fetch(`/webhook/conversations/${conversationId}/messages`);
      // const data = await response.json();
      // set({ messages: data.messages });
      
      set({ 
        isLoading: false,
        conversationId,
        messages: [] // Clear messages until we load them
      });
    } catch (error: any) {
      console.error('Load conversation error:', error);
      set({ 
        error: error.message || 'Failed to load conversation',
        isLoading: false 
      });
    }
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  }
}));

