// GA4 이벤트 추적 함수들

declare global {
  interface Window {
    gtag: (command: string, eventName: string, eventData?: Record<string, string | number>) => void;
  }
}

/**
 * 검색 이벤트 추적
 * @param searchQuery - 검색어
 * @param category - 검색 카테고리 (예: 'curation', 'free-talk', 'composer')
 */
export const trackSearch = (searchQuery: string, category?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_search_results', {
      search_term: searchQuery,
      category: category || 'general',
    });
  }
};

/**
 * 페이지 뷰 이벤트 추적 (필요시)
 */
export const trackPageView = (page_path: string, page_title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path,
      page_title,
    });
  }
};

/**
 * 커스텀 이벤트 추적
 */
export const trackEvent = (eventName: string, eventData: Record<string, string | number>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }
};
