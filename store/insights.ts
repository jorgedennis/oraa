import { create } from 'zustand';
import { insightsAPI } from '@/api';

// Types
export type InsightType = 'self' | 'thread';
export type InsightResponse = 'yes' | 'maybe' | 'no' | 'partially';
export type InsightStatus = 'pending' | 'staged' | 'acknowledged' | 'dismissed';
export type PromotionReason = 'slam_dunk' | 'within_session_repeat' | 'cross_session_recurrence';

// Insight Advice types
export type InsightAdviceSection = 
  | 'what_this_means' 
  | 'how_to_recognize_it' 
  | 'what_to_watch_out_for' 
  | 'relationship_effects' 
  | 'the_upside' 
  | 'practical_strategies';

export interface InsightAdviceSectionContent {
  section: InsightAdviceSection;
  content: string;
  display_order: number;
}

export interface InsightAdvice {
  template_id: string;
  sections: InsightAdviceSectionContent[];
}

// Human-friendly copy for promotion reasons
export const PROMOTION_REASON_COPY: Record<PromotionReason, string> = {
  slam_dunk: "This came through clearly in your recent conversation.",
  within_session_repeat: "This pattern showed up a few times in your conversation.",
  cross_session_recurrence: "This has come up across a few conversations recently."
};

// Copy for re-surfaced insights (user previously said "No")
export const RESURFACE_COPY = "This pattern keeps showing up. Worth another look?";

// Section display names
export const ADVICE_SECTION_TITLES: Record<InsightAdviceSection, string> = {
  what_this_means: "What this means",
  how_to_recognize_it: "How to recognize it",
  what_to_watch_out_for: "What to watch out for",
  relationship_effects: "How it affects relationships",
  the_upside: "The upside",
  practical_strategies: "Practical strategies"
};

export interface ThreadAssociation {
  thread_id: string;
  thread_title: string;
  detected_at: string;
}

export interface SelfInsight {
  id: string;
  observation: string;
  domain_id: string;
  category_id?: string;
  category_name?: string;
  subcategory?: string;
  user_response?: InsightResponse;
  user_note?: string;
  first_detected_at: string;
  detection_count: number;
  acknowledged_at?: string;
  thread_associations: ThreadAssociation[];
  // New template-based fields
  template_id?: string;
  is_novel?: boolean; // Optional - defaults to false if not provided
  detection_confidence?: number;
  promotion_reason?: PromotionReason;
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
  // New template-based fields
  template_id?: string;
  confidence?: number;
  promotion_reason?: PromotionReason;
  evidence_summary?: string;
  // Re-surface tracking (user previously said "No")
  is_resurface?: boolean;
  no_response_count?: number;
}

export interface StagedThreadInsight {
  queue_id: string;
  item_type: 'thread_insight';
  item_id: string;
  thread_id: string;
  thread_title?: string;
  created_at: string;
  observation: string;
  // New template-based fields
  template_id?: string;
  confidence?: number;
  promotion_reason?: PromotionReason;
  evidence_summary?: string;
  // Re-surface tracking (user previously said "No")
  is_resurface?: boolean;
  no_response_count?: number;
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
  // Advice cache
  adviceCache: Map<string, InsightAdvice>;
  isLoadingAdvice: boolean;
  // Currently selected insight for advice modal
  selectedInsightForAdvice: { templateId: string | null; isNovel: boolean } | null;
  
