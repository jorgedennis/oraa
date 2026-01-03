import { ChatScreen } from '@/components/screens/chat-screen';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function ChatPage() {
  const navigation = useNavigation();
  
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

