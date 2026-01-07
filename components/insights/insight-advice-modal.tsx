import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInsightsStore, ADVICE_SECTION_TITLES, InsightAdvice, InsightAdviceSection } from '@/store';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface InsightAdviceModalProps {
  visible: boolean;
  templateId: string | null;
  isNovel: boolean;
  onClose: () => void;
}

export function InsightAdviceModal({ visible, templateId, isNovel, onClose }: InsightAdviceModalProps) {
  const insets = useSafeAreaInsets();
  const { fetchTemplateAdvice, isLoadingAdvice, adviceCache } = useInsightsStore();
  const [advice, setAdvice] = useState<InsightAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (visible && templateId && !isNovel) {
      // Check cache first
      const cached = adviceCache.get(templateId);
      if (cached) {
        setAdvice(cached);
        setError(null);
      } else {
        // Fetch advice
        fetchTemplateAdvice(templateId).then((result) => {
          if (result) {
            setAdvice(result);
            setError(null);
          } else {
            setError('Unable to load advice for this insight.');
          }
        });
      }
    } else {
      setAdvice(null);
      setError(null);
    }
  }, [visible, templateId, isNovel]);
  
  // Section order for display
  const sectionOrder: InsightAdviceSection[] = [
    'what_this_means',
    'how_to_recognize_it',
    'what_to_watch_out_for',
    'relationship_effects',
    'the_upside',
    'practical_strategies',
  ];
  
  // Get sections in display order
  const orderedSections = advice?.sections
    ? sectionOrder
        .map(section => advice.sections.find(s => s.section === section))
        .filter(Boolean)
    : [];
  
  const renderContent = () => {
    // Novel insight - no advice available
    if (isNovel || !templateId) {
      return (
        <View style={styles.novelContent}>
          <Text style={styles.novelIcon}>✨</Text>
          <Text style={styles.novelTitle}>Unique Pattern</Text>
          <Text style={styles.novelText}>
            This is a unique pattern we're still learning about. As we continue to talk and this pattern shows up more, we'll build a better understanding of what it means for you.
          </Text>
        </View>
      );
    }
    
    // Loading state
    if (isLoadingAdvice) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OraaColors.blue} />
          <Text style={styles.loadingText}>Loading advice...</Text>
        </View>
      );
    }
    
    // Error state
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    
    // No advice content yet
    if (!advice || orderedSections.length === 0) {
      return (
        <View style={styles.novelContent}>
          <Text style={styles.novelIcon}>📝</Text>
          <Text style={styles.novelTitle}>Advice Coming Soon</Text>
          <Text style={styles.novelText}>
            We're still building out the detailed advice for this insight. Check back later for more guidance on what this pattern means and how to work with it.
          </Text>
        </View>
      );
    }
    
    // Display advice sections
    return (
      <View style={styles.sectionsContainer}>
        {orderedSections.map((section, index) => (
          <View key={section!.section} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {ADVICE_SECTION_TITLES[section!.section as InsightAdviceSection]}
            </Text>
            <Text style={styles.sectionContent}>{section!.content}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learn More</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: OraaColors.text,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: OraaColors.blue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
  // Error state
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: OraaColors.textMuted,
    textAlign: 'center',
  },
  // Novel insight state
  novelContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  novelIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  novelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: OraaColors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  novelText: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.textSub,
    textAlign: 'center',
    maxWidth: 320,
  },
  // Advice sections
  sectionsContainer: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    padding: 16,
    ...Shadows.soft,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: OraaColors.blue,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: OraaColors.text,
  },
});

