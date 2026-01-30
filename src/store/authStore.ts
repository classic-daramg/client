import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      setAccessToken: (token: string | null) => set({ accessToken: token }),

      setRefreshToken: (token: string | null) => set({ refreshToken: token }),

      setTokens: (accessToken: string | null, refreshToken: string | null) => set({ accessToken, refreshToken }),

      setUserId: (userId: string | null) => set({ userId }),

      clearTokens: () => set({ accessToken: null, refreshToken: null, userId: null }),

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

      // JWT 토큰에서 userId 추출 (저장된 userId가 우선)
      getUserIdFromToken: () => {
        const state = get();
        // 저장된 userId가 있으면 우선 사용
        if (state.userId) {
          return state.userId;
        }

        const token = state.accessToken;
        if (!token) return null;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT Payload:', payload);
          // JWT에서 userId 찾기 (여러 가능한 필드 확인)
          const userId = payload.userId || payload.sub || payload.user_id || null;
          console.log('Extracted userId:', userId);
          return userId;
        } catch (error) {
          console.error('Error decoding JWT:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-store', // localStorage 키 이름
      partialize: (state: AuthState) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, userId: state.userId }), // 토큰과 userId 저장
    }
  )
);
