import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  isHydrated: boolean; // Hydration state

  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUserId: (userId: string | null) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  getUserIdFromToken: () => string | null;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isHydrated: false,

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
        // Note: Ideally setTokens should be used to ensure both are handled, 
        // but for single updates we assume logic elsewhere handles cookies if needed.
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

      setHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
      skipHydration: true, // Manually hydrate to avoid mismatches
    }
  )
);
