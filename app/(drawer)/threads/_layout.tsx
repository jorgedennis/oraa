import { Stack } from 'expo-router';
import { OraaColors } from '@/constants/theme';

export default function ThreadsLayout() {
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
        name="[id]" 
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

