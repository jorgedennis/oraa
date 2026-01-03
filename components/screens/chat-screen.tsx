import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatBubble, TypingIndicator } from '@/components/chat/chat-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { OraaColors } from '@/constants/theme';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
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

interface ChatScreenProps {
  onSave?: () => void;
  messageLimit?: number;
  initialMessages?: Message[];
}

export function ChatScreen({
  onSave,
  messageLimit = 40,
  initialMessages = DEMO_MESSAGES,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate AI typing
    setIsTyping(true);
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
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ChatHeader
        title="Oraa"
        subtitle="Here with you"
        messageCount={messages.length}
        maxMessages={messageLimit}
        onSave={onSave}
      />
      
      <FlatList
        ref={flatListRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
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

