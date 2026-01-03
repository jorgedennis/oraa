import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';

interface ThreadIndicatorProps {
  threadTitle: string;
  onPress?: () => void;
}

export function ThreadIndicator({ threadTitle, onPress }: ThreadIndicatorProps) {
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

const styles = StyleSheet.create({
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
});

