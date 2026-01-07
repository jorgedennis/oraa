export { useAuthStore } from './auth';
export { useChatStore } from './chat';
export { useConversationsStore } from './conversations';
export { useThreadsStore } from './threads';
export { useInsightsStore, DOMAINS, PROMOTION_REASON_COPY, ADVICE_SECTION_TITLES, RESURFACE_COPY } from './insights';

export type { Message, ActiveThread, InsightReminder } from './chat';
export type { Conversation } from './conversations';
export type { 
  Thread, 
  ThreadType, 
  ThreadStatus, 
  ThreadEntry, 
  ThreadInsight, 
  ThreadQuestion, 
  SelfInsightRef,
  ThreadSuggestion 
} from './threads';
export type { 
  SelfInsight, 
  DomainWithInsights, 
  StagedItem, 
  StagedSelfInsight, 
  StagedThreadInsight, 
  StagedThreadSuggestion,
  InsightType,
  InsightResponse,
  InsightStatus,
  ThreadAssociation,
  // New template-based types
  PromotionReason,
  InsightAdviceSection,
  InsightAdviceSectionContent,
  InsightAdvice
} from './insights';
