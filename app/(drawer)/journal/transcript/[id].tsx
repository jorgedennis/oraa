import { useLocalSearchParams } from 'expo-router';
import { TranscriptScreen } from '@/components/screens/transcript-screen';

export default function TranscriptPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return <TranscriptScreen entryId={id} />;
}

