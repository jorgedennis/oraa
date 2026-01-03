import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { OraaLogoStatic } from '@/components/oraa-logo';
import { OraaColors, Radii } from '@/constants/theme';

interface DrawerItemProps {
  icon: string;
  label: string;
  route: string;
  isActive: boolean;
  onPress: () => void;
}

function DrawerItem({ icon, label, route, isActive, onPress }: DrawerItemProps) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.drawerIcon}>{icon}</Text>
      <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>
        {label}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

const DRAWER_ITEMS = [
  { icon: '💬', label: 'Chat', route: '/(drawer)/chat' },
  { icon: '🗺️', label: 'Map', route: '/(drawer)/map' },
  { icon: '✨', label: 'Insights', route: '/(drawer)/insights' },
  { icon: '🧵', label: 'Threads', route: '/(drawer)/threads' },
  { icon: '📔', label: 'Journal', route: '/(drawer)/journal' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  
  const navigateTo = (route: string) => {
    router.push(route as any);
    props.navigation.closeDrawer();
  };
  
  const isRouteActive = (route: string) => {
    return pathname.startsWith(route.replace('/(drawer)', ''));
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoGlyph}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.logoText}>Oraa</Text>
        </View>
        <Text style={styles.tagline}>Your thinking partner</Text>
      </View>
      
      {/* Navigation items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {DRAWER_ITEMS.map((item) => (
          <DrawerItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            route={item.route}
            isActive={isRouteActive(item.route)}
            onPress={() => navigateTo(item.route)}
          />
        ))}
      </ScrollView>
      
      {/* Footer with settings */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigateTo('/(drawer)/settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={styles.settingsLabel}>Settings</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGlyph: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(77,163,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(235,247,255,0.9)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: OraaColors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginTop: 4,
    marginLeft: 48,
  },
  navList: {
    flex: 1,
    paddingTop: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: Radii.lg,
    position: 'relative',
  },
  drawerItemActive: {
    backgroundColor: 'rgba(77,163,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(77,163,255,0.20)',
  },
  drawerIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: OraaColors.textSub,
  },
  drawerLabelActive: {
    color: OraaColors.text,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: OraaColors.blue,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: OraaColors.stroke,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingsIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 15,
    color: OraaColors.textMuted,
  },
  versionContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
});

