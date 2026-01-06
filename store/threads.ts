import { create } from 'zustand';
import { threadsAPI } from '@/api';

// Types
export type ThreadType = 'people' | 'self' | 'situation';
export type ThreadStatus = 'active' | 'resolved' | 'paused' | 'archived';

export interface ThreadEntry {
  id: string;
  date: string;
  summary: string;
}

export interface ThreadInsight {
  id: string;
  observation: string;
  user_response?: 'yes' | 'partially' | 'no';
  user_note?: string;
}

export interface ThreadQuestion {
  id: string;
  question: string;
  is_answered: boolean;
}

export interface SelfInsightRef {
  id: string;
  observation: string;
  domain: string;
  detected_at: string;
}

export interface Thread {
  id: string;
  title: string;
  type: ThreadType;
  status: ThreadStatus;
  current_understanding?: string;
  mention_count: number;
  last_mentioned_at?: string;
  created_at: string;
  // Full context (loaded on detail view)
  timeline?: ThreadEntry[];
  your_patterns_here?: SelfInsightRef[];
  working_understanding?: ThreadInsight[];
  still_curious_about?: ThreadQuestion[];
}

export interface ThreadSuggestion {
  id: string;
  topic: string;
  description: string;
  mention_count: number;
}

interface ThreadsState {
  // State
  threads: Thread[];
  currentThread: Thread | null;
  suggestions: ThreadSuggestion[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  
  // Actions
  fetchThreads: () => Promise<void>;
  fetchThread: (id: string) => Promise<void>;
  createThread: (title: string, type: ThreadType, initialUnderstanding?: string) => Promise<Thread | null>;
  createThreadFromSuggestion: (suggestionId: string, type?: ThreadType) => Promise<Thread | null>;
  updateThread: (id: string, updates: Partial<Thread>) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  archiveThread: (id: string) => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  dismissSuggestion: (id: string) => Promise<void>;
  clearCurrentThread: () => void;
  setError: (error: string | null) => void;
}

// Generate dummy threads for testing
const generateDummyThreads = (): Thread[] => [
  {
    id: 'thread-1',
    title: 'Mom',
    type: 'people',
    status: 'active',
    current_understanding: "You're working on setting boundaries without feeling guilty. The hardest part is when she calls upset—you feel responsible for her emotions.",
    mention_count: 12,
    last_mentioned_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-2',
    title: 'Career identity',
    type: 'self',
    status: 'active',
    current_understanding: 'Questioning whether to stay in your current role or take the leap. Fear of regret vs. fear of failure.',
    mention_count: 8,
    last_mentioned_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-3',
    title: 'Body image',
    type: 'self',
    status: 'active',
    current_understanding: "Noticing the connection between stress and how you feel about your body. It's not really about the body.",
    mention_count: 5,
    last_mentioned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-4',
    title: 'Alex',
    type: 'people',
    status: 'active',
    current_understanding: 'Feeling like the friendship has become one-sided. Unsure whether to address it or let it fade.',
    mention_count: 4,
    last_mentioned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'thread-5',
    title: 'The move to Austin',
    type: 'situation',
    status: 'active',
    current_understanding: 'Big transition coming up. Excitement mixed with anxiety about leaving familiar support systems.',
    mention_count: 3,
    last_mentioned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const generateDummyThreadDetail = (threadId: string): Thread | null => {
  const threads = generateDummyThreads();
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return null;
  
  // Add full context data
  return {
    ...thread,
    timeline: [
      { id: 'e1', date: 'Dec 28', summary: 'Talked about the Christmas visit and how drained you felt afterward. Noticed the pattern of over-explaining your choices.' },
      { id: 'e2', date: 'Dec 22', summary: 'Discussed the phone call where she criticized your job. You stayed calm but felt the familiar guilt spiral after.' },
      { id: 'e3', date: 'Dec 18', summary: 'Explored why her approval still matters so much. Childhood patterns of being the "responsible one" came up.' },
      { id: 'e4', date: 'Dec 15', summary: 'First mentioned feeling obligated to fix her loneliness. Thread created.' },
    ],
    your_patterns_here: [
      { id: 'si1', observation: 'You tend to take on responsibility for fixing situations even when they\'re not yours to fix', domain: 'relational', detected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'si2', observation: 'Guilt shows up as physical tension in your chest', domain: 'somatic', detected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    working_understanding: [
      { id: 'ti1', observation: 'Mom tends to call when she\'s lonely, framing it as checking in on you', user_response: 'yes' },
      { id: 'ti2', observation: 'She responds to boundaries with guilt trips rather than direct pushback' },
    ],
    still_curious_about: [
      { id: 'q1', question: 'What did boundaries look like in your family growing up?', is_answered: false },
      { id: 'q2', question: 'When do you feel least guilty—what\'s different in those moments?', is_answered: false },
    ],
  };
};

const generateDummySuggestions = (): ThreadSuggestion[] => [
  {
    id: 'sug-1',
    topic: 'Work people',
    description: 'Your colleagues have come up several times—dynamics with your manager, collaboration challenges. Want me to track this?',
    mention_count: 5,
  },
  {
    id: 'sug-2',
    topic: 'Sunday anxiety',
    description: 'The "Sunday scaries" pattern keeps appearing. There might be something here worth exploring over time.',
    mention_count: 4,
  },
];

export const useThreadsStore = create<ThreadsState>((set, get) => ({
  // Initial State
  threads: [],
  currentThread: null,
  suggestions: [],
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  
  // Fetch all threads
  fetchThreads: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await threadsAPI.fetchThreads();
      
      if (response.success && response.threads) {
        set({ threads: response.threads, isLoading: false });
      } else {
        throw new Error(response.error || 'Failed to fetch threads');
      }
    } catch (error: any) {
      console.error('Fetch threads error:', error);
      // Use dummy data for testing
      set({ 
        threads: generateDummyThreads(),
        isLoading: false,
        error: null 
      });
    }
  },
  
  // Fetch single thread with full context
  fetchThread: async (id: string) => {
    try {
      set({ isLoadingDetail: true, error: null });
      
      const response = await threadsAPI.fetchThread(id);
      
      if (response.success && response.thread) {
        set({ currentThread: response.thread, isLoadingDetail: false });
      } else {
        throw new Error(response.error || 'Failed to fetch thread');
      }
    } catch (error: any) {
      console.error('Fetch thread error:', error);
      // Use dummy data for testing
      const dummyThread = generateDummyThreadDetail(id);
      set({ 
        currentThread: dummyThread,
        isLoadingDetail: false,
        error: null 
      });
    }
  },
  
  // Create new thread manually
  createThread: async (title: string, type: ThreadType, initialUnderstanding?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await threadsAPI.createThread({ title, type, initialUnderstanding });
      
      if (response.success && response.thread) {
        set(state => ({
          threads: [response.thread!, ...state.threads],
          isLoading: false
        }));
        return response.thread;
      } else {
        throw new Error(response.error || 'Failed to create thread');
      }
    } catch (error: any) {
      console.error('Create thread error:', error);
      // Create dummy thread for testing
      const newThread: Thread = {
        id: `thread-${Date.now()}`,
        title,
        type,
        status: 'active',
        current_understanding: initialUnderstanding,
        mention_count: 0,
        created_at: new Date().toISOString(),
      };
      set(state => ({
        threads: [newThread, ...state.threads],
        isLoading: false,
        error: null
      }));
      return newThread;
    }
  },
  
  // Create thread from suggestion
  createThreadFromSuggestion: async (suggestionId: string, type?: ThreadType) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await threadsAPI.createThreadFromSuggestion(suggestionId, type);
      
      if (response.success && response.thread) {
        set(state => ({
          threads: [response.thread!, ...state.threads],
          suggestions: state.suggestions.filter(s => s.id !== suggestionId),
          isLoading: false
        }));
        return response.thread;
      } else {
        throw new Error(response.error || 'Failed to create thread');
      }
    } catch (error: any) {
      console.error('Create thread from suggestion error:', error);
      // Handle with dummy data
      const suggestion = get().suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        const newThread: Thread = {
          id: `thread-${Date.now()}`,
          title: suggestion.topic,
          type: type || 'people',
          status: 'active',
          current_understanding: suggestion.description,
          mention_count: suggestion.mention_count,
          created_at: new Date().toISOString(),
        };
        set(state => ({
          threads: [newThread, ...state.threads],
          suggestions: state.suggestions.filter(s => s.id !== suggestionId),
          isLoading: false,
          error: null
        }));
        return newThread;
      }
      set({ isLoading: false });
      return null;
    }
  },
  
  // Update thread
  updateThread: async (id: string, updates: Partial<Thread>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await threadsAPI.updateThread(id, updates);
      
      if (response.success) {
        set(state => ({
          threads: state.threads.map(t => t.id === id ? { ...t, ...updates } : t),
          currentThread: state.currentThread?.id === id 
            ? { ...state.currentThread, ...updates } 
            : state.currentThread,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || 'Failed to update thread');
      }
    } catch (error: any) {
      console.error('Update thread error:', error);
      // Update locally anyway
      set(state => ({
        threads: state.threads.map(t => t.id === id ? { ...t, ...updates } : t),
        currentThread: state.currentThread?.id === id 
          ? { ...state.currentThread, ...updates } 
          : state.currentThread,
        isLoading: false,
        error: null
      }));
    }
  },
  
  // Delete thread
  deleteThread: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await threadsAPI.deleteThread(id);
      
      if (response.success) {
        set(state => ({
          threads: state.threads.filter(t => t.id !== id),
          currentThread: state.currentThread?.id === id ? null : state.currentThread,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || 'Failed to delete thread');
      }
    } catch (error: any) {
      console.error('Delete thread error:', error);
      // Delete locally anyway
      set(state => ({
        threads: state.threads.filter(t => t.id !== id),
        currentThread: state.currentThread?.id === id ? null : state.currentThread,
        isLoading: false,
        error: null
      }));
    }
  },
  
  // Archive thread
  archiveThread: async (id: string) => {
    await get().updateThread(id, { status: 'archived' });
  },
  
  // Fetch thread suggestions
  fetchSuggestions: async () => {
    try {
      const response = await threadsAPI.fetchSuggestions();
      
      if (response.success && response.suggestions) {
        set({ suggestions: response.suggestions });
      } else {
        throw new Error(response.error || 'Failed to fetch suggestions');
      }
    } catch (error: any) {
      console.error('Fetch suggestions error:', error);
      // Use dummy data
      set({ suggestions: generateDummySuggestions() });
    }
  },
  
  // Dismiss thread suggestion
  dismissSuggestion: async (id: string) => {
    try {
      const response = await threadsAPI.dismissSuggestion(id);
      
      if (response.success) {
        set(state => ({
          suggestions: state.suggestions.filter(s => s.id !== id)
        }));
      }
    } catch (error: any) {
      console.error('Dismiss suggestion error:', error);
      set(state => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
      }));
    }
  },
  
  // Clear current thread
  clearCurrentThread: () => {
    set({ currentThread: null });
  },
  
  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

