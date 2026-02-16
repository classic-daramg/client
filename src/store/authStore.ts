import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  setAuthCookies,
  clearAuthCookies,
  isTokenExpired,
  getUserIdFromToken as getUserIdFromUtils
} from '@/lib/tokenUtils';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUserId: (userId: string | null) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  getUserIdFromToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },

      setRefreshToken: (token: string | null) => {
        set({ refreshToken: token });
      },

      setTokens: (accessToken: string | null, refreshToken: string | null) => {
        set({ accessToken, refreshToken });
        if (accessToken && refreshToken) {
          setAuthCookies(accessToken, refreshToken);
          const derivedUserId = getUserIdFromUtils(accessToken);
          if (derivedUserId) {
            set({ userId: derivedUserId });
          }
        }
      },

      setUserId: (userId: string | null) => set({ userId }),

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, userId: null });
        clearAuthCookies();
      },

      isAuthenticated: () => {
        const token = get().accessToken;
        if (!token) return false;
        return !isTokenExpired(token);
      },

      getUserIdFromToken: () => {
        const state = get();
        if (state.userId) return state.userId;

        const token = state.accessToken;
        if (!token) return null;
        return getUserIdFromUtils(token);
      },
    }),
    {
      name: 'auth-store',
      partialize: (state: AuthState) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId
      }),
    }
  )
);
