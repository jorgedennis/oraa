import { Stack } from 'expo-router';
import { OraaColors } from '@/constants/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: OraaColors.bg,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="transcript/[id]" 
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

