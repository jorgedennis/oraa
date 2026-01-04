import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { InsightCard } from '@/components/insights/insight-card';
import { ThreadSuggestion } from '@/components/insights/thread-suggestion';
import { AcknowledgedInsight } from '@/components/insights/acknowledged-insight';
import { OraaColors, Radii } from '@/constants/theme';

// Mock data for pending insights
const PENDING_INSIGHTS = [
  {
    id: '1',
    observation: 'You tend to take on responsibility for fixing situations even when they\'re not yours to fix. This shows up especially in family dynamics.',
    domain: 'Relational',
  },
  {
    id: '2',
    observation: 'When you feel overwhelmed, your first instinct is to isolate rather than reach out. There might be a belief that needing support is a burden.',
    domain: 'Emotional',
  },
  {
    id: '3',
    observation: 'Your energy shifts noticeably when discussing creative work vs. administrative tasks. The former lights you up; the latter drains you.',
    domain: 'Performing',
  },
];

const THREAD_SUGGESTIONS = [
  {
    id: 't1',
    topic: 'Your relationship with your mom',
    description: 'This has come up in several conversations—boundaries, guilt, feeling responsible for her emotions. Want me to track this over time?',
    mentionCount: 6,
  },
  {
    id: 't2',
    topic: 'Career transition anxiety',
    description: 'You\'ve mentioned feeling stuck and questioning your path multiple times. A thread could help track what\'s shifting.',
    mentionCount: 4,
  },
];

// Mock data for acknowledged insights
const ACKNOWLEDGED_INSIGHTS = [
  {
    id: 'a1',
    observation: 'You process experiences internally before sharing them. There\'s a rich inner world here, sometimes at odds with what you show externally.',
    domain: 'Inner',
    response: 'yes' as const,
    date: 'Dec 28',
  },
  {
    id: 'a2',
    observation: 'Stress manifests physically before you consciously recognize it—tight chest, shallow breathing.',
    domain: 'Embodied',
    response: 'yes' as const,
    note: 'Yes, especially in my shoulders. I notice it after the fact usually.',
    date: 'Dec 27',
  },
  {
    id: 'a3',
    observation: 'You compare your behind-the-scenes to others\' highlight reels, especially at work.',
    domain: 'Performing',
    response: 'maybe' as const,
    note: 'Sometimes, but I think I\'m getting better at catching myself.',
    date: 'Dec 25',
  },
  {
    id: 'a4',
    observation: 'Anger is the hardest emotion for you to express directly.',
    domain: 'Emotional',
    response: 'no' as const,
    note: 'Actually I think it\'s sadness that\'s harder for me.',
    date: 'Dec 22',
  },
  {
    id: 'a5',
    observation: 'You feel responsible for other people\'s emotional states, especially family members.',
    domain: 'Relational',
    response: 'yes' as const,
    date: 'Dec 20',
  },
];

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showHistory, setShowHistory] = useState(false);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleInsightRespond = (id: string, response: 'yes' | 'maybe' | 'no', note?: string) => {
    console.log('Insight response:', { id, response, note });
  };
  
  const handleCreateThread = (id: string) => {
    console.log('Create thread:', id);
  };
  
  const handleDismissThread = (id: string) => {
    console.log('Dismiss thread:', id);
  };
  
  const totalPending = PENDING_INSIGHTS.length + THREAD_SUGGESTIONS.length;
  
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
        
        {/* New Insights Section */}
        {PENDING_INSIGHTS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ New Insights</Text>
            <View style={styles.cardList}>
              {PENDING_INSIGHTS.map((insight) => (
                <InsightCard
                  key={insight.id}
                  id={insight.id}
                  observation={insight.observation}
                  domain={insight.domain}
                  onRespond={handleInsightRespond}
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Thread Suggestions Section */}
        {THREAD_SUGGESTIONS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧵 Thread Suggestions</Text>
            <View style={styles.cardList}>
              {THREAD_SUGGESTIONS.map((suggestion) => (
                <ThreadSuggestion
                  key={suggestion.id}
                  id={suggestion.id}
                  topic={suggestion.topic}
                  description={suggestion.description}
                  mentionCount={suggestion.mentionCount}
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
        {ACKNOWLEDGED_INSIGHTS.length > 0 && (
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
                {ACKNOWLEDGED_INSIGHTS.map((insight) => (
                  <AcknowledgedInsight
                    key={insight.id}
                    observation={insight.observation}
                    domain={insight.domain}
                    response={insight.response}
                    note={insight.note}
                    date={insight.date}
                  />
                ))}
              </View>
            )}
            
            {!showHistory && (
              <Text style={styles.historyHint}>
                {ACKNOWLEDGED_INSIGHTS.length} insights reviewed • Tap to expand
              </Text>
            )}
          </View>
        )}
      </ScrollView>
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
});
