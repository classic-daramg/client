import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

export function useLogout() {
    const router = useRouter();
    const clearTokens = useAuthStore((state) => state.clearTokens);

    const handleLogout = async () => {
        try {
            // Call backend logout endpoint (optional, but good practice if available)
            // We use a fire-and-forget approach or wrapped in try-catch to ensure client cleanup always happens
            await apiClient.delete('/auth/logout').catch(() => {
                // Ignore errors from backend logout (e.g. network error, 401)
            });
        } finally {
            // 1. Clear Client State
            clearTokens(); // This also clears cookies via set/clear logic in store (if updated) or via utility

            // 2. Clear Server Cache & Redirect
            // router.refresh() clears the Next.js router cache and re-fetches server components
            router.refresh();
            router.replace('/loginpage');
        }
    };

    return { handleLogout };
}
