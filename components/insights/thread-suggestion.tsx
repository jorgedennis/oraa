import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface ThreadSuggestionProps {
  id: string;
  topic: string;
  description: string;
  mentionCount: number;
  onCreateThread?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function ThreadSuggestion({
  id,
  topic,
  description,
  mentionCount,
  onCreateThread,
  onDismiss,
}: ThreadSuggestionProps) {
  const [responded, setResponded] = useState(false);
  const [created, setCreated] = useState(false);
  
  const handleCreate = () => {
    setCreated(true);
    setResponded(true);
    onCreateThread?.(id);
  };
  
  const handleDismiss = () => {
    setResponded(true);
    onDismiss?.(id);
  };
  
  if (responded) {
    return (
      <View style={[styles.container, created ? styles.containerCreated : styles.containerDismissed]}>
        <View style={styles.respondedContent}>
          <Text style={styles.respondedIcon}>{created ? '🧵' : '✓'}</Text>
          <Text style={[styles.respondedText, created && styles.respondedTextCreated]}>
            {created ? 'Thread created' : 'Dismissed'}
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>🧵 Thread Suggestion</Text>
        <Text style={styles.mentions}>{mentionCount}x mentioned</Text>
      </View>
      
      <Text style={styles.topic}>{topic}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonCreate]}
          onPress={handleCreate}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.buttonTextCreate]}>Create Thread</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonDismiss]}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.buttonTextDismiss]}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.20)',
    borderRadius: Radii.xl,
    padding: 16,
    ...Shadows.soft,
  },
  containerCreated: {
    backgroundColor: 'rgba(147,112,219,0.08)',
    borderColor: 'rgba(147,112,219,0.25)',
  },
  containerDismissed: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderColor: OraaColors.stroke,
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
    color: 'rgba(147,112,219,0.9)',
  },
  mentions: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
  topic: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.textSub,
    marginBottom: 16,
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
  buttonCreate: {
    backgroundColor: 'rgba(147,112,219,0.12)',
    borderColor: 'rgba(147,112,219,0.30)',
  },
  buttonDismiss: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderColor: OraaColors.stroke,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextCreate: {
    color: 'rgba(167,139,250,1)',
  },
  buttonTextDismiss: {
    color: OraaColors.textMuted,
  },
  respondedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  respondedIcon: {
    fontSize: 16,
  },
  respondedText: {
    fontSize: 14,
    color: OraaColors.textMuted,
    fontWeight: '500',
  },
  respondedTextCreated: {
    color: 'rgba(167,139,250,1)',
  },
});

