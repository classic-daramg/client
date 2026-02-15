/**
 * API Configuration & Utilities
 * 
 * 중앙화된 API 설정 및 유틸리티 함수
 * Vercel 환경 변수 기반으로 동작
 */

// ========== 환경 변수 검증 ==========
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CRITICAL ERROR: API URL이 설정되지 않았습니다!

환경 변수 'NEXT_PUBLIC_API_URL'을 설정해주세요.

📌 로컬 개발 환경 설정:
   1. 프로젝트 루트에 .env.local 파일 생성
   2. 다음 내용 추가:
      NEXT_PUBLIC_API_URL=https://classic-daramg.duckdns.org

📌 Vercel 배포 환경 설정:
   1. Vercel Dashboard → Settings → Environment Variables
   2. Name: NEXT_PUBLIC_API_URL
   3. Value: https://classic-daramg.duckdns.org
   4. Environments: Production, Preview 체크
   5. Save 후 Redeploy 필수!

자세한 가이드: https://nextjs.org/docs/basic-features/environment-variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  if (typeof window === 'undefined') {
    // 서버 사이드에서는 콘솔에만 출력
    console.error(errorMessage);
  } else {
    // 클라이언트 사이드에서는 alert도 띄움
    alert('API 설정 오류: NEXT_PUBLIC_API_URL이 설정되지 않았습니다. 콘솔을 확인하세요.');
    console.error(errorMessage);
  }
  
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
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

