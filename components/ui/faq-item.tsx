import React, { useState } from 'react';
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
}

export function FAQItem({
  question,
  answer,
  defaultOpen = false,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 45 : 0);
  
  const toggleOpen = () => {
    LayoutAnimation.configureNext({
      duration: 250,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 45, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };
  
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
          <Text style={styles.answer}>{answer}</Text>
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
});
