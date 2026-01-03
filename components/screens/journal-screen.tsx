import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { JournalEntryCard, JournalEntry } from '@/components/journal/journal-entry';
import { OraaColors } from '@/constants/theme';

// Mock data for journal entries
const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: 'Dec 29, 2025',
    dayOfWeek: 'Sunday',
    summary: 'You came in feeling overwhelmed about the week ahead. We talked through what was actually on your plate versus what you were anticipating. The anxiety seemed to be more about "what if" than "what is." By the end, you\'d identified two things that were genuinely urgent and decided the rest could wait.',
    conversationCount: 24,
  },
  {
    id: '2',
    date: 'Dec 28, 2025',
    dayOfWeek: 'Saturday',
    summary: 'The Christmas visit came up again. You noticed you\'d been carrying tension since getting home. We explored the gap between how you wanted to show up with your family and how you actually did. There\'s grief there—for the relationship you wish you had.',
    reflection: 'Reading this back, I realize I\'ve been avoiding calling her because I don\'t want to feel that guilt again.',
    conversationCount: 31,
  },
  {
    id: '3',
    date: 'Dec 26, 2025',
    dayOfWeek: 'Thursday',
    summary: 'Quick check-in about sleep. You mentioned waking up at 3am with racing thoughts. We did a brief worry dump—most of it was work stuff that felt more manageable once it was out of your head. You seemed calmer by the end.',
    conversationCount: 12,
  },
  {
    id: '4',
    date: 'Dec 22, 2025',
    dayOfWeek: 'Sunday',
    summary: 'Big conversation about whether you\'re in the right career. The question isn\'t really about the job—it\'s about whether you\'re living according to your own values or someone else\'s expectations. We didn\'t solve it, but you said just naming it helped.',
    conversationCount: 42,
  },
];

export function JournalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const viewTranscript = (entryId: string) => {
    router.push(`/(drawer)/journal/transcript/${entryId}`);
  };
  
  const handleAddReflection = (entryId: string) => {
    console.log('Add reflection for:', entryId);
  };
  
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
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>{JOURNAL_ENTRIES.length} entries</Text>
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
          Your emotional timeline, narrated by someone who was paying attention.
        </Text>
        
        <View style={styles.entryList}>
          {JOURNAL_ENTRIES.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => viewTranscript(entry.id)}
              onAddReflection={() => handleAddReflection(entry.id)}
            />
          ))}
        </View>
        
        {JOURNAL_ENTRIES.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📔</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Journal entries are created at the end of each day you talk with Oraa.
            </Text>
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
    marginBottom: 20,
  },
  entryList: {
    gap: 16,
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
    maxWidth: 260,
  },
});

