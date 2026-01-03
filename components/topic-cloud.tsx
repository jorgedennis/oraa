import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Chip } from '@/components/ui/chip';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Topic data for each row
const ROW_1_TOPICS = [
  { label: 'love', isCore: true },
  { label: 'communication', isCore: false },
  { label: 'relationships', isCore: true },
  { label: 'trust', isCore: false },
  { label: 'breakups', isCore: true },
  { label: 'dating', isCore: false },
  { label: 'boundaries', isCore: false },
  { label: 'jealousy', isCore: false },
  { label: 'attachment', isCore: false },
  { label: 'loneliness', isCore: false },
  { label: 'rejection', isCore: false },
];

const ROW_2_TOPICS = [
  { label: 'anxiety', isCore: true },
  { label: 'stress', isCore: false },
  { label: 'overthinking', isCore: false },
  { label: 'burnout', isCore: true },
  { label: 'self-worth', isCore: false },
  { label: 'confidence', isCore: false },
  { label: 'imposter syndrome', isCore: false },
  { label: 'shame', isCore: false },
  { label: 'guilt', isCore: false },
  { label: 'rumination', isCore: false },
];

const ROW_3_TOPICS = [
  { label: 'family', isCore: true },
  { label: 'grief', isCore: false },
  { label: 'loss', isCore: false },
  { label: 'career', isCore: true },
  { label: 'work pressure', isCore: false },
  { label: 'money', isCore: false },
  { label: 'expectations', isCore: false },
  { label: 'big transitions', isCore: false },
  { label: 'starting over', isCore: false },
  { label: 'feeling stuck', isCore: false },
];

interface MarqueeRowProps {
  topics: Array<{ label: string; isCore: boolean }>;
  direction: 'left' | 'right';
  duration: number;
  opacity?: number;
}

function MarqueeRow({ topics, direction, duration, opacity = 1 }: MarqueeRowProps) {
  const translateX = useSharedValue(0);
  const trackWidth = useRef(0);
  
  // Estimate track width based on topics
  const estimatedWidth = topics.reduce((acc, t) => acc + t.label.length * 8 + 34, 0);
  
  useEffect(() => {
    const targetX = direction === 'left' ? -estimatedWidth : 0;
    const startX = direction === 'left' ? 0 : -estimatedWidth;
    
    translateX.value = startX;
    translateX.value = withRepeat(
      withTiming(targetX, {
        duration: duration * 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [direction, duration, estimatedWidth]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  // Duplicate topics for seamless loop
  const allTopics = [...topics, ...topics];
  
  return (
    <Animated.View style={[styles.marquee, animatedStyle, { opacity }]}>
      {allTopics.map((topic, index) => (
        <Chip key={`${topic.label}-${index}`} label={topic.label} isCore={topic.isCore} />
      ))}
    </Animated.View>
  );
}

export function TopicCloud() {
  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glowOverlay} />
      
      {/* Marquee rows */}
      <MarqueeRow topics={ROW_1_TOPICS} direction="left" duration={85} />
      <MarqueeRow topics={ROW_2_TOPICS} direction="right" duration={110} />
      <MarqueeRow topics={ROW_3_TOPICS} direction="left" duration={140} opacity={0.96} />
      
      {/* Edge fade gradients */}
      <View style={styles.fadeLeft} pointerEvents="none" />
      <View style={styles.fadeRight} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 10,
    borderRadius: Radii.xxl,
    paddingVertical: 10,
    backgroundColor: OraaColors.surfaceHover,
    borderWidth: 1,
    borderColor: OraaColors.surfaceLight,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.soft,
  },
  glowOverlay: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    opacity: 0.85,
  },
  marquee: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  fadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 60,
    backgroundColor: OraaColors.bg,
    opacity: 0.92,
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 60,
    backgroundColor: OraaColors.bg,
    opacity: 0.92,
  },
});

