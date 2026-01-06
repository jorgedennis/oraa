import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThreadTimeline, TimelineEntry } from '@/components/threads/thread-timeline';
import { useThreadsStore, useChatStore } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Thread type icons
const TYPE_ICONS: Record<string, string> = {
  people: '👤',
  self: '🌀',
  situation: '📍',
};

interface ThreadDetailScreenProps {
  threadId?: string;
}

export function ThreadDetailScreen({ threadId }: ThreadDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { currentThread, isLoadingDetail, fetchThread, deleteThread, archiveThread, clearCurrentThread } = useThreadsStore();
  const { addThreadContext, clearConversation } = useChatStore();
  
  useEffect(() => {
    if (threadId) {
      fetchThread(threadId);
    }
    return () => {
      clearCurrentThread();
    };
  }, [threadId]);
  
  const goBack = () => {
    router.back();
  };
  
  const handleStartConversation = () => {
    if (currentThread) {
      // Clear existing conversation and set thread context
      clearConversation();
      addThreadContext({
        id: currentThread.id,
        title: currentThread.title,
        isInferred: false
      });
      router.push('/(drawer)/chat');
    }
  };
  
  const handleArchive = () => {
    Alert.alert(
      'Archive Thread',
      'This thread will be hidden from your main list. You can unarchive it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          onPress: async () => {
            if (threadId) {
              await archiveThread(threadId);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Thread',
      'This will permanently delete this thread and all its entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (threadId) {
              await deleteThread(threadId);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  if (isLoadingDetail) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Threads</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading thread...</Text>
        </View>
      </View>
    );
  }
  
  if (!currentThread) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Threads</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Thread not found</Text>
        </View>
      </View>
    );
  }
  
  const typeIcon = TYPE_ICONS[currentThread.type] || '🧵';
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Threads</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton} onPress={handleArchive} activeOpacity={0.7}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and meta */}
        <View style={styles.titleSection}>
          <Text style={styles.threadIcon}>{typeIcon}</Text>
          <Text style={styles.title}>{currentThread.title}</Text>
          <Text style={styles.typeBadge}>{currentThread.type.toUpperCase()}</Text>
          <Text style={styles.mentionCount}>
            {currentThread.mention_count} {currentThread.mention_count === 1 ? 'conversation' : 'conversations'}
          </Text>
        </View>
        
        {/* Current Understanding */}
        {currentThread.current_understanding && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Understanding</Text>
            <View style={styles.understandingCard}>
              <Text style={styles.understanding}>{currentThread.current_understanding}</Text>
            </View>
          </View>
        )}
        
        {/* Timeline */}
        {currentThread.timeline && currentThread.timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <ThreadTimeline entries={currentThread.timeline as TimelineEntry[]} />
          </View>
        )}
        
        {/* Your Patterns Here (Self Insights) */}
        {currentThread.your_patterns_here && currentThread.your_patterns_here.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Patterns Here</Text>
            <View style={styles.patternsList}>
              {currentThread.your_patterns_here.map((insight) => (
                <View key={insight.id} style={styles.patternItem}>
                  <Text style={styles.patternBullet}>•</Text>
                  <View style={styles.patternContent}>
                    <Text style={styles.patternText}>{insight.observation}</Text>
                    <Text style={styles.patternDomain}>{insight.domain}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Working Understanding (Thread Insights) */}
        {currentThread.working_understanding && currentThread.working_understanding.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Understanding</Text>
            <Text style={styles.sectionSubtitle}>Observations about this dynamic</Text>
            <View style={styles.insightsList}>
              {currentThread.working_understanding.map((insight) => (
                <View key={insight.id} style={styles.threadInsightItem}>
                  <Text style={styles.threadInsightText}>{insight.observation}</Text>
                  {insight.user_response && (
                    <View style={[
                      styles.responseBadge,
                      insight.user_response === 'yes' && styles.responseBadgeYes,
                      insight.user_response === 'partially' && styles.responseBadgeMaybe,
                      insight.user_response === 'no' && styles.responseBadgeNo,
                    ]}>
                      <Text style={[
                        styles.responseBadgeText,
                        insight.user_response === 'yes' && styles.responseBadgeTextYes,
                        insight.user_response === 'partially' && styles.responseBadgeTextMaybe,
                        insight.user_response === 'no' && styles.responseBadgeTextNo,
                      ]}>
                        {insight.user_response === 'yes' ? '✓ Confirmed' : 
                         insight.user_response === 'partially' ? '~ Partially' : '✗ Disagreed'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Open Questions */}
        {currentThread.still_curious_about && currentThread.still_curious_about.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Still Curious About</Text>
            <View style={styles.questionsList}>
              {currentThread.still_curious_about.filter(q => !q.is_answered).map((question) => (
                <View key={question.id} style={styles.questionItem}>
                  <Text style={styles.questionIcon}>?</Text>
                  <Text style={styles.questionText}>{question.question}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={styles.dangerButtonText}>Delete Thread</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Start Conversation Button */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartConversation}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Continue this conversation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backIcon: {
    fontSize: 28,
    color: OraaColors.blue,
    fontWeight: '300',
    marginTop: -2,
  },
  backText: {
    fontSize: 16,
    color: OraaColors.blue,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: OraaColors.textMuted,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  threadIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: OraaColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: OraaColors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mentionCount: {
    fontSize: 13,
    color: OraaColors.textMuted,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: -8,
    marginBottom: 12,
  },
  understandingCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    borderRadius: Radii.xl,
    padding: 16,
    ...Shadows.soft,
  },
  understanding: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.text,
  },
  patternsList: {
    gap: 12,
  },
  patternItem: {
    flexDirection: 'row',
    gap: 10,
  },
  patternBullet: {
    fontSize: 14,
    color: 'rgba(147,112,219,0.8)',
    marginTop: 2,
  },
  patternContent: {
    flex: 1,
  },
  patternText: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 4,
  },
  patternDomain: {
    fontSize: 11,
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightsList: {
    gap: 12,
  },
  threadInsightItem: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    padding: 12,
  },
  threadInsightText: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 8,
  },
  responseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  responseBadgeYes: {
    backgroundColor: 'rgba(74,222,128,0.10)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  responseBadgeMaybe: {
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderColor: 'rgba(250,204,21,0.25)',
  },
  responseBadgeNo: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  responseBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  responseBadgeTextYes: {
    color: 'rgba(74,222,128,0.9)',
  },
  responseBadgeTextMaybe: {
    color: 'rgba(250,204,21,0.9)',
  },
  responseBadgeTextNo: {
    color: 'rgba(248,113,113,0.9)',
  },
  questionsList: {
    gap: 12,
  },
  questionItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    padding: 12,
  },
  questionIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: OraaColors.blue,
    marginTop: 1,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
  },
  dangerSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
    alignItems: 'center',
  },
  dangerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dangerButtonText: {
    fontSize: 14,
    color: 'rgba(248,113,113,0.8)',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: OraaColors.bg,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
    padding: 16,
  },
  startButton: {
    backgroundColor: OraaColors.blue,
    borderRadius: Radii.lg,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  errorText: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
});
