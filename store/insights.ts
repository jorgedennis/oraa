import { create } from 'zustand';
import { insightsAPI } from '@/api';

// Types
export type InsightType = 'self' | 'thread';
export type InsightResponse = 'yes' | 'maybe' | 'no' | 'partially';
export type InsightStatus = 'pending' | 'staged' | 'acknowledged' | 'dismissed';

export interface ThreadAssociation {
  thread_id: string;
  thread_title: string;
  detected_at: string;
}

export interface SelfInsight {
  id: string;
  observation: string;
  domain_id: string;
  user_response?: InsightResponse;
  user_note?: string;
  first_detected_at: string;
  detection_count: number;
  acknowledged_at?: string;
  thread_associations: ThreadAssociation[];
}

export interface DomainWithInsights {
  domain_id: string;
  domain_name: string;
  domain_icon: string;
  insights: SelfInsight[];
}

// Staging queue types
export type StagingItemType = 'self_insight' | 'thread_insight' | 'thread_suggestion';

export interface StagedSelfInsight {
  queue_id: string;
  item_type: 'self_insight';
  item_id: string;
  thread_id?: string;
  created_at: string;
  observation: string;
  domain_id: string;
}

export interface StagedThreadInsight {
  queue_id: string;
  item_type: 'thread_insight';
  item_id: string;
  thread_id: string;
  thread_title?: string;
  created_at: string;
  observation: string;
}

export interface StagedThreadSuggestion {
  queue_id: string;
  item_type: 'thread_suggestion';
  item_id: string;
  created_at: string;
  topic: string;
  description: string;
  mention_count: number;
}

export type StagedItem = StagedSelfInsight | StagedThreadInsight | StagedThreadSuggestion;

interface InsightsState {
  // State
  stagingQueue: StagedItem[];
  mapInsights: DomainWithInsights[];
  isLoadingQueue: boolean;
  isLoadingMap: boolean;
  error: string | null;
  
