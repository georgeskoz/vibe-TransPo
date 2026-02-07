import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isDriver: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthStore {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;

  // Persistence
  loadAuth: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Storage keys
const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKENS_KEY = 'auth_tokens';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  status: 'idle',
  isLoading: false,
  error: null,

  // Setters
  setUser: (user) => set({ user }),
  setTokens: (tokens) => set({ tokens }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),

  // Login with email/password
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/auth/login', { email, password });

      // Mock successful login for demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        firstName: 'Jean-Pierre',
        lastName: 'Tremblay',
        isDriver: false,
        isVerified: true,
        createdAt: new Date(),
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(mockTokens));

      set({
        user: mockUser,
        tokens: mockTokens,
        status: 'authenticated',
        isLoading: false
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
        status: 'unauthenticated'
      });
      return false;
    }
  },

  // Login with phone + OTP
  loginWithPhone: async (phone, otp) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock verification
      if (otp !== '123456' && otp.length !== 6) {
        throw new Error('Invalid OTP code');
      }

      const mockUser: User = {
        id: 'user_' + Date.now(),
        email: '',
        phone,
        firstName: 'Utilisateur',
        lastName: 'QuébecTaxi',
        isDriver: false,
        isVerified: true,
        createdAt: new Date(),
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(mockTokens));

      set({
        user: mockUser,
        tokens: mockTokens,
        status: 'authenticated',
        isLoading: false
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Phone login failed',
        isLoading: false
      });
      return false;
    }
  },

  // Login with Google OAuth
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: 'google_user_' + Date.now(),
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        isDriver: false,
        isVerified: true,
        createdAt: new Date(),
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock_google_token_' + Date.now(),
        refreshToken: 'mock_google_refresh_' + Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(mockTokens));

      set({
        user: mockUser,
        tokens: mockTokens,
        status: 'authenticated',
        isLoading: false
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Google login failed',
        isLoading: false
      });
      return false;
    }
  },

  // Register new user
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: 'user_' + Date.now(),
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        isDriver: false,
        isVerified: false,
        createdAt: new Date(),
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(mockTokens));

      set({
        user: mockUser,
        tokens: mockTokens,
        status: 'authenticated',
        isLoading: false
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false
      });
      return false;
    }
  },

  // Send OTP to phone
  sendOTP: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with Twilio API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would send an actual SMS
      console.log(`OTP sent to ${phone}`);

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send OTP',
        isLoading: false
      });
      return false;
    }
  },

  // Verify OTP
  verifyOTP: async (phone, otp) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: accept any 6-digit code or "123456"
      if (otp.length !== 6) {
        throw new Error('Invalid OTP format');
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'OTP verification failed',
        isLoading: false
      });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      // Clear all auth data
      await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_TOKENS_KEY]);

      set({
        user: null,
        tokens: null,
        status: 'unauthenticated',
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Refresh tokens
  refreshTokens: async () => {
    const { tokens } = get();
    if (!tokens?.refreshToken) return false;

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTokens: AuthTokens = {
        accessToken: 'refreshed_token_' + Date.now(),
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + 3600000,
      };

      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(newTokens));
      set({ tokens: newTokens });

      return true;
    } catch (error) {
      // If refresh fails, logout
      await get().logout();
      return false;
    }
  },

  // Load auth state from storage
  loadAuth: async () => {
    set({ isLoading: true, status: 'loading' });
    try {
      const [userJson, tokensJson] = await AsyncStorage.multiGet([
        AUTH_USER_KEY,
        AUTH_TOKENS_KEY
      ]);

      const user = userJson[1] ? JSON.parse(userJson[1]) : null;
      const tokens = tokensJson[1] ? JSON.parse(tokensJson[1]) : null;

      if (user && tokens) {
        // Check if token is expired
        if (tokens.expiresAt < Date.now()) {
          // Try to refresh
          const refreshed = await get().refreshTokens();
          if (!refreshed) {
            set({ status: 'unauthenticated', isLoading: false });
            return;
          }
        }

        set({
          user,
          tokens,
          status: 'authenticated',
          isLoading: false
        });
      } else {
        set({ status: 'unauthenticated', isLoading: false });
      }
    } catch (error) {
      set({ status: 'unauthenticated', isLoading: false });
    }
  },

  // Clear all auth data
  clearAuth: async () => {
    await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_TOKENS_KEY]);
    set({
      user: null,
      tokens: null,
      status: 'unauthenticated',
      error: null
    });
  },
}));

// Helper hook for auth status
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading,
    error,
    status,
  };
}
