import { useRouter } from 'expo-router';
import { LandingScreen } from '@/components/screens/landing-screen';

export default function HomeScreen() {
  const router = useRouter();
  
  const handleContinueAnonymously = () => {
    router.push('/chat');
  };
  
  const handleCreateAccount = () => {
    // TODO: Implement account creation flow
    router.push('/chat');
  };
  
  return (
    <LandingScreen
      onContinueAnonymously={handleContinueAnonymously}
      onCreateAccount={handleCreateAccount}
    />
  );
}
