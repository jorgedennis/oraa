import { useLocalSearchParams } from 'expo-router';
import { ThreadDetailScreen } from '@/components/screens/thread-detail-screen';

export default function ThreadDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return <ThreadDetailScreen threadId={id} />;
}

