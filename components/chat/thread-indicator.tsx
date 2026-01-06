import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';
import { ActiveThread } from '@/store';

// Single thread display (backward compatible)
interface SingleThreadIndicatorProps {
  threadTitle: string;
  onPress?: () => void;
}

export function ThreadIndicator({ threadTitle, onPress }: SingleThreadIndicatorProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🧵</Text>
      <Text style={styles.label}>This relates to:</Text>
      <Text style={styles.title} numberOfLines={1}>{threadTitle}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// Multi-thread context bar
interface ThreadContextBarProps {
  activeThreads: ActiveThread[];
  inferredThreads?: ActiveThread[];
  onRemoveThread: (threadId: string) => void;
  onAcceptInferred?: (threadId: string) => void;
  onThreadPress?: (threadId: string) => void;
}

export function ThreadContextBar({ 
  activeThreads, 
  inferredThreads = [], 
  onRemoveThread,
  onAcceptInferred,
  onThreadPress
}: ThreadContextBarProps) {
  if (activeThreads.length === 0 && inferredThreads.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.contextBar}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contextBarContent}
      >
        {activeThreads.length > 0 && (
          <>
            <Text style={styles.contextLabel}>🧵 This relates to:</Text>
            {activeThreads.map((thread, index) => (
              <View key={thread.id} style={styles.threadTagWrapper}>
                {index > 0 && <Text style={styles.separator}>·</Text>}
                <TouchableOpacity
                  style={styles.threadTag}
                  onPress={() => onThreadPress?.(thread.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.threadTagText}>{thread.title}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemoveThread(thread.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeIcon}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        
        {/* Inferred threads (suggested) */}
        {inferredThreads.length > 0 && (
          <>
            {activeThreads.length > 0 && <View style={styles.divider} />}
            <Text style={styles.inferredLabel}>Maybe:</Text>
            {inferredThreads.map((thread) => (
              <TouchableOpacity
                key={thread.id}
                style={styles.inferredTag}
                onPress={() => onAcceptInferred?.(thread.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.inferredTagText}>{thread.title}</Text>
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Thread selection pill (for adding threads)
interface ThreadPillProps {
  thread: { id: string; title: string };
  isSelected: boolean;
  onPress: () => void;
}

export function ThreadPill({ thread, isSelected, onPress }: ThreadPillProps) {
  return (
    <TouchableOpacity
      style={[styles.pill, isSelected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
        {thread.title}
      </Text>
      {isSelected && <Text style={styles.pillCheck}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Original single thread indicator styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(147,112,219,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    borderRadius: Radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(167,139,250,1)',
  },
  chevron: {
    fontSize: 16,
    color: 'rgba(167,139,250,0.7)',
    fontWeight: '300',
  },
  
  // Multi-thread context bar styles
  contextBar: {
    backgroundColor: 'rgba(147,112,219,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147,112,219,0.15)',
  },
  contextBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  contextLabel: {
    fontSize: 12,
    color: OraaColors.textMuted,
    marginRight: 4,
  },
  threadTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontSize: 14,
    color: OraaColors.textMuted,
    marginRight: 8,
  },
  threadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(147,112,219,0.15)',
    borderRadius: Radii.pill,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
  },
  threadTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(167,139,250,1)',
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(147,112,219,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 14,
    color: 'rgba(167,139,250,0.8)',
    fontWeight: '500',
    marginTop: -1,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(147,112,219,0.3)',
    marginHorizontal: 8,
  },
  inferredLabel: {
    fontSize: 11,
    color: OraaColors.textMuted,
    marginRight: 4,
  },
  inferredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(147,112,219,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    borderStyle: 'dashed',
    borderRadius: Radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  inferredTagText: {
    fontSize: 12,
    color: 'rgba(167,139,250,0.7)',
  },
  addIcon: {
    fontSize: 14,
    color: 'rgba(167,139,250,0.7)',
    fontWeight: '500',
  },
  
  // Thread pill styles (for selection)
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillSelected: {
    backgroundColor: 'rgba(147,112,219,0.15)',
    borderColor: 'rgba(147,112,219,0.4)',
  },
  pillText: {
    fontSize: 14,
    color: OraaColors.textSub,
  },
  pillTextSelected: {
    color: 'rgba(167,139,250,1)',
    fontWeight: '500',
  },
  pillCheck: {
    fontSize: 12,
    color: 'rgba(167,139,250,1)',
    fontWeight: '700',
  },
});
