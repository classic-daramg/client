import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from './api';

const BASE_URL = API_BASE_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 기반 인증도 지원
});

// 토큰 갱신 중 여부
let isRefreshing = false;

// 토큰 갱신 대기 중인 요청 큐
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}

let failedQueue: FailedRequest[] = [];

// 큐에 있는 요청들 처리
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

// Request Interceptor: 모든 요청에 Access Token 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    const url = config.url || '';

    // 인증 관련 요청에는 Authorization 헤더를 붙이지 않음 (refresh 제외, refresh는 아래 로직에서 처리 가능성 있음)
    // 단, refresh 요청은 별도로 처리하므로 여기서는 일반적인 제외 리스트로 관리
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/verify-email') ||
      url.includes('/auth/email-verifications') ||
      url.includes('/auth/password-reset') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/signout');

    // /auth/refresh는 이 인터셉터에서 Authorization 헤더를 붙이지 않도록 함 (쿠키 or 별도 헤더 사용)
    const isRefreshRequest = url.includes('/auth/refresh');

    if (!isAuthRequest && !isRefreshRequest && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 요청 설정이 없으면 에러 반환
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 401 에러가 아니거나 이미 재시도한 요청이면 에러 반환
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 토큰 갱신 요청 자체가 실패한 경우 (400, 401 등) -> 로그아웃
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error('❌ Refresh token failed (in interceptor), logging out...');
      processQueue(error, null); // 대기 중인 요청들도 모두 실패 처리
      useAuthStore.getState().clearTokens();

      if (typeof window !== 'undefined') {
        window.location.href = '/loginpage';
      }
      return Promise.reject(error);
    }

    // 토큰 갱신이 진행 중이면 큐에 추가 (Concurrent Requests Handling)
    if (isRefreshing) {
      console.log('⏳ Token refresh in progress, adding request to queue...');
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject: (err: AxiosError) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('🔄 Refreshing access token...');

      // Store에서 refreshToken 가져오기 (쿠키 실패 시 대비)
      const storedRefreshToken = useAuthStore.getState().refreshToken;

      // 토큰 갱신 API 호출
      // 별도의 axios 인스턴스나 axios.post를 사용하여 인터셉터 무한 루프 방지
      const refreshResponse = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: storedRefreshToken ? { Authorization: `Bearer ${storedRefreshToken}` } : {},
          withCredentials: true,
        }
      );

      console.log('✅ Refresh response received');

      const { accessToken, refreshToken: newRefreshToken, token } = refreshResponse.data;
      const newAccessToken = accessToken || token; // 백엔드 응답 필드명 확인 필요

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      // 새로운 토큰 저장 (Zustand)
      if (newRefreshToken) {
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
      } else {
        useAuthStore.getState().setAccessToken(newAccessToken);
      }

      console.log('✅ Token refreshed and stored successfully');

      // 큐에 있는 요청들 처리 (재시도)
      processQueue(null, newAccessToken);

      // 현재 실패했던 요청 재시도
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return apiClient(originalRequest);

    } catch (refreshError) {
      console.error('❌ Token refresh process failed:', refreshError);

      // 갱신 실패 시 큐의 모든 요청 거부
      processQueue(refreshError as AxiosError, null);

      // 로그아웃 처리
      useAuthStore.getState().clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/loginpage';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
