/**
 * API Configuration & Utilities
 * 
 * 중앙화된 API 설정 및 유틸리티 함수
 * Vercel 환경 변수 기반으로 동작
 */

// ========== 환경 변수 검증 ==========
// Vercel 프로덕션 환경에서는 프록시를 통해 /api 사용, 로컬 개발에서는 NEXT_PUBLIC_API_URL 사용
const API_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'  // Vercel 배포: 프록시를 통한 요청
    : process.env.NEXT_PUBLIC_API_URL || 'https://classic-daramg.duckdns.org';  // 로컬 개발: 환경변수 또는 기본값

if (!API_URL) {
  const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CRITICAL ERROR: API URL이 설정되지 않았습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  if (typeof window === 'undefined') {
    console.error(errorMessage);
  } else {
    alert('API 설정 오류: 콘솔을 확인하세요.');
    console.error(errorMessage);
  }

  throw new Error('API_URL is not defined');
}

// ========== API 기본 URL ==========
export const API_BASE_URL = API_URL;

/**
 * API 엔드포인트 URL 생성
 * @param path - API 경로 (예: '/users', '/posts/123')
 * @returns 전체 API URL
 */
export function getApiUrl(path: string): string {
  // path가 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // path 앞의 슬래시 정규화
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Fetch API 래퍼 - 공통 설정 적용
 * @param path - API 경로
 * @param options - fetch 옵션
 * @returns fetch 응답
 */
export async function fetchApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(path);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 쿠키 포함
    ...options,
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * JSON 응답을 자동으로 파싱하는 Fetch 래퍼
 */
export async function fetchApiJson<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchApi(path, options);
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  return response.json();
}

// ========== 환경 정보 유틸리티 ==========
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: API_BASE_URL,
} as const;

