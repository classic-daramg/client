
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    userId?: string | number;
    sub?: string;
    user_id?: string | number;
}

// Cookie Keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Token Expiration Check
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (!decoded.exp) return false;

        // Check if expired (time in seconds)
        // Adding a buffer of 10 seconds to cover potential latency
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime + 10;
    } catch (error) {
        return true; // Invalid token is considered expired
    }
};

// Get User ID from Token
export const getUserIdFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return (decoded.userId || decoded.sub || decoded.user_id)?.toString() || null;
    } catch (error) {
        return null;
    }
};

// Cookie Management
export const setAuthCookies = (accessToken: string, refreshToken: string) => {
    // Set Access Token (typically short-lived, handled by server/backend logic but set here for middleware access)
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
    });

    // Set Refresh Token (if needed for client-side logic, though often HttpOnly)
    // We store it here to ensure it's available for client-side logic if not HttpOnly
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
    });
};

export const clearAuthCookies = () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
};

export const getAccessTokenFromCookie = () => Cookies.get(ACCESS_TOKEN_KEY);
export const getRefreshTokenFromCookie = () => Cookies.get(REFRESH_TOKEN_KEY);
