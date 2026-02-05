'use client';

import { useRouter } from 'next/navigation';

export const useSafeBack = (fallbackHref: string) => {
  const router = useRouter();

  return () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };
};
