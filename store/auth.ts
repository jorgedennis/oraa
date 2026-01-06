import { authAPI, UsageStatus } from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  // State
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  deviceId: string | null;
  sessionId: string | null;
  userId: string | null;
  email: string | null;
  jwt: string | null;
  usageStatus: UsageStatus | null;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  loginAnonymous: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsageStatus: (status: UsageStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      isAuthenticated: false,
      isAnonymous: false,
      isLoading: false,
      deviceId: null,
      sessionId: null,
      userId: null,
      email: null,
      jwt: null,
      usageStatus: null,
      error: null,

      // Initialize - called on app start
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get or create device ID
          let deviceId = get().deviceId;
          if (!deviceId) {
            deviceId = randomUUID();
            set({ deviceId });
          }
          
          // If already has a registered user session, restore it
          if (get().userId && get().jwt) {
            set({ 
              isLoading: false, 
              isAuthenticated: true, 
              isAnonymous: false 
            });
            return;
          }
          
          // If already has anonymous session, restore it (but don't auto-navigate)
          if (get().sessionId) {
            set({ 
              isLoading: false, 
              isAuthenticated: true, 
              isAnonymous: true 
            });
            return;
          }
          
          // No existing session - don't create one automatically
          // User will choose to continue anonymously or sign up
          set({ isLoading: false, isAuthenticated: false, isAnonymous: false });
        } catch (error: any) {
          console.error('Initialize error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      // Login as anonymous user
      loginAnonymous: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // If already have an anonymous session, just restore it
          if (get().sessionId && get().isAnonymous) {
            set({
              isAuthenticated: true,
              isAnonymous: true,
              isLoading: false,
              error: null
            });
            return;
          }
          
          const deviceId = get().deviceId || randomUUID();
          set({ deviceId });
          
          const response = await authAPI.getSession(deviceId);
          
          if (response.success && response.session_id) {
            set({
              isAuthenticated: true,
              isAnonymous: true,
              sessionId: response.session_id,
              usageStatus: response.usage_status || null,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Failed to create session');
          }
        } catch (error: any) {
          console.error('Anonymous login error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Sign up new user
      signup: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authAPI.signup(email, password);
          
          if (response.success && response.user_id && response.jwt) {
            set({
              isAuthenticated: true,
              isAnonymous: false,
              userId: response.user_id,
              email: response.email || email,
              jwt: response.jwt,
              sessionId: null, // Clear anonymous session
              usageStatus: null, // Will be fetched on first message
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Signup failed');
          }
        } catch (error: any) {
          console.error('Signup error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Login existing user
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authAPI.login(email, password);
          
          if (response.success && response.user_id && response.jwt) {
            set({
              isAuthenticated: true,
              isAnonymous: false,
              userId: response.user_id,
              email: response.email || email,
              jwt: response.jwt,
              sessionId: null, // Clear anonymous session
              usageStatus: null,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          set({
            isAuthenticated: false,
            isAnonymous: false,
            userId: null,
            email: null,
            jwt: null,
            sessionId: null,
            usageStatus: null,
            error: null
          });
          
          // Create new anonymous session
          await get().loginAnonymous();
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ error: error.message });
        }
      },

      // Update usage status (called after sending messages)
      updateUsageStatus: (status: UsageStatus) => {
        set({ usageStatus: status });
      }
    }),
    {
      name: 'oraa-auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

