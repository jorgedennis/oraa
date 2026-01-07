import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContent } from '@/components/navigation/drawer-content';
import { OraaColors } from '@/constants/theme';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: OraaColors.bg,
            width: 280,
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.7)',
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: 'Chat',
            title: 'Chat',
          }}
        />
        <Drawer.Screen
          name="map"
          options={{
            drawerLabel: 'Map',
            title: 'Map',
          }}
        />
        <Drawer.Screen
          name="insights"
          options={{
            drawerLabel: 'Insights',
            title: 'Insights',
          }}
        />
        <Drawer.Screen
          name="threads"
          options={{
            drawerLabel: 'Threads',
            title: 'Threads',
          }}
        />
        <Drawer.Screen
          name="journal"
          options={{
            drawerLabel: 'Journal',
            title: 'Journal',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'Settings',
          }}
        />
        <Drawer.Screen
          name="romance"
          options={{
            drawerLabel: 'Romance & Love',
            title: 'Romance & Love',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

