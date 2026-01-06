import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface InsightReminderBubbleProps {
  observation: string;
  domain?: string;
  onDismiss: () => void;
  onExpand?: () => void;
  autoHideDelay?: number; // ms, 0 to disable auto-hide
}

export function InsightReminderBubble({ 
  observation, 
  domain,
  onDismiss, 
  onExpand,
  autoHideDelay = 8000 
}: InsightReminderBubbleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.95);
  
  useEffect(() => {
    // Animate in
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
    scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    
    // Auto-hide after delay
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-10, { duration: 200 });
    scale.value = withSequence(
      withTiming(0.95, { duration: 200 }),
      withTiming(0.95, { duration: 0 }, () => {
        runOnJS(onDismiss)();
      })
    );
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  
  // Truncate observation for preview
  const truncatedObservation = observation.length > 100 
    ? observation.substring(0, 97) + '...' 
    : observation;
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>💡</Text>
            <Text style={styles.label}>Pattern you've noticed before</Text>
          </View>
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dismissIcon}>×</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.body}
          onPress={onExpand}
          activeOpacity={onExpand ? 0.7 : 1}
        >
          <Text style={styles.observation}>{truncatedObservation}</Text>
          {domain && (
            <Text style={styles.domain}>{domain}</Text>
          )}
        </TouchableOpacity>
        
        {observation.length > 100 && onExpand && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpand} activeOpacity={0.7}>
            <Text style={styles.expandText}>Tap to see full insight</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Progress bar for auto-hide */}
      {autoHideDelay > 0 && (
        <ProgressBar duration={autoHideDelay} />
      )}
    </Animated.View>
  );
}

// Progress bar component
function ProgressBar({ duration }: { duration: number }) {
  const progress = useSharedValue(1);
  
  useEffect(() => {
    progress.value = withTiming(0, { 
      duration, 
      easing: Easing.linear 
    });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  
  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
}

// Compact version for inline display
interface CompactReminderProps {
  observation: string;
  onDismiss: () => void;
}

export function CompactInsightReminder({ observation, onDismiss }: CompactReminderProps) {
  const truncated = observation.length > 60 
    ? observation.substring(0, 57) + '...' 
    : observation;
  
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>💡</Text>
      <Text style={styles.compactText} numberOfLines={1}>{truncated}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.compactDismiss}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: Radii.lg,
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.30)',
    overflow: 'hidden',
    ...Shadows.soft,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(250,204,21,0.9)',
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(250,204,21,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissIcon: {
    fontSize: 16,
    color: 'rgba(250,204,21,0.8)',
    fontWeight: '500',
    marginTop: -1,
  },
  body: {
    gap: 6,
  },
  observation: {
    fontSize: 14,
    lineHeight: 20,
    color: OraaColors.text,
  },
  domain: {
    fontSize: 11,
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandButton: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
  },
  expandText: {
    fontSize: 12,
    color: OraaColors.blue,
    textAlign: 'center',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(250,204,21,0.15)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(250,204,21,0.5)',
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(250,204,21,0.10)',
    borderRadius: Radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  compactIcon: {
    fontSize: 12,
  },
  compactText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(250,204,21,0.9)',
  },
  compactDismiss: {
    fontSize: 16,
    color: 'rgba(250,204,21,0.6)',
    fontWeight: '500',
  },
});

