import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = 'https://classic-daramg.duckdns.org';

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
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

// 큐에 있는 요청들 처리
const processQueue = (error: AxiosError | null = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: 모든 요청에 Access Token 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    const url = config.url || '';

    // 인증 관련 요청에는 Authorization 헤더를 붙이지 않음
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/verify-email') ||
      url.includes('/auth/email-verifications') ||
      url.includes('/auth/password-reset') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/signout');

    if (!isAuthRequest && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Request with token:', url);
    } else {
      console.log('ℹ️ Request without token:', url);
    }

    // 디버깅: 최종 요청 URL 확인
    if (config.baseURL) {
      console.log('🔎 Request URL:', `${config.baseURL}${url}`);
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
    // 성공 응답은 그대로 반환
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러가 아니거나 이미 재시도한 요청이면 에러 반환
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 토큰 갱신 요청 자체가 실패한 경우
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error('❌ Refresh token failed, logging out...');
      useAuthStore.getState().clearTokens();
      // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서 처리)
      if (typeof window !== 'undefined') {
        window.location.href = '/loginpage';
      }
      return Promise.reject(error);
    }

    console.log('⚠️ 401 Error detected, attempting token refresh...');

    // 토큰 갱신이 진행 중이면 큐에 추가
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
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('🔄 Refreshing access token...');

      // 토큰 갱신 API 호출 (refresh token은 쿠키에서 자동으로 전송됨)
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true, // 쿠키의 refresh token 사용
        }
      );

      const newAccessToken = response.data.accessToken || response.data.token;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      console.log('✅ Token refreshed successfully');

      // 새로운 Access Token 저장
      useAuthStore.getState().setAccessToken(newAccessToken);

      // 원래 요청에 새 토큰 추가
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // 큐에 있는 요청들 처리
      processQueue(null, newAccessToken);

      // 원래 요청 재시도
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error('❌ Token refresh failed:', refreshError);
      processQueue(refreshError, null);
      useAuthStore.getState().clearTokens();

      // 로그인 페이지로 리다이렉트
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
