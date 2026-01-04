import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatBubble, TypingIndicator } from '@/components/chat/chat-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { ThreadIndicator } from '@/components/chat/thread-indicator';
import { OraaColors } from '@/constants/theme';
import { useChatStore, useAuthStore } from '@/store';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ActiveThread {
  id: string;
  title: string;
}

// Demo messages from the HTML template
const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hey. Want to start with the simplest version of it, just one sentence?',
    isUser: false,
  },
  {
    id: '2',
    text: 'I feel on edge and I cannot shut my brain off.',
    isUser: true,
  },
  {
    id: '3',
    text: 'Got it. When that happens, what is the first thing your mind keeps replaying?',
    isUser: false,
  },
  {
    id: '4',
    text: 'That I am falling behind and everyone can tell.',
    isUser: true,
  },
  {
    id: '5',
    text: "That sounds heavy. Let's slow it down: what would \"everyone can tell\" look like in a real moment? 🙂",
    isUser: false,
  },
];

// Demo active thread
const DEMO_THREAD: ActiveThread = {
  id: '1',
  title: 'Career transition anxiety',
};

interface ChatScreenProps {
  onSave?: () => void;
  onMenuPress?: () => void;
  onThreadPress?: (threadId: string) => void;
  messageLimit?: number;
  initialMessages?: Message[];
  activeThread?: ActiveThread | null;
}

export function ChatScreen({
  onSave,
  onMenuPress,
  onThreadPress,
  messageLimit = 40,
  initialMessages = [],
  activeThread = null,
}: ChatScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  
  // Get chat and auth state
  const { 
    messages: storeMessages, 
    isSending, 
    error: chatError,
    sendMessage, 
    clearConversation,
    setError 
  } = useChatStore();
  
  const { usageStatus } = useAuthStore();
  
  // Convert store messages to component format
  const messages: Message[] = storeMessages.map(msg => ({
    id: msg.id,
    text: msg.content,
    isUser: msg.is_user
  }));
  
  // Show error if any
  useEffect(() => {
    if (chatError) {
      Alert.alert('Error', chatError, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [chatError]);
  
  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  const handleSend = async (text: string) => {
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Send failed:', error);
    }
  };
  
  const handleThreadPress = () => {
    if (activeThread && onThreadPress) {
      onThreadPress(activeThread.id);
    }
  };
  
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLastSamePosition = 
      index === messages.length - 1 ||
      messages[index + 1].isUser !== item.isUser;
    
    return (
      <ChatBubble
        message={item.text}
        position={item.isUser ? 'right' : 'left'}
        showAvatar={!item.isUser && isLastSamePosition}
        style={styles.messageItem}
      />
    );
  };
  
  const currentMessageCount = usageStatus?.messages_used || messages.filter(m => m.isUser).length;
  const maxMessages = usageStatus?.messages_limit || messageLimit;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ChatHeader
        title="Oraa"
        subtitle="Here with you"
        messageCount={currentMessageCount}
        maxMessages={maxMessages}
        onSave={onSave}
        onMenuPress={onMenuPress}
      />
      
      {/* Thread indicator */}
      {activeThread && (
        <ThreadIndicator
          threadTitle={activeThread.title}
          onPress={handleThreadPress}
        />
      )}
      
      <FlatList
        ref={flatListRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isSending ? (
            <View style={styles.messageItem}>
              <TypingIndicator />
            </View>
          ) : null
        }
      />
      
      <ChatInput
        onSend={handleSend}
        placeholder="What's on your mind?"
        helperLeft="Tap Save to keep this thread."
        helperRight="Ocean theme"
        disabled={isSending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OraaColors.bg,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageItem: {
    marginBottom: 0,
  },
});
