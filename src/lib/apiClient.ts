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
      // console.log('✅ Request with token:', url);
    } else {
      // console.log('ℹ️ Request without token:', url);
    }

    // 디버깅: 최종 요청 URL 확인
    // if (config.baseURL) {
    //   console.log('🔎 Request URL:', `${config.baseURL}${url}`);
    // }

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

    // 토큰 갱신 요청 자체가 실패한 경우 (400, 401 등)
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error('❌ Refresh token failed (in interceptor), logging out...');
      processQueue(error, null); // 대기 중인 요청들도 모두 실패 처리
      useAuthStore.getState().clearTokens();

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
      // 쿠키는 withCredentials: true로 자동 전송되지만, 
      // 일부 환경/백엔드 설정을 위해 헤더에도 추가할 수 있음 (백엔드 지원 필요)
      // 여기서는 쿠키를 메인으로 하되, 필요시 헤더 추가 로직을 고려

      const refreshConfig: InternalAxiosRequestConfig = {
        headers: new axios.AxiosHeaders(), // AxiosHeaders 인스턴스 사용
        withCredentials: true,
      };

      if (storedRefreshToken) {
        refreshConfig.headers.set('Authorization', `Bearer ${storedRefreshToken}`);
        // 혹은 'Refresh-Token' 커스텀 헤더 등 백엔드 규약에 맞게 수정 가능
      }

      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        refreshConfig
      );

      console.log('✅ Refresh response received:', {
        status: response.status,
        hasAccessToken: Boolean(response.data?.accessToken || response.data?.token),
      });

      const newAccessToken = response.data.accessToken || response.data.token;
      // 응답 구조에 따라 refreshToken도 같이 갱신될 수 있음
      const newRefreshToken = response.data.refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      console.log('✅ Token refreshed successfully');

      // 새로운 토큰 저장
      if (newRefreshToken) {
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
      } else {
        useAuthStore.getState().setAccessToken(newAccessToken);
      }

      // 큐에 있는 요청들 처리
      processQueue(null, newAccessToken);

      // 원래 요청에 새 토큰 적용 후 재시도
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // isRefreshing은 finally에서 false로 변경됨
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
