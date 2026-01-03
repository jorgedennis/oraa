import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OraaColors, Radii } from '@/constants/theme';

interface PillProps {
  children: ReactNode;
  icon?: ReactNode;
  style?: ViewStyle;
}

export function Pill({ children, icon, style }: PillProps) {
  return (
    <View style={[styles.container, style]}>
      {icon}
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    backgroundColor: OraaColors.surfaceLight,
    borderWidth: 1,
    borderColor: OraaColors.strokeLight,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.70)',
  },
});