  // Actions
  fetchStagingQueue: () => Promise<void>;
  respondToInsight: (queueId: string, response: InsightResponse, note?: string) => Promise<void>;
  fetchMapInsights: () => Promise<void>;
  deleteInsight: (insightId: string) => Promise<void>;
  setError: (error: string | null) => void;
  // Advice actions
  fetchTemplateAdvice: (templateId: string) => Promise<InsightAdvice | null>;
  openAdviceModal: (templateId: string | null, isNovel: boolean) => void;
  closeAdviceModal: () => void;
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
    template_id: 'over-responsibility',
    confidence: 0.92,
    promotion_reason: 'slam_dunk',
    evidence_summary: 'You described stepping in to mediate your parents\' conflict even though it wasn\'t your role.',
  },
  {
    queue_id: 'q2',
    item_type: 'self_insight',
    item_id: 'staged-2',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    observation: 'When you feel overwhelmed, your first instinct is to isolate rather than reach out.',
    domain_id: 'behavioral',
    template_id: 'isolation-when-overwhelmed',
    confidence: 0.78,
    promotion_reason: 'within_session_repeat',
    evidence_summary: 'This showed up twice—when discussing work stress and family dynamics.',
  },
  {
    queue_id: 'q5',
    item_type: 'self_insight',
    item_id: 'staged-resurface-1',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    observation: 'You tend to minimize your own needs to keep the peace.',
    domain_id: 'relational',
    template_id: 'minimizing-needs',
    confidence: 0.72,
    evidence_summary: 'This has come up 3 more times since you last saw it.',
    is_resurface: true,
    no_response_count: 1,
  },
  {
    queue_id: 'q3',
    item_type: 'thread_insight',
    item_id: 'staged-ti-1',
    thread_id: 'thread-1',
    thread_title: 'Mom',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    observation: 'Mom tends to call when she\'s lonely, framing it as checking in on you.',
    confidence: 0.85,
    promotion_reason: 'cross_session_recurrence',
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
    domain_id: 'beliefs_assumptions',
    domain_name: 'Beliefs & Assumptions',
    domain_icon: '🧭',
    insights: [
      {
        id: 'i1',
        observation: 'You tend to anticipate others\' needs before they ask',
        domain_id: 'beliefs_assumptions',
        category_name: 'Self-Worth',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 5,
        acknowledged_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          { thread_id: 'thread-4', thread_title: 'Alex', detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'anticipating-needs',
        promotion_reason: 'cross_session_recurrence',
      },
      {
        id: 'i2',
        observation: 'Conflict avoidance has sometimes led to resentment building up',
        domain_id: 'beliefs_assumptions',
        category_name: 'Responsibility',
        user_response: 'maybe',
        user_note: 'Sometimes, but I think I\'m getting better at catching myself.',
        first_detected_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 3,
        acknowledged_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'conflict-avoidance-resentment',
        promotion_reason: 'within_session_repeat',
      },
    ],
  },
  {
    domain_id: 'emotional_processing',
    domain_name: 'Emotional Processing',
    domain_icon: '💙',
    insights: [
      {
        id: 'i3',
        observation: 'Guilt tends to follow situations where you prioritize your needs over others\' expectations',
        domain_id: 'emotional_processing',
        category_name: 'Awareness',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 4,
        acknowledged_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'self-prioritization-guilt',
        promotion_reason: 'slam_dunk',
      },
    ],
  },
  {
    domain_id: 'coping_strategies',
    domain_name: 'Coping Strategies',
    domain_icon: '🛡️',
    insights: [
      {
        id: 'i4',
        observation: 'You process big decisions by talking them through out loud, even when you\'ve already made up your mind',
        domain_id: 'coping_strategies',
        category_name: 'Reassurance & External Support',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 7,
        acknowledged_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-2', thread_title: 'Career identity', detected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: true, // Example of a novel insight
      },
    ],
  },
  {
    domain_id: 'relational_strategies',
    domain_name: 'Relational Strategies',
    domain_icon: '🤝',
    insights: [
      {
        id: 'i5',
        observation: 'You tend to smooth over tension instead of naming it directly',
        domain_id: 'relational_strategies',
        category_name: 'Conflict Navigation',
        subcategory: 'Smoothing',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 6,
        acknowledged_at: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'conflict-smooths-over-tension',
        promotion_reason: 'cross_session_recurrence',
      },
      {
        id: 'i6',
        observation: 'When conflict gets intense, you go quiet and withdraw',
        domain_id: 'relational_strategies',
        category_name: 'Conflict Navigation',
        subcategory: 'Withdrawal',
        user_response: 'no', // Example of a dismissed insight
        first_detected_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 4,
        acknowledged_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [],
        is_novel: false,
        template_id: 'conflict-shuts-down-withdraws',
      },
    ],
  },
  {
    domain_id: 'somatic_regulation',
    domain_name: 'Somatic Regulation',
    domain_icon: '🫀',
    insights: [
      {
        id: 'i7',
        observation: 'Guilt shows up as physical tension in your chest',
        domain_id: 'somatic_regulation',
        category_name: 'Tension',
        user_response: 'yes',
        user_note: 'Yes, especially in my shoulders. I notice it after the fact usually.',
        first_detected_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 3,
        acknowledged_at: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-1', thread_title: 'Mom', detected_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'guilt-chest-tension',
        promotion_reason: 'cross_session_recurrence',
      },
    ],
  },
  {
    domain_id: 'agency_follow_through',
    domain_name: 'Agency & Follow-Through',
    domain_icon: '⚡',
    insights: [
      {
        id: 'i8',
        observation: 'You tend to over-function in relationships when you sense the other person pulling away',
        domain_id: 'agency_follow_through',
        category_name: 'Initiation',
        user_response: 'yes',
        first_detected_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        detection_count: 3,
        acknowledged_at: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
        thread_associations: [
          { thread_id: 'thread-4', thread_title: 'Alex', detected_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        is_novel: false,
        template_id: 'over-functioning-withdrawal',
        promotion_reason: 'within_session_repeat',
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
  adviceCache: new Map(),
  isLoadingAdvice: false,
  selectedInsightForAdvice: null,
  
  // Fetch staging queue
  fetchStagingQueue: async () => {
    try {
      set({ isLoadingQueue: true, error: null });
      
      const response = await insightsAPI.fetchStagingQueue();
      
      if (response.success && response.items) {
        // Cast API response to store types
        set({ stagingQueue: response.items as unknown as StagedItem[], isLoadingQueue: false });
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
        // Cast API response to store types
        set({ mapInsights: response.domains as unknown as DomainWithInsights[], isLoadingMap: false });
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
  
  // Fetch template advice
  fetchTemplateAdvice: async (templateId: string) => {
    // Check cache first
    const cached = get().adviceCache.get(templateId);
    if (cached) {
      return cached;
    }
    
    try {
      set({ isLoadingAdvice: true });
      
      const response = await insightsAPI.fetchTemplateAdvice(templateId);
      
      if (response.success && response.advice) {
        // Cache the result
        const newCache = new Map(get().adviceCache);
        newCache.set(templateId, response.advice);
        set({ adviceCache: newCache, isLoadingAdvice: false });
        return response.advice;
      } else {
        throw new Error(response.error || 'Failed to fetch advice');
      }
    } catch (error: any) {
      console.error('Fetch template advice error:', error);
      set({ isLoadingAdvice: false });
      return null;
    }
  },
  
  // Open advice modal
  openAdviceModal: (templateId: string | null, isNovel: boolean) => {
    set({ selectedInsightForAdvice: { templateId, isNovel } });
  },
  
  // Close advice modal
  closeAdviceModal: () => {
    set({ selectedInsightForAdvice: null });
  },
}));

// Export domain configuration for use in components
export { DOMAINS };

