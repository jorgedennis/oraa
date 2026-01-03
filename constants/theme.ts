/**
 * Oraa Design System - Theme & Colors
 * Dark-first design with blue accent colors
 */

import { Platform } from 'react-native';

// Core Oraa Colors
export const OraaColors = {
  // Backgrounds
  bg: '#070A10',
  bgDark: '#05070C',
  
  // Text
  text: 'rgba(255,255,255,0.92)',
  textSub: 'rgba(255,255,255,0.68)',
  textMuted: 'rgba(255,255,255,0.52)',
  textPlaceholder: 'rgba(255,255,255,0.45)',
  
  // Accent - Blue
  blue: '#4DA3FF',
  blueSoft: 'rgba(77,163,255,0.18)',
  blueGlow: 'rgba(77,163,255,0.45)',
  blueBorder: 'rgba(77,163,255,0.35)',
  blueBorderSoft: 'rgba(77,163,255,0.22)',
  
  // Borders & Strokes
  stroke: 'rgba(255,255,255,0.10)',
  strokeLight: 'rgba(255,255,255,0.12)',
  
  // Surfaces
  surface: 'rgba(255,255,255,0.06)',
  surfaceLight: 'rgba(255,255,255,0.08)',
  surfaceSubtle: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.03)',
  
  // Shadows
  shadowColor: 'rgba(0,0,0,0.55)',
  shadowSoft: 'rgba(0,0,0,0.45)',
  shadowBlue: 'rgba(77,163,255,0.10)',
};

// Shadow presets
export const Shadows = {
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 25,
    elevation: 18,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 10,
  },
  glow: {
    shadowColor: OraaColors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
  },
};

// Border radius presets
export const Radii = {
  xs: 7,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  pill: 999,
};

// Spacing scale
export const Spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 18,
  xxxl: 22,
};

// Legacy Colors export for backwards compatibility
const tintColorLight = '#0a7ea4';
const tintColorDark = OraaColors.blue;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: OraaColors.text,
    background: OraaColors.bg,
    tint: tintColorDark,
    icon: OraaColors.textMuted,
    tabIconDefault: OraaColors.textMuted,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Sora, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
