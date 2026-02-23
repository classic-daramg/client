'use client';

import { useEffect } from 'react';

export const useScrollLock = (lock: boolean) => {
    useEffect(() => {
        if (!lock) return;

        // Save current scroll position
        const scrollY = window.scrollY;

        // Lock body scroll
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore body scroll
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
            }
        };
    }, [lock]);
};
