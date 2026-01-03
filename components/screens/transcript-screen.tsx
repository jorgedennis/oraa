import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { OraaColors } from '@/constants/theme';

// Mock data for a conversation transcript
const TRANSCRIPT_DATA = {
  date: 'Dec 28, 2025',
  messages: [
    { id: '1', text: 'Hey. How are you feeling after the holiday visit?', isUser: false },
    { id: '2', text: 'Exhausted honestly. Like physically drained.', isUser: true },
    { id: '3', text: 'That kind of exhaustion often isn\'t just physical. What was the hardest part?', isUser: false },
    { id: '4', text: 'I don\'t know. Everything felt like a performance. Like I had to be the version of me they want.', isUser: true },
    { id: '5', text: 'That sounds tiring—holding that up for days. Who do they want you to be?', isUser: false },
    { id: '6', text: 'Successful. Put together. Not struggling with anything. Definitely not in therapy.', isUser: true },
    { id: '7', text: 'And who were you actually being while you were there?', isUser: false },
    { id: '8', text: 'Someone who smiles a lot and changes the subject when things get real.', isUser: true },
    { id: '9', text: 'There\'s a gap there—between how you wanted to show up and how you actually did. What\'s in that gap for you?', isUser: false },
    { id: '10', text: 'Grief maybe? For the relationship I wish I had with them.', isUser: true },
    { id: '11', text: 'That\'s a real insight. The grief is for something that doesn\'t exist—the version of them who could see the real you. 💙', isUser: false },
  ],
};

interface TranscriptScreenProps {
  entryId?: string;
}

export function TranscriptScreen({ entryId }: TranscriptScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Journal</Text>
        </TouchableOpacity>
        <Text style={styles.date}>{TRANSCRIPT_DATA.date}</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messageList}>
          {TRANSCRIPT_DATA.messages.map((message, index) => {
            const isLastSamePosition = 
              index === TRANSCRIPT_DATA.messages.length - 1 ||
              TRANSCRIPT_DATA.messages[index + 1].isUser !== message.isUser;
            
            return (
              <ChatBubble
                key={message.id}
                message={message.text}
                position={message.isUser ? 'right' : 'left'}
                showAvatar={!message.isUser && isLastSamePosition}
              />
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: OraaColors.stroke,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backIcon: {
    fontSize: 28,
    color: OraaColors.blue,
    fontWeight: '300',
    marginTop: -2,
  },
  backText: {
    fontSize: 16,
    color: OraaColors.blue,
  },
  date: {
    fontSize: 14,
    color: OraaColors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  messageList: {
    gap: 12,
  },
});

