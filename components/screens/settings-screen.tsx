import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  showChevron = true,
  showSwitch = false,
  switchValue = false,
  onPress,
  onSwitchChange,
  destructive = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={showSwitch ? 1 : 0.7}
      disabled={showSwitch}
    >
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <Text style={[styles.settingsLabel, destructive && styles.settingsLabelDestructive]}>
          {label}
        </Text>
      </View>
      
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: OraaColors.stroke, true: OraaColors.blue }}
            thumbColor="white"
          />
        )}
        {showChevron && !showSwitch && (
          <Text style={styles.settingsChevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { isAnonymous, email, usageStatus, logout } = useAuthStore();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const handleCreateAccount = () => {
    router.push('/modal');
  };
  
  const handleLogin = () => {
    router.push('/modal');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will lose access to your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout() 
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Account">
          <SettingsItem
            icon="👤"
            label="Profile"
            value={isAnonymous ? 'Anonymous' : (email || 'User')}
            onPress={() => console.log('Profile')}
          />
          {isAnonymous ? (
            <>
              <SettingsItem
                icon="🔐"
                label="Create account"
                onPress={handleCreateAccount}
              />
              <SettingsItem
                icon="🔑"
                label="Login"
                onPress={handleLogin}
              />
            </>
          ) : (
            <>
              <SettingsItem
                icon="✉️"
                label="Email"
                value={email || 'Not set'}
                onPress={() => console.log('Email')}
              />
              <SettingsItem
                icon="🚪"
                label="Logout"
                destructive
                onPress={handleLogout}
              />
            </>
          )}
        </SettingsSection>
        
        <SettingsSection title="Usage">
          <SettingsItem
            icon="💬"
            label="Messages used"
            value={`${usageStatus?.messages_used || 0} / ${usageStatus?.messages_limit || 10}`}
            showChevron={false}
          />
          <SettingsItem
            icon="📊"
            label="Account type"
            value={isAnonymous ? 'Anonymous' : 'Registered'}
            showChevron={false}
          />
        </SettingsSection>
        
        <SettingsSection title="Privacy">
          <SettingsItem
            icon="🔒"
            label="Data & Privacy"
            onPress={() => console.log('Privacy')}
          />
          <SettingsItem
            icon="📤"
            label="Export my data"
            onPress={() => console.log('Export')}
          />
          <SettingsItem
            icon="🗑️"
            label="Delete all conversations"
            destructive
            onPress={() => console.log('Delete')}
          />
        </SettingsSection>
        
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="🔔"
            label="Notifications"
            showSwitch
            switchValue={true}
            onSwitchChange={(v) => console.log('Notifications:', v)}
          />
          <SettingsItem
            icon="🎨"
            label="Theme"
            value="Ocean"
            onPress={() => console.log('Theme')}
          />
        </SettingsSection>
        
        <SettingsSection title="About">
          <SettingsItem
            icon="📖"
            label="How Oraa works"
            onPress={() => console.log('About')}
          />
          <SettingsItem
            icon="📜"
            label="Terms of Service"
            onPress={() => console.log('Terms')}
          />
          <SettingsItem
            icon="🛡️"
            label="Privacy Policy"
            onPress={() => console.log('Privacy Policy')}
          />
          <SettingsItem
            icon="💙"
            label="Crisis resources"
            onPress={() => console.log('Crisis')}
          />
        </SettingsSection>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Oraa v1.0.0</Text>
          <Text style={styles.tagline}>Your thinking partner</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: OraaColors.textSub,
    borderRadius: 1,
  },
  menuLineShort: {
    width: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: OraaColors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: OraaColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: OraaColors.surface,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsLabel: {
    fontSize: 15,
    color: OraaColors.text,
  },
  settingsLabelDestructive: {
    color: 'rgba(248,113,113,0.9)',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
  settingsChevron: {
    fontSize: 22,
    color: OraaColors.textMuted,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  version: {
    fontSize: 13,
    color: OraaColors.textMuted,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
});

