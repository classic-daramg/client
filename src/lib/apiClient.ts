import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { getRefreshTokenFromCookie } from '@/lib/tokenUtils';

// 클라이언트에서는 /api로 요청 → next.config.ts의 rewrites가 백엔드로 프록시
// 서버 사이드에서만 API_BASE_URL 사용
const BASE_URL = '/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 기반 인증도 지원
});

// 토큰 갱신 중임을 나타내는 플래그 (Lock)
let isRefreshing = false;

// 토큰 갱신 대기 중인 요청들의 큐
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let refreshSubscribers: FailedRequest[] = [];

/**
 * 대기열에 있는 모든 요청을 처리하는 함수
 * @param error 에러 발생 시 에러 객체 (갱신 실패 등)
 * @param token 갱신 성공 시 새로운 액세스 토큰
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.map((callback) => callback.resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.map((callback) => callback.reject(error));
  refreshSubscribers = [];
};

/**
 * Request Interceptor: 모든 요청에 Access Token 주입
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Zustand 스토어에서 최신 액세스 토큰을 가져옴
    const token = useAuthStore.getState().accessToken;
    const url = config.url || '';

    // 인증이 필요 없는 API 리스트 (로그인, 회원가입 등)
    const isAuthRequest = [
      '/auth/login',
      '/auth/signup',
      '/auth/verify-email',
      '/auth/email-verifications',
      '/auth/password-reset',
      '/auth/logout',
      '/auth/signout'
    ].some(path => url.includes(path));

    // 토큰 갱신 요청 자체는 제외
    const isRefreshRequest = url.includes('/auth/refresh');

    // 인증 요청이나 갱신 요청이 아니고 토큰이 존재할 때만 헤더 주입
    if (!isAuthRequest && !isRefreshRequest && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: 401 Unauthorized 에러 발생 시 토큰 갱신 및 재요청 처리
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러가 발생했고, 아직 재시도하지 않은 요청인 경우
    if (response?.status === 401 && originalRequest && !originalRequest._retry) {

      // Case B: 이미 토큰 갱신이 진행 중인 경우 (isRefreshing === true)
      if (isRefreshing) {
        // 새로운 Promise를 반환하여 갱신이 완료될 때까지 요청을 홀딩(Pending)시킴
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({
            resolve: (newToken: string) => {
              // 갱신 성공 시: 새 토큰으로 헤더 교체 후 재요청
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              // 갱신 실패 시: 요청 거부
              reject(err);
            },
          });
        });
      }

      // Case A: 최초로 401 에러가 감지되어 갱신을 시작해야 하는 경우 (isRefreshing === false)
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Zustand에서 리프레시 토큰 가져오기 (혹은 쿠키)
        const storedRefreshToken = useAuthStore.getState().refreshToken || getRefreshTokenFromCookie();

        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        /**
         * 토큰 재발급 API 호출
         * withCredentials: true 로 설정하여 HttpOnly 쿠키(있을 경우)를 함께 전송
         * 별도의 axios 인스턴스 혹은 axios.post를 직접 사용하여 무한 루프 방지
         */
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${storedRefreshToken}` },
            withCredentials: true,
          }
        );

        // 백엔드 응답 구조에 맞게 새 액세스 토큰 추출
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh failed: New access token not received');
        }

        // 새 토큰들을 Zustand 스토어 및 쿠키에 저장
        if (newRefreshToken) {
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        } else {
          useAuthStore.getState().setAccessToken(newAccessToken);
        }

        // 1. 대기열(Queue)에 쌓여있던 모든 요청을 일괄 처리
        onRefreshed(newAccessToken);

        // 2. 최초로 401이 났던 원본 요청도 새 토큰으로 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);

      } catch (refreshError) {
        // 갱신 API 자체가 실패한 경우 (Refresh Token 만료 등)
        onRefreshFailed(refreshError);

        // 인증 정보 클리어 및 로그인 페이지 리다이렉트
        useAuthStore.getState().clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/loginpage';
        }

        return Promise.reject(refreshError);
      } finally {
        // 갱신 작업 완료 후 플래그 해제
        isRefreshing = false;
      }
    }

    // 그 외의 모든 에러는 그대로 reject
    return Promise.reject(error);
  }
);

export default apiClient;
