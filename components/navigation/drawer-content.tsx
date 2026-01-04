import React, { useState, useEffect } from 'react';
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
import { OraaColors, Radii } from '@/constants/theme';
import { useConversationsStore, Conversation } from '@/store';

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

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onPress: () => void;
}

function ConversationItem({ conversation, isActive, onPress }: ConversationItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <TouchableOpacity
      style={[styles.conversationItem, isActive && styles.conversationItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.conversationIcon}>📝</Text>
      <View style={styles.conversationContent}>
        <Text 
          style={[styles.conversationPreview, isActive && styles.conversationPreviewActive]}
          numberOfLines={1}
        >
          {conversation.preview || 'Untitled conversation'}
        </Text>
        <Text style={styles.conversationMeta}>
          {formatDate(conversation.started_at)} • {conversation.message_count} msgs
        </Text>
      </View>
      {isActive && <View style={styles.conversationActiveIndicator} />}
    </TouchableOpacity>
  );
}

const DRAWER_ITEMS = [
  { icon: '🗺️', label: 'Map', route: '/(drawer)/map' },
  { icon: '✨', label: 'Insights', route: '/(drawer)/insights' },
  { icon: '🧵', label: 'Threads', route: '/(drawer)/threads' },
  { icon: '📔', label: 'Journal', route: '/(drawer)/journal' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [chatExpanded, setChatExpanded] = useState(false);
  
  const { 
    conversations, 
    isLoading, 
    currentConversationId,
    fetchConversations, 
    selectConversation 
  } = useConversationsStore();
  
  const isChatScreen = pathname.startsWith('/(drawer)/chat');
  
  // Auto-expand when on chat screen
  useEffect(() => {
    if (isChatScreen) {
      setChatExpanded(true);
      fetchConversations();
    }
  }, [isChatScreen]);
  
  const navigateTo = (route: string) => {
    router.push(route as any);
    props.navigation.closeDrawer();
  };
  
  const isRouteActive = (route: string) => {
    return pathname.startsWith(route.replace('/(drawer)', ''));
  };
  
  const handleChatPress = () => {
    if (chatExpanded) {
      setChatExpanded(false);
    } else {
      setChatExpanded(true);
      fetchConversations();
    }
  };
  
  const handleNewChat = () => {
    selectConversation(null);
    router.push('/(drawer)/chat');
    props.navigation.closeDrawer();
  };
  
  const handleConversationPress = (conversationId: string) => {
    selectConversation(conversationId);
    router.push(`/(drawer)/chat/${conversationId}`);
    props.navigation.closeDrawer();
  };
  
  // Max 8 conversations visible, then scrollable
  const visibleConversations = conversations.slice(0, 8);
  const hasMoreConversations = conversations.length > 8;
  
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
      
      {/* Chat Section - Expandable */}
      <View style={styles.chatSection}>
        <TouchableOpacity
          style={[styles.drawerItem, isChatScreen && styles.drawerItemActive]}
          onPress={handleChatPress}
          activeOpacity={0.7}
        >
          <Text style={styles.drawerIcon}>💬</Text>
          <Text style={[styles.drawerLabel, isChatScreen && styles.drawerLabelActive]}>
            Chat
          </Text>
          <Text style={styles.expandIcon}>
            {chatExpanded ? '▼' : '▶'}
          </Text>
          {isChatScreen && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        {/* Expanded Conversation List */}
        {chatExpanded && (
          <View style={styles.conversationsDropdown}>
            {/* New Chat Button - Distinct styling */}
            <TouchableOpacity
              style={styles.newConversationButton}
              onPress={handleNewChat}
              activeOpacity={0.7}
            >
              <Text style={styles.newConversationIcon}>➕</Text>
              <Text style={styles.newConversationLabel}>New conversation</Text>
            </TouchableOpacity>
            
            {/* Separator */}
            <View style={styles.separator} />
            
            {/* Conversation List - Scrollable, max 8 visible */}
            <ScrollView 
              style={styles.conversationsList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : visibleConversations.length > 0 ? (
                <>
                  {visibleConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={currentConversationId === conv.id}
                      onPress={() => handleConversationPress(conv.id)}
                    />
                  ))}
                  {hasMoreConversations && (
                    <Text style={styles.moreConversationsText}>
                      +{conversations.length - 8} more conversations
                    </Text>
                  )}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No conversations yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
      
      {/* Other Navigation Items */}
      <ScrollView 
        style={styles.navList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navListContent}
      >
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
  chatSection: {
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    paddingBottom: 8,
  },
  navList: {
    flex: 1,
  },
  navListContent: {
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
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: OraaColors.textSub,
  },
  drawerLabelActive: {
    color: OraaColors.text,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 10,
    color: OraaColors.textMuted,
    marginLeft: 8,
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: OraaColors.blue,
  },
  conversationsDropdown: {
    marginLeft: 20,
    marginRight: 12,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: OraaColors.stroke,
    overflow: 'hidden',
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
    borderStyle: 'dashed',
  },
  newConversationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  newConversationLabel: {
    fontSize: 15,
    color: OraaColors.blue,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: OraaColors.stroke,
    marginVertical: 4,
  },
  conversationsList: {
    maxHeight: 400, // Max height for ~8 conversations
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  conversationItemActive: {
    backgroundColor: 'rgba(77,163,255,0.15)',
  },
  conversationIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationPreview: {
    fontSize: 14,
    color: OraaColors.textSub,
    marginBottom: 2,
  },
  conversationPreviewActive: {
    color: OraaColors.text,
    fontWeight: '500',
  },
  conversationMeta: {
    fontSize: 11,
    color: OraaColors.textMuted,
  },
  conversationActiveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: OraaColors.blue,
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: OraaColors.textMuted,
  },
  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: OraaColors.textMuted,
    fontStyle: 'italic',
  },
  moreConversationsText: {
    fontSize: 12,
    color: OraaColors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontStyle: 'italic',
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
