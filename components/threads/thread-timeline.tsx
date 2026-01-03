import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';

export interface TimelineEntry {
  id: string;
  date: string;
  summary: string;
}

interface ThreadTimelineProps {
  entries: TimelineEntry[];
}

export function ThreadTimeline({ entries }: ThreadTimelineProps) {
  return (
    <View style={styles.container}>
      {entries.map((entry, index) => (
        <View key={entry.id} style={styles.entry}>
          <View style={styles.lineContainer}>
            <View style={styles.dot} />
            {index < entries.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.content}>
            <Text style={styles.date}>{entry.date}</Text>
            <Text style={styles.summary}>{entry.summary}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  entry: {
    flexDirection: 'row',
    gap: 12,
  },
  lineContainer: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(147,112,219,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(147,112,219,0.8)',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: OraaColors.stroke,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.textMuted,
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
  },
});

