import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ThreadCard, Thread } from '@/components/threads/thread-card';
import { OraaColors } from '@/constants/theme';

// Mock data for threads
const THREADS: Thread[] = [
  {
    id: '1',
    title: 'Your relationship with your mom',
    status: 'Working on setting boundaries without feeling guilty. The hardest part is when she calls upset.',
    lastUpdated: 'Today',
    mentionCount: 12,
  },
  {
    id: '2',
    title: 'Career transition anxiety',
    status: 'Questioning whether to stay in your current role or take the leap. Fear of regret vs. fear of failure.',
    lastUpdated: 'Yesterday',
    mentionCount: 8,
  },
  {
    id: '3',
    title: 'Body image stuff',
    status: 'Noticing the connection between stress and how you feel about your body. It\'s not really about the body.',
    lastUpdated: 'Dec 28',
    mentionCount: 5,
  },
  {
    id: '4',
    title: 'Friendship with Alex',
    status: 'Feeling like the friendship has become one-sided. Unsure whether to address it or let it fade.',
    lastUpdated: 'Dec 22',
    mentionCount: 4,
  },
];

export function ThreadsListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const openThread = (threadId: string) => {
    router.push(`/(drawer)/threads/${threadId}`);
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
            <Text style={styles.title}>Threads</Text>
            <Text style={styles.subtitle}>{THREADS.length} active</Text>
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
          Ongoing storylines in your life that span multiple conversations.
        </Text>
        
        <View style={styles.threadList}>
          {THREADS.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onPress={() => openThread(thread.id)}
            />
          ))}
        </View>
        
        {THREADS.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧵</Text>
            <Text style={styles.emptyTitle}>No threads yet</Text>
            <Text style={styles.emptyText}>
              Threads are created when patterns emerge across conversations.
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
  threadList: {
    gap: 12,
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

