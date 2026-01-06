import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ThreadCard } from '@/components/threads/thread-card';
import { useThreadsStore, Thread, ThreadType } from '@/store';
import { OraaColors, Radii } from '@/constants/theme';

// Thread type labels and icons
const THREAD_TYPE_CONFIG: Record<ThreadType, { label: string; icon: string }> = {
  people: { label: 'People', icon: '👤' },
  self: { label: 'Self', icon: '🌀' },
  situation: { label: 'Situations', icon: '📍' },
};

// Thread Group Component
interface ThreadGroupProps {
  type: ThreadType;
  threads: Thread[];
  onThreadPress: (threadId: string) => void;
}

function ThreadGroup({ type, threads, onThreadPress }: ThreadGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = THREAD_TYPE_CONFIG[type];
  
  if (threads.length === 0) return null;
  
  return (
    <View style={styles.threadGroup}>
      <TouchableOpacity 
        style={styles.groupHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeaderLeft}>
          <Text style={styles.groupIcon}>{config.icon}</Text>
          <Text style={styles.groupTitle}>{config.label}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{threads.length}</Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.threadsList}>
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={{
                id: thread.id,
                title: thread.title,
                status: thread.current_understanding || '',
                lastUpdated: thread.last_mentioned_at 
                  ? formatDate(thread.last_mentioned_at) 
                  : 'Just created',
                mentionCount: thread.mention_count,
              }}
              onPress={() => onThreadPress(thread.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Date formatting helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ThreadsListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  
  const { threads, isLoading, fetchThreads } = useThreadsStore();
  
  useEffect(() => {
    fetchThreads();
  }, []);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const openThread = (threadId: string) => {
    router.push(`/(drawer)/threads/${threadId}`);
  };
  
  const openCreateThread = () => {
    router.push('/(drawer)/threads/create' as any);
  };
  
  // Group threads by type
  const activeThreads = threads.filter(t => t.status === 'active');
  const peopleThreads = activeThreads.filter(t => t.type === 'people');
  const selfThreads = activeThreads.filter(t => t.type === 'self');
  const situationThreads = activeThreads.filter(t => t.type === 'situation');
  
  // Archived threads
  const archivedThreads = threads.filter(t => t.status === 'archived');
  
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
            <Text style={styles.subtitle}>{activeThreads.length} active</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openCreateThread}
          activeOpacity={0.7}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading threads...</Text>
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
            Ongoing storylines in your life that span multiple conversations.
          </Text>
          
          {activeThreads.length > 0 ? (
            <View style={styles.groupsContainer}>
              <ThreadGroup type="people" threads={peopleThreads} onThreadPress={openThread} />
              <ThreadGroup type="self" threads={selfThreads} onThreadPress={openThread} />
              <ThreadGroup type="situation" threads={situationThreads} onThreadPress={openThread} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧵</Text>
              <Text style={styles.emptyTitle}>No threads yet</Text>
              <Text style={styles.emptyText}>
                Threads are created when patterns emerge across conversations, 
                or you can create one manually.
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={openCreateThread}
                activeOpacity={0.7}
              >
                <Text style={styles.createButtonText}>Create Thread</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Archived Threads */}
          {archivedThreads.length > 0 && (
            <View style={styles.archivedSection}>
              <Text style={styles.archivedTitle}>Archived ({archivedThreads.length})</Text>
              <View style={styles.threadsList}>
                {archivedThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={{
                      id: thread.id,
                      title: thread.title,
                      status: thread.current_understanding || '',
                      lastUpdated: 'Archived',
                      mentionCount: thread.mention_count,
                    }}
                    onPress={() => openThread(thread.id)}
                  />
                ))}
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: OraaColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
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
  groupsContainer: {
    gap: 24,
  },
  threadGroup: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupIcon: {
    fontSize: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: OraaColors.text,
  },
  countBadge: {
    backgroundColor: OraaColors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  countText: {
    fontSize: 12,
    color: OraaColors.textMuted,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 18,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
  threadsList: {
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
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: OraaColors.blue,
    borderRadius: Radii.md,
  },
  createButtonText: {
    fontSize: 14,
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
  archivedSection: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
  },
  archivedTitle: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginBottom: 12,
  },
});
