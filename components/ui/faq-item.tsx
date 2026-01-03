import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
  typewriterEffect?: boolean;
}

export function FAQItem({
  question,
  answer,
  defaultOpen = false,
  typewriterEffect = true,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [displayedText, setDisplayedText] = useState(typewriterEffect ? '' : answer);
  const [hasTyped, setHasTyped] = useState(!typewriterEffect);
  const rotation = useSharedValue(defaultOpen ? 45 : 0);
  const typewriterIndex = useRef(0);
  
  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 45, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };
  
  // Typewriter effect when opening for the first time
  useEffect(() => {
    if (isOpen && typewriterEffect && !hasTyped) {
      typewriterIndex.current = 0;
      setDisplayedText('');
      
      const interval = setInterval(() => {
        typewriterIndex.current += 1;
        if (typewriterIndex.current <= answer.length) {
          setDisplayedText(answer.slice(0, typewriterIndex.current));
        } else {
          clearInterval(interval);
          setHasTyped(true);
        }
      }, 15);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, typewriterEffect, hasTyped, answer]);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleOpen}
        activeOpacity={0.8}
      >
        <Text style={styles.question}>{question}</Text>
        <Animated.Text style={[styles.icon, iconAnimatedStyle]}>+</Animated.Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.content}>
          <Text style={styles.answer}>
            {hasTyped ? answer : displayedText}
            {!hasTyped && <Text style={styles.cursor}>|</Text>}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: OraaColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.md,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  containerOpen: {
    backgroundColor: OraaColors.surface,
    borderColor: OraaColors.blueBorderSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  question: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  icon: {
    fontSize: 16,
    fontWeight: '400',
    color: OraaColors.textPlaceholder,
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  answer: {
    fontSize: 13,
    lineHeight: 19.5,
    color: OraaColors.textSub,
  },
  cursor: {
    color: OraaColors.blue,
    fontWeight: '300',
  },
});