  // Actions
  fetchStagingQueue: () => Promise<void>;
  respondToInsight: (queueId: string, response: InsightResponse, note?: string) => Promise<void>;
  fetchMapInsights: () => Promise<void>;
  deleteInsight: (insightId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

// Domain configuration (matches database)
const DOMAINS = [
  { id: 'relational', name: 'Relational', icon: '🤝' },
  { id: 'emotional', name: 'Emotional', icon: '💙' },
  { id: 'cognitive', name: 'Cognitive', icon: '🧠' },
  { id: 'somatic', name: 'Somatic', icon: '🫀' },
  { id: 'behavioral', name: 'Behavioral', icon: '⚡' },
];

// Generate dummy staging queue for testing
const generateDummyStagingQueue = (): StagedItem[] => [
  {
    queue_id: 'q1',
    item_type: 'self_insight',
    item_id: 'staged-1',
    thread_id: 'thread-1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    observation: 'You tend to take on responsibility for fixing situations even when they\'re not yours to fix.',
    domain_id: 'relational',
  },
  {
    queue_id: 'q2',
    item_type: 'self_insight',
    item_id: 'staged-2',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    observation: 'When you feel overwhelmed, your first instinct is to isolate rather than reach out.',
    domain_id: 'behavioral',
  },
  {
    queue_id: 'q3',
    item_type: 'thread_insight',
    item_id: 'staged-ti-1',
    thread_id: 'thread-1',
    thread_title: 'Mom',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    observation: 'Mom tends to call when she\'s lonely, framing it as checking in on you.',
  },
  {
    queue_id: 'q4',
    item_type: 'thread_suggestion',
    item_id: 'sug-1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    topic: 'Work people',
    description: 'Your colleagues have come up several times—dynamics with your manager, collaboration challenges. Want me to track this?',
    mention_count: 5,
  },
];

// Generate dummy Map insights for testing
const generateDummyMapInsights = (): DomainWithInsights[] => [
  {
    domain_id: 'relational',
    domain_name: 'Relational',
    domain_icon: '🤝',
    insights: [
      {
        id: 'i1',
        observation: 'You tend to anticipate others\' needs before they ask',
        domain_id: 'relational',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 5,
        acknowledged_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          { thread_id: 'thread-4', thread_title: 'Alex', detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        id: 'i2',
        observation: 'Conflict avoidance has sometimes led to resentment building up',
        domain_id: 'relational',
        user_response: 'maybe',
        user_note: 'Sometimes, but I think I\'m getting better at catching myself.',
        first_detected_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 3,
        acknowledged_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },
  {
    domain_id: 'emotional',
    domain_name: 'Emotional',
    domain_icon: '💙',
    insights: [
      {
        id: 'i3',
        observation: 'Guilt tends to follow situations where you prioritize your needs over others\' expectations',
        domain_id: 'emotional',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 4,
        acknowledged_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },
  {
    domain_id: 'cognitive',
    domain_name: 'Cognitive',
    domain_icon: '🧠',
    insights: [
      {
        id: 'i4',
        observation: 'You process big decisions by talking them through out loud, even when you\'ve already made up your mind',
        domain_id: 'cognitive',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 7,
        acknowledged_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-2', thread_title: 'Career identity', detected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },
  {
    domain_id: 'somatic',
    domain_name: 'Somatic',
    domain_icon: '🫀',
    insights: [
      {
        id: 'i5',
        observation: 'Guilt shows up as physical tension in your chest',
        domain_id: 'somatic',
        user_response: 'yes',
        user_note: 'Yes, especially in my shoulders. I notice it after the fact usually.',
        first_detected_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 6,
        acknowledged_at: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        id: 'i6',
        observation: 'Stress manifests physically before you consciously recognize it—tight chest, shallow breathing',
        domain_id: 'somatic',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 4,
        acknowledged_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [],
      },
    ],
  },
  {
    domain_id: 'behavioral',
    domain_name: 'Behavioral',
    domain_icon: '⚡',
    insights: [
      {
        id: 'i7',
        observation: 'You tend to over-function in relationships when you sense the other person pulling away',
        domain_id: 'behavioral',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 3,
        acknowledged_at: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-4', thread_title: 'Alex', detected_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },
];

export const useInsightsStore = create<InsightsState>((set, get) => ({
  // Initial State
  stagingQueue: [],
  mapInsights: [],
  isLoadingQueue: false,
  isLoadingMap: false,
  error: null,
  
  // Fetch staging queue
  fetchStagingQueue: async () => {
    try {
      set({ isLoadingQueue: true, error: null });
      
      const response = await insightsAPI.fetchStagingQueue();
      
      if (response.success && response.items) {
        set({ stagingQueue: response.items, isLoadingQueue: false });
      } else {
        throw new Error(response.error || 'Failed to fetch staging queue');
      }
    } catch (error: any) {
      console.error('Fetch staging queue error:', error);
      // Use dummy data for testing
      set({ 
        stagingQueue: generateDummyStagingQueue(),
        isLoadingQueue: false,
        error: null 
      });
    }
  },
  
  // Respond to a staged insight
  respondToInsight: async (queueId: string, response: InsightResponse, note?: string) => {
    try {
      set({ error: null });
      
      const apiResponse = await insightsAPI.respondToInsight(queueId, response, note);
      
      if (apiResponse.success) {
        // Remove from staging queue
        set(state => ({
          stagingQueue: state.stagingQueue.filter(item => item.queue_id !== queueId)
        }));
        
        // Refresh map insights if it was a self insight
        const item = get().stagingQueue.find(i => i.queue_id === queueId);
        if (item?.item_type === 'self_insight') {
          get().fetchMapInsights();
        }
      } else {
        throw new Error(apiResponse.error || 'Failed to respond to insight');
      }
    } catch (error: any) {
      console.error('Respond to insight error:', error);
      // Remove from queue anyway for testing
      set(state => ({
        stagingQueue: state.stagingQueue.filter(item => item.queue_id !== queueId),
        error: null
      }));
    }
  },
  
  // Fetch Map insights (by domain)
  fetchMapInsights: async () => {
    try {
      set({ isLoadingMap: true, error: null });
      
      const response = await insightsAPI.fetchMapInsights();
      
      if (response.success && response.domains) {
        set({ mapInsights: response.domains, isLoadingMap: false });
      } else {
        throw new Error(response.error || 'Failed to fetch map insights');
      }
    } catch (error: any) {
      console.error('Fetch map insights error:', error);
      // Use dummy data for testing
      set({ 
        mapInsights: generateDummyMapInsights(),
        isLoadingMap: false,
        error: null 
      });
    }
  },
  
  // Delete an insight from the Map
  deleteInsight: async (insightId: string) => {
    try {
      set({ error: null });
      
      const response = await insightsAPI.deleteInsight(insightId);
      
      if (response.success) {
        // Remove from map insights
        set(state => ({
          mapInsights: state.mapInsights.map(domain => ({
            ...domain,
            insights: domain.insights.filter(i => i.id !== insightId)
          }))
        }));
      } else {
        throw new Error(response.error || 'Failed to delete insight');
      }
    } catch (error: any) {
      console.error('Delete insight error:', error);
      // Remove locally anyway
      set(state => ({
        mapInsights: state.mapInsights.map(domain => ({
          ...domain,
          insights: domain.insights.filter(i => i.id !== insightId)
        })),
        error: null
      }));
    }
  },
  
  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Export domain configuration for use in components
export { DOMAINS };

