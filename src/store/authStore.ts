import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,

      setAccessToken: (token) => set({ accessToken: token }),

      setRefreshToken: (token) => set({ refreshToken: token }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      clearTokens: () => set({ accessToken: null, refreshToken: null }),

      isAuthenticated: () => {
        const token = get().accessToken;
        if (!token) return false;

        try {
          // JWT 토큰 디코딩하여 만료 시간 확인
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
          }
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'auth-store', // localStorage 키 이름
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }), // 토큰만 저장
    }
  )
);
