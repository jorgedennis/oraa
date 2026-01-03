import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OraaColors, Radii, Shadows } from '@/constants/theme';
import { Pill } from '@/components/ui/pill';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  messageCount?: number;
  maxMessages?: number;
  onSave?: () => void;
  onMenuPress?: () => void;
}

export function ChatHeader({
  title = 'Oraa',
  subtitle = 'Here with you',
  messageCount,
  maxMessages,
  onSave,
  onMenuPress,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        {/* Left side - Menu button, Avatar and title */}
        <View style={styles.left}>
          {onMenuPress && (
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
              <View style={styles.menuLine} />
            </TouchableOpacity>
          )}
          <View style={styles.avatar}>
            <View style={styles.avatarDot} />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        
        {/* Right side - Message count and save button */}
        <View style={styles.right}>
          {messageCount !== undefined && maxMessages !== undefined && (
            <Pill>{`${messageCount} / ${maxMessages} messages`}</Pill>
          )}
          {onSave && (
            <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.7}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    backgroundColor: OraaColors.surfaceHover,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: OraaColors.text,
  },
  subtitle: {
    fontSize: 12,
    color: OraaColors.textSub,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    backgroundColor: OraaColors.surface,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
});
