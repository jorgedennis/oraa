import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatBubble, TypingIndicator } from '@/components/chat/chat-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { ThreadContextBar } from '@/components/chat/thread-indicator';
import { InsightReminderBubble } from '@/components/chat/insight-reminder-bubble';
import { OraaColors } from '@/constants/theme';
import { useChatStore, useAuthStore } from '@/store';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatScreenProps {
  onSave?: () => void;
  onMenuPress?: () => void;
  messageLimit?: number;
}

export function ChatScreen({
  onSave,
  onMenuPress,
  messageLimit = 40,
}: ChatScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  // Get chat and auth state
  const { 
    messages: storeMessages, 
    isSending, 
    error: chatError,
    sendMessage, 
    setError,
    activeThreads,
    inferredThreads,
    removeThreadContext,
    acceptInferredThread,
    currentReminder,
    dismissReminder
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
  
  const handleThreadPress = (threadId: string) => {
    router.push(`/(drawer)/threads/${threadId}`);
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
      
      {/* Thread context bar */}
      <ThreadContextBar
        activeThreads={activeThreads}
        inferredThreads={inferredThreads}
        onRemoveThread={removeThreadContext}
        onAcceptInferred={acceptInferredThread}
        onThreadPress={handleThreadPress}
      />
      
      {/* Soft reminder bubble */}
      {currentReminder && !currentReminder.dismissed && (
        <InsightReminderBubble
          observation={currentReminder.observation}
          domain={currentReminder.domain}
          onDismiss={dismissReminder}
          autoHideDelay={8000}
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
        helperLeft={activeThreads.length > 0 ? `${activeThreads.length} thread${activeThreads.length > 1 ? 's' : ''} active` : "Tap Save to keep this thread."}
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
