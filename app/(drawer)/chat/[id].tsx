import { useEffect } from 'react';
import { ChatScreen } from '@/components/screens/chat-screen';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useChatStore, useConversationsStore } from '@/store';

export default function ConversationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { loadConversation } = useChatStore();
  const { selectConversation } = useConversationsStore();
  
  useEffect(() => {
    if (id) {
      selectConversation(id);
      loadConversation(id);
    }
  }, [id]);
  
  const handleSave = () => {
    console.log('Save conversation');
  };
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  return (
    <ChatScreen
      onSave={handleSave}
      messageLimit={40}
      onMenuPress={openDrawer}
    />
  );
}

