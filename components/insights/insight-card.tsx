import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface InsightCardProps {
  id: string;
  observation: string;
  domain: string;
  onRespond?: (id: string, response: 'yes' | 'maybe' | 'no', note?: string) => void;
}

export function InsightCard({ id, observation, domain, onRespond }: InsightCardProps) {
  const [note, setNote] = useState('');
  const [responded, setResponded] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<'yes' | 'maybe' | 'no' | null>(null);
  
  const handleResponse = (response: 'yes' | 'maybe' | 'no') => {
    setSelectedResponse(response);
    setResponded(true);
    onRespond?.(id, response, note.trim() || undefined);
  };
  
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>✨ New Insight</Text>
        <Text style={styles.domain}>{domain}</Text>
      </View>
      
      <Text style={styles.observation}>{observation}</Text>
      
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
    </View>
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
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.blue,
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
    marginBottom: 16,
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

