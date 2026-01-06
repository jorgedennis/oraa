import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { InsightCard } from '@/components/insights/insight-card';
import { ThreadSuggestion } from '@/components/insights/thread-suggestion';
import { AcknowledgedInsight } from '@/components/insights/acknowledged-insight';
import { useInsightsStore, useThreadsStore, StagedItem, InsightResponse } from '@/store';
import { OraaColors, Radii } from '@/constants/theme';

// Thread Insight Card Component (different from self insight card)
interface ThreadInsightCardProps {
  id: string;
  observation: string;
  threadTitle?: string;
  onRespond: (id: string, response: 'yes' | 'partially' | 'no', note?: string) => void;
}

function ThreadInsightCard({ id, observation, threadTitle, onRespond }: ThreadInsightCardProps) {
  const [note, setNote] = useState('');
  const [responded, setResponded] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<'yes' | 'partially' | 'no' | null>(null);
  
  const handleResponse = (response: 'yes' | 'partially' | 'no') => {
    setSelectedResponse(response);
    setResponded(true);
    onRespond(id, response, note.trim() || undefined);
  };
  
  if (responded) {
    return (
      <View style={[styles.threadInsightCard, styles.cardResponded]}>
        <View style={styles.respondedContent}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.respondedText}>Noted</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.threadInsightCard}>
      <View style={styles.threadInsightHeader}>
        <Text style={styles.threadInsightBadge}>🧵 Thread Insight</Text>
        {threadTitle && <Text style={styles.threadName}>{threadTitle}</Text>}
      </View>
      
      <Text style={styles.threadInsightObservation}>{observation}</Text>
      
      <Text style={styles.threadInsightQuestion}>Does this match your experience?</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonYes]}
          onPress={() => handleResponse('yes')}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.buttonTextYes]}>Yes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonMaybe]}
          onPress={() => handleResponse('partially')}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.buttonTextMaybe]}>Partially</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonNo]}
          onPress={() => handleResponse('no')}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.buttonTextNo]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showHistory, setShowHistory] = useState(false);
  
  const { 
    stagingQueue, 
    mapInsights, 
    isLoadingQueue, 
    fetchStagingQueue, 
    respondToInsight,
    fetchMapInsights 
  } = useInsightsStore();
  
  const { createThreadFromSuggestion, dismissSuggestion } = useThreadsStore();
  
  useEffect(() => {
    fetchStagingQueue();
    fetchMapInsights(); // For showing acknowledged insights
  }, []);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  // Separate items by type
  const selfInsights = stagingQueue.filter(item => item.item_type === 'self_insight');
  const threadInsights = stagingQueue.filter(item => item.item_type === 'thread_insight');
  const threadSuggestions = stagingQueue.filter(item => item.item_type === 'thread_suggestion');
  
  const handleInsightRespond = async (queueId: string, response: 'yes' | 'maybe' | 'no', note?: string) => {
    await respondToInsight(queueId, response as InsightResponse, note);
  };
  
  const handleThreadInsightRespond = async (queueId: string, response: 'yes' | 'partially' | 'no', note?: string) => {
    await respondToInsight(queueId, response as InsightResponse, note);
  };
  
  const handleCreateThread = async (suggestionQueueId: string) => {
    const suggestion = stagingQueue.find(s => s.queue_id === suggestionQueueId);
    if (suggestion && suggestion.item_type === 'thread_suggestion') {
      await createThreadFromSuggestion(suggestion.item_id);
      await respondToInsight(suggestionQueueId, 'yes');
    }
  };
  
  const handleDismissThread = async (suggestionQueueId: string) => {
    const suggestion = stagingQueue.find(s => s.queue_id === suggestionQueueId);
    if (suggestion && suggestion.item_type === 'thread_suggestion') {
      await dismissSuggestion(suggestion.item_id);
      await respondToInsight(suggestionQueueId, 'no');
    }
  };
  
  // Get all acknowledged insights for history section
  const acknowledgedInsights = mapInsights.flatMap(domain => 
    domain.insights.map(insight => ({
      ...insight,
      domain: domain.domain_name
    }))
  ).sort((a, b) => {
    const dateA = a.acknowledged_at ? new Date(a.acknowledged_at).getTime() : 0;
    const dateB = b.acknowledged_at ? new Date(b.acknowledged_at).getTime() : 0;
    return dateB - dateA;
  });
  
  const totalPending = stagingQueue.length;
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>{totalPending} pending</Text>
          </View>
        </View>
      </View>
      
      {isLoadingQueue ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Oraa surfaces observations from your conversations. Review them before they become part of your Map.
          </Text>
          
          {/* New Self Insights Section */}
          {selfInsights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ New Insights</Text>
              <View style={styles.cardList}>
                {selfInsights.map((item) => (
                  <InsightCard
                    key={item.queue_id}
                    id={item.queue_id}
                    observation={(item as any).observation || ''}
                    domain={(item as any).domain_id || 'Unknown'}
                    onRespond={handleInsightRespond}
                  />
                ))}
              </View>
            </View>
          )}
          
          {/* Thread Insights Section */}
          {threadInsights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Thread Observations</Text>
              <Text style={styles.sectionDescription}>
                Observations about others or dynamics—these stay in their threads.
              </Text>
              <View style={styles.cardList}>
                {threadInsights.map((item) => (
                  <ThreadInsightCard
                    key={item.queue_id}
                    id={item.queue_id}
                    observation={(item as any).observation || ''}
                    threadTitle={(item as any).thread_title}
                    onRespond={handleThreadInsightRespond}
                  />
                ))}
              </View>
            </View>
          )}
          
          {/* Thread Suggestions Section */}
          {threadSuggestions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧵 Thread Suggestions</Text>
              <View style={styles.cardList}>
                {threadSuggestions.map((item) => (
                  <ThreadSuggestion
                    key={item.queue_id}
                    id={item.queue_id}
                    topic={(item as any).topic || ''}
                    description={(item as any).description || ''}
                    mentionCount={(item as any).mention_count || 0}
                    onCreateThread={handleCreateThread}
                    onDismiss={handleDismissThread}
                  />
                ))}
              </View>
            </View>
          )}
          
          {totalPending === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>
                New insights will appear here as we talk.
              </Text>
            </View>
          )}
          
          {/* Previously Acknowledged Section */}
          {acknowledgedInsights.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => setShowHistory(!showHistory)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>📋 Previously Acknowledged</Text>
                <Text style={styles.expandIcon}>{showHistory ? '−' : '+'}</Text>
              </TouchableOpacity>
              
              {showHistory && (
                <View style={styles.historyList}>
                  {acknowledgedInsights.slice(0, 10).map((insight) => (
                    <AcknowledgedInsight
                      key={insight.id}
                      observation={insight.observation}
                      domain={insight.domain}
                      response={insight.user_response as 'yes' | 'maybe' | 'no' | undefined}
                      note={insight.user_note}
                      date={insight.acknowledged_at 
                        ? new Date(insight.acknowledged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : undefined
                      }
                    />
                  ))}
                </View>
              )}
              
              {!showHistory && (
                <Text style={styles.historyHint}>
                  {acknowledgedInsights.length} insights reviewed • Tap to expand
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: OraaColors.textSub,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: OraaColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 14,
  },
  sectionDescription: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: -10,
    marginBottom: 14,
  },
  expandIcon: {
    fontSize: 20,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
  cardList: {
    gap: 14,
  },
  historyList: {
    gap: 10,
  },
  historyHint: {
    fontSize: 13,
    color: OraaColors.textMuted,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: OraaColors.surfaceSubtle,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: OraaColors.textMuted,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
  // Thread Insight Card styles
  threadInsightCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    borderRadius: Radii.xl,
    padding: 16,
  },
  cardResponded: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.20)',
  },
  threadInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  threadInsightBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(147,112,219,0.9)',
  },
  threadName: {
    fontSize: 11,
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  threadInsightObservation: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.text,
    marginBottom: 16,
  },
  threadInsightQuestion: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonYes: {
    backgroundColor: 'rgba(74,222,128,0.10)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  buttonMaybe: {
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderColor: 'rgba(250,204,21,0.25)',
  },
  buttonNo: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextYes: {
    color: 'rgba(74,222,128,0.9)',
  },
  buttonTextMaybe: {
    color: 'rgba(250,204,21,0.9)',
  },
  buttonTextNo: {
    color: 'rgba(248,113,113,0.9)',
  },
  respondedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checkmark: {
    fontSize: 16,
    color: 'rgba(74,222,128,0.9)',
  },
  respondedText: {
    fontSize: 14,
    color: 'rgba(74,222,128,0.9)',
    fontWeight: '500',
  },
});
