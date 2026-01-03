import { useRouter } from 'expo-router';
import { ChatScreen } from '@/components/screens/chat-screen';

export default function ChatPage() {
  const router = useRouter();
  
  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save conversation');
  };
  
  return (
    <ChatScreen
      onSave={handleSave}
      messageLimit={40}
    />
  );
}

