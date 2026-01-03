import { Chip } from '@/components/ui/chip';
import { Shadows } from '@/constants/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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

// Gradient mask element - fades content at edges
function FadeMask() {
  return (
    <LinearGradient
      colors={['transparent', 'black', 'black', 'transparent']}
      locations={[0, 0.14, 0.86, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function TopicCloud() {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Masked viewport - fades the content itself, not an overlay */}
      <MaskedView
        style={styles.maskedView}
        maskElement={<FadeMask />}
        pointerEvents="none"
      >
        <View style={styles.viewport}>
          <MarqueeRow topics={ROW_1_TOPICS} direction="left" duration={85} />
          <MarqueeRow topics={ROW_2_TOPICS} direction="right" duration={110} />
          <MarqueeRow topics={ROW_3_TOPICS} direction="left" duration={140} opacity={0.96} />
        </View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    ...Shadows.soft,
  },
  maskedView: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  viewport: {
    paddingVertical: 10,
    borderRadius: 28,
    overflow: 'hidden',
  },
  marquee: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
});
