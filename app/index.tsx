import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LandingScreen } from '@/components/screens/landing-screen';
import { useAuthStore } from '@/store';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAnonymous, userId, loginAnonymous } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Wait for component to mount before navigating
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only auto-navigate if user is REGISTERED (not anonymous)
  // Anonymous users should always see landing page first
  useEffect(() => {
    if (isMounted && isAuthenticated && !isLoading && !isAnonymous && userId) {
      // Small delay to ensure router is ready
      const timer = setTimeout(() => {
        router.replace('/(drawer)/chat');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted, isAuthenticated, isLoading, isAnonymous, userId, router]);
  
  const handleContinueAnonymously = async () => {
    try {
      await loginAnonymous();
      router.replace('/(drawer)/chat');
    } catch (error) {
      console.error('Anonymous login failed:', error);
    }
  };
  
  const handleCreateAccount = () => {
    router.push('/modal');
  };
  
  // Show landing screen while loading or not mounted
  // Navigation will happen automatically when ready
  return (
    <LandingScreen
      onContinueAnonymously={handleContinueAnonymously}
      onCreateAccount={handleCreateAccount}
    />
  );
}

