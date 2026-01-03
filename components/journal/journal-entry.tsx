import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

export interface JournalEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  summary: string;
  reflection?: string;
  conversationCount: number;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress?: () => void;
  onAddReflection?: () => void;
}

export function JournalEntryCard({ entry, onPress, onAddReflection }: JournalEntryCardProps) {
  return (
    <View style={styles.container}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dayOfWeek}>{entry.dayOfWeek}</Text>
        <Text style={styles.date}>{entry.date}</Text>
      </View>
      
      {/* Summary from Oraa */}
      <View style={styles.summarySection}>
        <View style={styles.oraaBadge}>
          <View style={styles.oraaDot} />
          <Text style={styles.oraaLabel}>Oraa's reflection</Text>
        </View>
        <Text style={styles.summary}>{entry.summary}</Text>
      </View>
      
      {/* User reflection */}
      {entry.reflection ? (
        <View style={styles.reflectionSection}>
          <Text style={styles.reflectionLabel}>Your note</Text>
          <Text style={styles.reflection}>{entry.reflection}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addReflectionButton}
          onPress={onAddReflection}
          activeOpacity={0.7}
        >
          <Text style={styles.addReflectionText}>+ Add your reflection</Text>
        </TouchableOpacity>
      )}
      
      {/* View conversation link */}
      <TouchableOpacity
        style={styles.viewButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.viewButtonText}>
          View full conversation ({entry.conversationCount} messages)
        </Text>
        <Text style={styles.viewButtonIcon}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    backgroundColor: OraaColors.surfaceSubtle,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: OraaColors.text,
  },
  date: {
    fontSize: 13,
    color: OraaColors.textMuted,
  },
  summarySection: {
    padding: 16,
    gap: 10,
  },
  oraaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oraaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: OraaColors.blue,
  },
  oraaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: OraaColors.textMuted,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.textSub,
  },
  reflectionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: OraaColors.textMuted,
  },
  reflection: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.text,
    fontStyle: 'italic',
  },
  addReflectionButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    borderStyle: 'dashed',
  },
  addReflectionText: {
    fontSize: 13,
    color: OraaColors.textMuted,
    textAlign: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
    backgroundColor: OraaColors.surfaceSubtle,
  },
  viewButtonText: {
    fontSize: 13,
    color: OraaColors.blue,
  },
  viewButtonIcon: {
    fontSize: 20,
    color: OraaColors.blue,
    fontWeight: '300',
  },
});

