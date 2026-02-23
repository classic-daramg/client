'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to lock body scroll when a modal/overlay is open.
 * Specifically handles iOS Scroll Bleed (Naver In-app, Safari) and Layout Shift.
 */
export const useBodyScrollLock = (lock: boolean = true) => {
    const lockScroll = useCallback(() => {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        const scrollY = window.scrollY;

        // Save original styles
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;

        // Apply Lock Styles
        // Using position: fixed is the most reliable way to lock scroll on iOS
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollBarWidth}px`;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            // Restore styles
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;

            // Restore scroll position
            window.scrollTo(0, scrollY);
        };
    }, []);

    useEffect(() => {
        if (!lock) return;

        const cleanup = lockScroll();
        return () => {
            cleanup();
        };
    }, [lock, lockScroll]);
};
