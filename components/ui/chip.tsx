import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OraaColors, Radii, Shadows } from '@/constants/theme';

interface ChipProps {
  label: string;
  isCore?: boolean;
  style?: ViewStyle;
}

export function Chip({ label, isCore = false, style }: ChipProps) {
  return (
    <View style={[styles.container, isCore && styles.core, style]}>
      <Text style={[styles.text, isCore && styles.coreText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: OraaColors.strokeLight,
    backgroundColor: OraaColors.surface,
    ...Shadows.soft,
  },
  core: {
    borderColor: OraaColors.blueBorderSoft,
    backgroundColor: 'rgba(77,163,255,0.09)',
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.15,
    color: 'rgba(255,255,255,0.76)',
  },
  coreText: {
    color: 'rgba(224,241,255,0.92)',
  },
});

