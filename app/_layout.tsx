import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { OraaColors } from '@/constants/theme';

// Custom dark theme for Oraa
const OraaDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: OraaColors.bg,
    card: OraaColors.bg,
    text: OraaColors.text,
    border: OraaColors.stroke,
    primary: OraaColors.blue,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={OraaDarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(drawer)" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
