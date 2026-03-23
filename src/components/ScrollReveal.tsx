'use client';

import { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** 뷰포트에 얼마나 보여야 트리거할지 (0~1, 기본 0.15) */
  threshold?: number;
  /** 애니메이션 지연 시간 (ms) */
  delay?: number;
}

/**
 * 스크롤 시 요소가 뷰포트에 들어오면 등장 애니메이션을 트리거하는 컴포넌트
 * IntersectionObserver를 사용하여 성능 최적화
 *
 * 사용법:
 *   <ScrollReveal>
 *     <Card />
 *   </ScrollReveal>
 *
 *   <ScrollReveal delay={200} threshold={0.3}>
 *     <p>지연 등장</p>
 *   </ScrollReveal>
 */
export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.15,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add('revealed'), delay);
          } else {
            el.classList.add('revealed');
          }
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}
