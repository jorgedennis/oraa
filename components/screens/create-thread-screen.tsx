import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThreadsStore, ThreadType } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Thread type configuration
const THREAD_TYPES: Array<{
  type: ThreadType;
  label: string;
  icon: string;
  description: string;
  examples: string;
}> = [
  {
    type: 'people',
    label: 'People',
    icon: '👤',
    description: 'Track relationships with specific individuals or groups',
    examples: 'Mom, Partner, Work team, College friends',
  },
  {
    type: 'self',
    label: 'Self',
    icon: '🌀',
    description: 'Track ongoing internal storylines about identity or patterns',
    examples: 'Career identity, Body image, Imposter syndrome',
  },
  {
    type: 'situation',
    label: 'Situation',
    icon: '📍',
    description: 'Track time-bound circumstances or transitions',
    examples: 'Job search, Moving to a new city, Wedding planning',
  },
];

export function CreateThreadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createThread, isLoading } = useThreadsStore();
  
  const [selectedType, setSelectedType] = useState<ThreadType>('people');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  const goBack = () => {
    router.back();
  };
  
  const handleCreate = async () => {
    if (!title.trim()) return;
    
    const thread = await createThread(
      title.trim(),
      selectedType,
      notes.trim() || undefined
    );
    
    if (thread) {
      router.replace(`/(drawer)/threads/${thread.id}` as any);
    }
  };
  
  const isValid = title.trim().length > 0;
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.cancelButton} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Thread</Text>
        <TouchableOpacity 
          onPress={handleCreate} 
          style={[styles.createButton, !isValid && styles.createButtonDisabled]} 
          activeOpacity={0.7}
          disabled={!isValid || isLoading}
        >
          <Text style={[styles.createText, !isValid && styles.createTextDisabled]}>
            {isLoading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thread Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeList}>
            {THREAD_TYPES.map((typeConfig) => (
              <TouchableOpacity
                key={typeConfig.type}
                style={[
                  styles.typeCard,
                  selectedType === typeConfig.type && styles.typeCardSelected
                ]}
                onPress={() => setSelectedType(typeConfig.type)}
                activeOpacity={0.7}
              >
                <View style={styles.typeHeader}>
                  <Text style={styles.typeIcon}>{typeConfig.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    selectedType === typeConfig.type && styles.typeLabelSelected
                  ]}>
                    {typeConfig.label}
                  </Text>
                  {selectedType === typeConfig.type && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.typeDescription}>{typeConfig.description}</Text>
                <Text style={styles.typeExamples}>e.g., {typeConfig.examples}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Thread Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder={
              selectedType === 'people' ? 'e.g., Mom, Alex, Work people' :
              selectedType === 'self' ? 'e.g., Career identity, Body image' :
              'e.g., Job search, The move'
            }
            placeholderTextColor={OraaColors.textPlaceholder}
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
            autoFocus
          />
          <Text style={styles.hint}>
            Keep it simple—short names work best.
          </Text>
        </View>
        
        {/* Initial Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Initial notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's the current situation? Any context Oraa should know?"
            placeholderTextColor={OraaColors.textPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>
            • Threads track storylines over time across multiple conversations
          </Text>
          <Text style={styles.tipText}>
            • Oraa will summarize conversations and notice patterns within each thread
          </Text>
          <Text style={styles.tipText}>
            • You can always merge or split threads later as needed
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  cancelButton: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
    color: OraaColors.textSub,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: OraaColors.text,
  },
  createButton: {
    paddingVertical: 4,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.blue,
  },
  createTextDisabled: {
    color: OraaColors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: OraaColors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeList: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.lg,
    padding: 14,
    ...Shadows.soft,
  },
  typeCardSelected: {
    borderColor: OraaColors.blue,
    backgroundColor: 'rgba(79,170,249,0.05)',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.text,
    flex: 1,
  },
  typeLabelSelected: {
    color: OraaColors.blue,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: OraaColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  typeDescription: {
    fontSize: 13,
    color: OraaColors.textSub,
    lineHeight: 18,
    marginBottom: 4,
  },
  typeExamples: {
    fontSize: 12,
    color: OraaColors.textMuted,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    padding: 14,
    fontSize: 16,
    color: OraaColors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: OraaColors.textMuted,
    marginTop: 8,
  },
  tipsSection: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderRadius: Radii.lg,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: OraaColors.textSub,
    lineHeight: 20,
    marginBottom: 4,
  },
});

