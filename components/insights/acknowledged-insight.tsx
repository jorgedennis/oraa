import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';
import { InsightAdviceModal } from './insight-advice-modal';

interface AcknowledgedInsightProps {
  observation: string;
  domain: string;
  response?: 'yes' | 'maybe' | 'no';
  note?: string;
  date?: string;
  // New template-based props
  templateId?: string;
  isNovel?: boolean;
}

export function AcknowledgedInsight({
  observation,
  domain,
  response,
  note,
  date,
  templateId,
  isNovel = false,
}: AcknowledgedInsightProps) {
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  
  const responseConfig = {
    yes: { label: 'Agreed', color: 'rgba(74,222,128,0.9)', bg: 'rgba(74,222,128,0.15)' },
    maybe: { label: 'Nuanced', color: 'rgba(250,204,21,0.9)', bg: 'rgba(250,204,21,0.15)' },
    no: { label: 'Disagreed', color: 'rgba(248,113,113,0.9)', bg: 'rgba(248,113,113,0.15)' },
  };
  
  const config = response ? responseConfig[response] : null;
  const isDismissed = response === 'no';
  
  return (
    <>
      <TouchableOpacity 
        style={[styles.container, isDismissed && styles.containerDismissed]}
        onPress={() => setShowAdviceModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            {config && (
              <View style={[styles.badge, { backgroundColor: config.bg }]}>
                <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
              </View>
            )}
            {isNovel && (
              <View style={styles.novelBadge}>
                <Text style={styles.novelBadgeText}>Unique</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>{domain}{date ? ` • ${date}` : ''}</Text>
        </View>
        
        <Text style={[styles.observation, isDismissed && styles.observationDismissed]}>
          {observation}
        </Text>
        
        {note && !isDismissed && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Your note:</Text>
            <Text style={styles.note}>{note}</Text>
          </View>
        )}
        
        {/* Tap hint */}
        {(templateId || isNovel) && (
          <Text style={styles.tapHint}>Tap to learn more</Text>
        )}
      </TouchableOpacity>
      
      {/* Advice Modal */}
      <InsightAdviceModal
        visible={showAdviceModal}
        templateId={templateId || null}
        isNovel={isNovel}
        onClose={() => setShowAdviceModal(false)}
      />
    </>
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
  containerDismissed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  novelBadge: {
    backgroundColor: 'rgba(147,112,219,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  novelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(147,112,219,0.9)',
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
  observationDismissed: {
    color: OraaColors.textMuted,
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
  tapHint: {
    fontSize: 11,
    color: OraaColors.blue,
    marginTop: 4,
  },
});
