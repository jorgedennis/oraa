import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { OraaLogoStatic } from '@/components/oraa-logo';

type BubblePosition = 'left' | 'right';

interface ChatBubbleProps {
  message: string;
  position: BubblePosition;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export function ChatBubble({
  message,
  position,
  showAvatar = true,
  style,
}: ChatBubbleProps) {
  const isLeft = position === 'left';
  
  return (
    <View style={[styles.row, isLeft ? styles.rowLeft : styles.rowRight, style]}>
      {isLeft && showAvatar && (
        <View style={styles.avatar}>
          <View style={styles.avatarDot} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isLeft ? styles.bubbleLeft : styles.bubbleRight,
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

interface TypingIndicatorProps {
  showAvatar?: boolean;
}

export function TypingIndicator({ showAvatar = true }: TypingIndicatorProps) {
  return (
    <View style={[styles.row, styles.rowLeft]}>
      {showAvatar && (
        <View style={styles.avatar}>
          <View style={styles.avatarDot} />
        </View>
      )}
      <View style={[styles.bubble, styles.bubbleLeft]}>
        <View style={styles.typing}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: Radii.sm,
    backgroundColor: OraaColors.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(235,247,255,0.92)',
    opacity: 0.9,
  },
  bubble: {
    maxWidth: 270,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    backgroundColor: OraaColors.surface,
    ...Shadows.soft,
  },
  bubbleLeft: {
    borderBottomLeftRadius: 8,
  },
  bubbleRight: {
    borderColor: OraaColors.blueBorderSoft,
    backgroundColor: 'rgba(77,163,255,0.11)',
    borderBottomRightRadius: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 18.9,
    color: OraaColors.text,
  },
  typing: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  dot1: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dot2: {
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  dot3: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});

