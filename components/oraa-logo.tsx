import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { OraaColors } from '@/constants/theme';

interface OraaLogoProps {
  size?: number;
  animated?: boolean;
}

// Dot positions for the final constellation
const DOT_POSITIONS = [
  { x: 38, y: 0, opacity: 0.9 },
  { x: 19, y: 33, opacity: 0.75 },
  { x: -19, y: 33, opacity: 0.75 },
  { x: -38, y: 0, opacity: 0.9 },
  { x: -19, y: -33, opacity: 0.65 },
  { x: 19, y: -33, opacity: 0.65 },
  { x: 0, y: 19, opacity: 0.7 },
  { x: 16, y: -10, opacity: 0.6 },
  { x: -16, y: -10, opacity: 0.6 },
];

const DOT_RADIUS = 2.55;
const CENTER_RADIUS = 3.4;
const ANIMATION_DURATION = 3000;
const SETTLE_DURATION = 5000;
const SCATTER_DURATION = 800;

interface DotProps {
  index: number;
  targetX: number;
  targetY: number;
  targetOpacity: number;
  progress: Animated.SharedValue<number>;
  size: number;
}

function AnimatedDot({ index, targetX, targetY, targetOpacity, progress, size }: DotProps) {
  const scale = size / 140;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Random starting angle for orbit
  const startAngle = (index * 40 + 15) * (Math.PI / 180);
  const orbitRadius = 35 * scale;
  
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    
    // Orbital motion that converges to final position
    const angle = startAngle + (1 - p) * Math.PI * 2 * (1 + index * 0.1);
    const orbitX = Math.cos(angle) * orbitRadius * (1 - p);
    const orbitY = Math.sin(angle) * orbitRadius * (1 - p);
    
    const finalX = targetX * scale;
    const finalY = targetY * scale;
    
    const x = interpolate(p, [0, 1], [orbitX, finalX]);
    const y = interpolate(p, [0, 1], [orbitY, finalY]);
    const opacity = interpolate(p, [0, 0.3, 1], [0.3, 0.5, targetOpacity]);
    
    return {
      transform: [
        { translateX: centerX + x - DOT_RADIUS * scale },
        { translateY: centerY + y - DOT_RADIUS * scale },
      ],
      opacity,
    };
  });
  
  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: DOT_RADIUS * 2 * scale,
          height: DOT_RADIUS * 2 * scale,
          borderRadius: DOT_RADIUS * scale,
        },
        animatedStyle,
      ]}
    />
  );
}

function AnimatedCenter({ progress, size }: { progress: Animated.SharedValue<number>; size: number }) {
  const scale = size / 140;
  const centerX = size / 2;
  const centerY = size / 2;
  
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    // Pulse effect near the end
    const pulseGate = Math.max(0, (p - 0.82) / 0.18);
    const pulse = Math.sin(pulseGate * Math.PI);
    const radius = CENTER_RADIUS * scale * (1 + 0.16 * pulse * pulse);
    
    return {
      width: radius * 2,
      height: radius * 2,
      borderRadius: radius,
      transform: [
        { translateX: centerX - radius },
        { translateY: centerY - radius },
      ],
      opacity: interpolate(p, [0, 0.2], [0.6, 1]),
    };
  });
  
  return <Animated.View style={[styles.center, animatedStyle]} />;
}

export function OraaLogo({ size = 140, animated = true }: OraaLogoProps) {
  const progress = useSharedValue(animated ? 0 : 1);
  
  useEffect(() => {
    if (animated) {
      // Animation sequence: resolve → hold → scatter → repeat
      progress.value = withRepeat(
        withSequence(
          // Resolve: dots converge to constellation (3s)
          withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          // Hold: stay settled (5s)
          withDelay(SETTLE_DURATION, withTiming(1, { duration: 0 })),
          // Scatter: dots disperse back (0.8s)
          withTiming(0, {
            duration: SCATTER_DURATION,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
          }),
          // Brief pause before repeating
          withDelay(500, withTiming(0, { duration: 0 }))
        ),
        -1, // Repeat infinitely
        false // Don't reverse
      );
    }
  }, [animated]);
  
  const scale = size / 140;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect */}
      <View style={[styles.glow, { width: size, height: size }]} />
      
      {/* Animated dots */}
      {DOT_POSITIONS.map((dot, index) => (
        <AnimatedDot
          key={index}
          index={index}
          targetX={dot.x}
          targetY={dot.y}
          targetOpacity={dot.opacity}
          progress={progress}
          size={size}
        />
      ))}
      
      {/* Center dot */}
      <AnimatedCenter progress={progress} size={size} />
    </View>
  );
}

// Static version without animation for smaller use cases
export function OraaLogoStatic({ size = 26 }: { size?: number }) {
  const scale = size / 140;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return (
    <View style={[styles.staticContainer, { width: size, height: size }]}>
      {DOT_POSITIONS.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: DOT_RADIUS * 2 * scale,
              height: DOT_RADIUS * 2 * scale,
              borderRadius: DOT_RADIUS * scale,
              opacity: dot.opacity,
              position: 'absolute',
              left: centerX + dot.x * scale - DOT_RADIUS * scale,
              top: centerY + dot.y * scale - DOT_RADIUS * scale,
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.center,
          {
            width: CENTER_RADIUS * 2 * scale,
            height: CENTER_RADIUS * 2 * scale,
            borderRadius: CENTER_RADIUS * scale,
            position: 'absolute',
            left: centerX - CENTER_RADIUS * scale,
            top: centerY - CENTER_RADIUS * scale,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  staticContainer: {
    position: 'relative',
    backgroundColor: `radial-gradient(circle at 40% 35%, ${OraaColors.blue}, rgba(77,163,255,0.14))`,
  },
  glow: {
    position: 'absolute',
    opacity: 0.3,
  },
  dot: {
    position: 'absolute',
    backgroundColor: OraaColors.text,
  },
  center: {
    position: 'absolute',
    backgroundColor: OraaColors.text,
  },
});

