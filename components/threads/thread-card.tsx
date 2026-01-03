import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

export interface Thread {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  mentionCount: number;
}

interface ThreadCardProps {
  thread: Thread;
  onPress?: () => void;
}

export function ThreadCard({ thread, onPress }: ThreadCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🧵</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{thread.title}</Text>
        <Text style={styles.status} numberOfLines={2}>{thread.status}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{thread.mentionCount} mentions</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{thread.lastUpdated}</Text>
        </View>
      </View>
      
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    padding: 14,
    gap: 12,
    ...Shadows.soft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(147,112,219,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: OraaColors.text,
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  metaDot: {
    fontSize: 12,
    color: OraaColors.textMuted,
  },
  chevron: {
    fontSize: 24,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
});

