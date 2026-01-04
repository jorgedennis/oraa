import { useEffect } from 'react';
import { ChatScreen } from '@/components/screens/chat-screen';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useChatStore, useConversationsStore } from '@/store';

export default function NewChatPage() {
  const navigation = useNavigation();
  const { clearConversation } = useChatStore();
  const { selectConversation } = useConversationsStore();
  
  // Clear any existing conversation when entering new chat
  useEffect(() => {
    clearConversation();
    selectConversation(null);
  }, []);
  
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

