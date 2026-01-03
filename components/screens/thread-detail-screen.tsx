import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThreadTimeline, TimelineEntry } from '@/components/threads/thread-timeline';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Mock data for a thread
const THREAD_DATA = {
  id: '1',
  title: 'Your relationship with your mom',
  createdAt: 'Dec 15',
  currentUnderstanding: 'You\'re working on setting boundaries without feeling guilty. The hardest part is when she calls upset—you feel responsible for her emotions even though you know intellectually you\'re not.',
  timeline: [
    {
      id: '1',
      date: 'Dec 28',
      summary: 'Talked about the Christmas visit and how drained you felt afterward. Noticed the pattern of over-explaining your choices.',
    },
    {
      id: '2',
      date: 'Dec 22',
      summary: 'Discussed the phone call where she criticized your job. You stayed calm but felt the familiar guilt spiral after.',
    },
    {
      id: '3',
      date: 'Dec 18',
      summary: 'Explored why her approval still matters so much. Childhood patterns of being the "responsible one" came up.',
    },
    {
      id: '4',
      date: 'Dec 15',
      summary: 'First mentioned feeling obligated to fix her loneliness. Thread created.',
    },
  ],
  patterns: [
    'You feel most conflicted after phone calls, less so with text',
    'Guilt shows up as physical tension in your chest',
    'You\'re clearer about boundaries when talking to me than when you\'re with her',
  ],
  openQuestions: [
    'What did boundaries look like in your family growing up?',
    'When do you feel least guilty—what\'s different in those moments?',
  ],
};

interface ThreadDetailScreenProps {
  threadId?: string;
}

export function ThreadDetailScreen({ threadId }: ThreadDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // In real app, fetch thread by ID
  const thread = THREAD_DATA;
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Threads</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and meta */}
        <View style={styles.titleSection}>
          <Text style={styles.threadIcon}>🧵</Text>
          <Text style={styles.title}>{thread.title}</Text>
          <Text style={styles.createdAt}>Created {thread.createdAt}</Text>
        </View>
        
        {/* Current Understanding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Understanding</Text>
          <View style={styles.understandingCard}>
            <Text style={styles.understanding}>{thread.currentUnderstanding}</Text>
          </View>
        </View>
        
        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <ThreadTimeline entries={thread.timeline as TimelineEntry[]} />
        </View>
        
        {/* Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patterns I'm Noticing</Text>
          <View style={styles.patternsList}>
            {thread.patterns.map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternBullet}>•</Text>
                <Text style={styles.patternText}>{pattern}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Open Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Still Curious About</Text>
          <View style={styles.questionsList}>
            {thread.openQuestions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionIcon}>?</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
          </View>
        </View>
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
    marginBottom: 4,
  },
  createdAt: {
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
    gap: 10,
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
  patternText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
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
});

