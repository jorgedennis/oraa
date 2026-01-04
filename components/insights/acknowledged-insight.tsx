import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';

interface AcknowledgedInsightProps {
  observation: string;
  domain: string;
  response: 'yes' | 'maybe' | 'no';
  note?: string;
  date: string;
}

export function AcknowledgedInsight({
  observation,
  domain,
  response,
  note,
  date,
}: AcknowledgedInsightProps) {
  const responseConfig = {
    yes: { label: 'Agreed', color: 'rgba(74,222,128,0.9)', bg: 'rgba(74,222,128,0.15)' },
    maybe: { label: 'Nuanced', color: 'rgba(250,204,21,0.9)', bg: 'rgba(250,204,21,0.15)' },
    no: { label: 'Disagreed', color: 'rgba(248,113,113,0.9)', bg: 'rgba(248,113,113,0.15)' },
  };
  
  const config = responseConfig[response];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.meta}>{domain} • {date}</Text>
      </View>
      
      <Text style={styles.observation}>{observation}</Text>
      
      {note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Your note:</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.lg,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  meta: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
  observation: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
  },
  noteContainer: {
    backgroundColor: OraaColors.surface,
    borderRadius: Radii.md,
    padding: 10,
    gap: 4,
  },
  noteLabel: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.text,
    fontStyle: 'italic',
  },
});

