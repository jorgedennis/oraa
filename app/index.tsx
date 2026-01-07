import { LandingScreen } from '@/components/screens/landing-screen';
import { useAuthStore } from '@/store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAnonymous, userId, loginAnonymous } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Wait for component to mount before navigating
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Disabled auto-navigation - let users choose to go to chat
  // This allows testing the landing page flow
  // useEffect(() => {
  //   if (isMounted && isAuthenticated && !isLoading && !isAnonymous && userId) {
  //     // Small delay to ensure router is ready
  //     const timer = setTimeout(() => {
  //       router.replace('/(drawer)/chat');
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isMounted, isAuthenticated, isLoading, isAnonymous, userId, router]);
  
  const handleContinueAnonymously = async () => {
    try {
      await loginAnonymous();
      router.replace('/(drawer)/chat');
    } catch (error) {
      console.error('Anonymous login failed:', error);
    }
  };
  
  const handleCreateAccount = () => {
    router.push('/modal?mode=signup');
  };
  
  const handleLogin = () => {
    router.push('/modal?mode=login');
  };
  
  // Show landing screen while loading or not mounted
  // Navigation will happen automatically when ready
  return (
    <LandingScreen
      onContinueAnonymously={handleContinueAnonymously}
      onCreateAccount={handleCreateAccount}
      onLogin={handleLogin}
    />
  );
}

