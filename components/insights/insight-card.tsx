import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { PromotionReason, PROMOTION_REASON_COPY, useInsightsStore } from '@/store';
import { InsightAdviceModal } from './insight-advice-modal';

interface InsightCardProps {
  id: string;
  observation: string;
  domain: string;
  onRespond?: (id: string, response: 'yes' | 'maybe' | 'no', note?: string) => void;
  // New template-based props
  templateId?: string;
  isNovel?: boolean;
  promotionReason?: PromotionReason;
  confidence?: number;
  evidenceSummary?: string;
}

export function InsightCard({ 
  id, 
  observation, 
  domain, 
  onRespond,
  templateId,
  isNovel = false,
  promotionReason,
  confidence,
  evidenceSummary,
}: InsightCardProps) {
  const [note, setNote] = useState('');
  const [responded, setResponded] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  
  const handleResponse = (response: 'yes' | 'maybe' | 'no') => {
    setSelectedResponse(response);
    setResponded(true);
    onRespond?.(id, response, note.trim() || undefined);
  };
  
  const handleCardPress = () => {
    // Only open advice modal if there's a template or it's novel
    if (templateId || isNovel) {
      setShowAdviceModal(true);
    }
  };
  
  // Get promotion reason copy
  const promotionCopy = promotionReason ? PROMOTION_REASON_COPY[promotionReason] : null;
  
  if (responded) {
    const responseLabels = {
      yes: 'Agreed',
      maybe: 'Noted with context',
      no: 'Disagreed',
    };
    
    return (
      <View style={[styles.container, styles.containerResponded]}>
        <View style={styles.respondedContent}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.respondedText}>
            {selectedResponse ? responseLabels[selectedResponse] : 'Noted'}
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={handleCardPress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>✨ New Insight</Text>
            {isNovel && (
              <View style={styles.novelBadge}>
                <Text style={styles.novelBadgeText}>Unique</Text>
              </View>
            )}
          </View>
          <Text style={styles.domain}>{domain}</Text>
        </View>
        
        <Text style={styles.observation}>{observation}</Text>
        
        {/* Promotion reason copy */}
        {promotionCopy && (
          <Text style={styles.promotionCopy}>{promotionCopy}</Text>
        )}
        
        {/* Evidence summary (if available) */}
        {evidenceSummary && (
          <View style={styles.evidenceContainer}>
            <Text style={styles.evidenceLabel}>Evidence:</Text>
            <Text style={styles.evidenceText}>{evidenceSummary}</Text>
          </View>
        )}
        
        {/* Tap to learn more hint */}
        {(templateId || isNovel) && (
          <Text style={styles.learnMoreHint}>Tap to learn more</Text>
        )}
        
        <Text style={styles.question}>Does this resonate?</Text>
        
        {/* Response buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonYes, selectedResponse === 'yes' && styles.buttonSelected]}
            onPress={() => handleResponse('yes')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.buttonTextYes]}>Yes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonMaybe, selectedResponse === 'maybe' && styles.buttonSelected]}
            onPress={() => handleResponse('maybe')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.buttonTextMaybe]}>Maybe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonNo, selectedResponse === 'no' && styles.buttonSelected]}
            onPress={() => handleResponse('no')}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.buttonTextNo]}>No</Text>
          </TouchableOpacity>
        </View>
        
        {/* Optional input - always visible */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Add your thoughts (optional)..."
            placeholderTextColor={OraaColors.textPlaceholder}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={500}
          />
        </View>
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
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    padding: 16,
    ...Shadows.soft,
  },
  containerResponded: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.20)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.blue,
  },
  novelBadge: {
    backgroundColor: 'rgba(147,112,219,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  novelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(147,112,219,0.9)',
  },
  domain: {
    fontSize: 11,
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  observation: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.text,
    marginBottom: 8,
  },
  promotionCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  evidenceContainer: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderRadius: Radii.md,
    padding: 10,
    marginBottom: 12,
  },
  evidenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: OraaColors.textMuted,
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 13,
    lineHeight: 18,
    color: OraaColors.textSub,
  },
  learnMoreHint: {
    fontSize: 12,
    color: OraaColors.blue,
    marginBottom: 12,
  },
  question: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonYes: {
    backgroundColor: 'rgba(74,222,128,0.10)',
    borderColor: 'rgba(74,222,128,0.25)',
  },
  buttonMaybe: {
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderColor: 'rgba(250,204,21,0.25)',
  },
  buttonNo: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  buttonSelected: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextYes: {
    color: 'rgba(74,222,128,0.9)',
  },
  buttonTextMaybe: {
    color: 'rgba(250,204,21,0.9)',
  },
  buttonTextNo: {
    color: 'rgba(248,113,113,0.9)',
  },
  inputSection: {
    marginTop: 14,
  },
  input: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    padding: 12,
    fontSize: 14,
    color: OraaColors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  respondedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  checkmark: {
    fontSize: 16,
    color: 'rgba(74,222,128,0.9)',
  },
  respondedText: {
    fontSize: 14,
    color: 'rgba(74,222,128,0.9)',
    fontWeight: '500',
  },
});
