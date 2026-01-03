import { useRouter } from 'expo-router';
import { LandingScreen } from '@/components/screens/landing-screen';

export default function LandingPage() {
  const router = useRouter();
  
  const handleContinueAnonymously = () => {
    router.replace('/(drawer)/chat');
  };
  
  const handleCreateAccount = () => {
    // TODO: Implement account creation flow
    router.replace('/(drawer)/chat');
  };
  
  return (
    <LandingScreen
      onContinueAnonymously={handleContinueAnonymously}
      onCreateAccount={handleCreateAccount}
    />
  );
}

