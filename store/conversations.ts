import { create } from 'zustand';
import { useAuthStore } from './auth';

export interface Conversation {
  id: string;
  started_at: string;
  ended_at?: string;
  message_count: number;
  preview?: string; // First message or AI summary
  thread_id?: string;
}

interface ConversationsState {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  currentConversationId: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string | null) => void;
  refreshConversations: () => Promise<void>;
}

// Generate dummy conversations for testing
const generateDummyConversations = (): Conversation[] => {
  const now = new Date();
  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      started_at: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 mins ago
      message_count: 8,
      preview: 'I\'ve been feeling really overwhelmed with work lately...'
    },
    {
      id: 'conv-2',
      started_at: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
      message_count: 12,
      preview: 'My relationship with my partner has been strained...'
    },
    {
      id: 'conv-3',
      started_at: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
      message_count: 6,
      preview: 'I can\'t stop thinking about my career transition...'
    },
    {
      id: 'conv-4',
      started_at: new Date(now.getTime() - 24 * 3600000).toISOString(), // 1 day ago
      message_count: 15,
      preview: 'I\'m struggling with anxiety about the future...'
    },
    {
      id: 'conv-5',
      started_at: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(), // 2 days ago
      message_count: 10,
      preview: 'I feel like I\'m falling behind everyone else...'
    },
    {
      id: 'conv-6',
      started_at: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(), // 3 days ago
      message_count: 7,
      preview: 'I\'ve been having trouble sleeping because of stress...'
    },
    {
      id: 'conv-7',
      started_at: new Date(now.getTime() - 4 * 24 * 3600000).toISOString(), // 4 days ago
      message_count: 9,
      preview: 'My family doesn\'t understand what I\'m going through...'
    },
    {
      id: 'conv-8',
      started_at: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(), // 5 days ago
      message_count: 11,
      preview: 'I\'m questioning if I made the right life choices...'
    },
    {
      id: 'conv-9',
      started_at: new Date(now.getTime() - 6 * 24 * 3600000).toISOString(), // 6 days ago
      message_count: 13,
      preview: 'I feel stuck and don\'t know how to move forward...'
    },
    {
      id: 'conv-10',
      started_at: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), // 7 days ago
      message_count: 5,
      preview: 'I\'m dealing with imposter syndrome at work...'
    },
    {
      id: 'conv-11',
      started_at: new Date(now.getTime() - 8 * 24 * 3600000).toISOString(), // 8 days ago
      message_count: 14,
      preview: 'I keep replaying conversations in my head...'
    },
    {
      id: 'conv-12',
      started_at: new Date(now.getTime() - 10 * 24 * 3600000).toISOString(), // 10 days ago
      message_count: 9,
      preview: 'I\'m trying to understand why I feel so empty...'
    }
  ];
  
  return conversations;
};

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: [],
  isLoading: false,
  error: null,
  currentConversationId: null,
  
  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const authStore = useAuthStore.getState();
      const { sessionId, userId } = authStore;
      
      // Call n8n endpoint to fetch conversations
      // TODO: Create this endpoint in n8n
      const response = await fetch('https://n8n.srv1244885.hstgr.cloud/webhook/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId || undefined,
          user_id: userId || undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({ 
          conversations: data.conversations || [],
          isLoading: false 
        });
      } else {
        throw new Error(data.error || 'Failed to fetch conversations');
      }
    } catch (error: any) {
      console.error('Fetch conversations error:', error);
      // Use dummy data for testing until endpoint is created
      const dummyConversations = generateDummyConversations();
      set({ 
        conversations: dummyConversations,
        isLoading: false,
        error: null
      });
    }
  },
  
  selectConversation: (id: string | null) => {
    set({ currentConversationId: id });
  },
  
  refreshConversations: async () => {
    await get().fetchConversations();
  }
}));

