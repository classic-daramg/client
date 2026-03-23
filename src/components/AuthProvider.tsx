'use client';

import React, { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserProfileStore } from '../store/userProfileStore';
import { useAuthStore } from '../store/authStore';
import apiClient from '../lib/apiClient';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setProfile, clearProfile, setAuthenticated, setAuthInitialized } = useUserProfileStore();
    const { setTokens, clearTokens } = useAuthStore();

    useEffect(() => {
        const syncAuthWithCookie = async () => {
            const token = Cookies.get('access_token');
            const refreshToken = Cookies.get('refresh_token');

            // 쿠키가 없다면 비로그인 유저로 단정짓고 상태 초기화
            if (!token && !refreshToken) {
                clearProfile();
                clearTokens();
                setAuthInitialized(true);
                return;
            }

            try {
                let activeAccessToken = token || null;

                // accessToken이 없고 refreshToken만 있는 경우: 먼저 토큰 갱신 시도
                if (!token && refreshToken) {
                    console.log('🔄 액세스 토큰 없음, 리프레시 토큰으로 갱신 시도...');
                    const { data } = await axios.post(
                        '/api/auth/refresh',
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${refreshToken}`,
                                'Content-Type': 'application/json',
                            },
                            withCredentials: true,
                        }
                    );

                    const newAccessToken = data.accessToken || data.token;
                    if (!newAccessToken) {
                        throw new Error('Refresh failed: No access token received');
                    }

                    activeAccessToken = newAccessToken;
                    setTokens(newAccessToken, data.refreshToken || refreshToken);
                    console.log('✅ 리프레시 토큰으로 액세스 토큰 갱신 성공!');
                } else {
                    setTokens(activeAccessToken, refreshToken || null);
                }

                // 유효성 검사 및 프로필 최신화 (Hydration)
                const response = await apiClient.get('/users');

                // 💡 응답 데이터가 바로 객체(profileImage, nickname 등)로 올 경우
                if (response.data) {
                    const userInfo = response.data;

                    setProfile({
                        // API 응답에 없는 name, birthDate는 빈 문자열로 폴백 처리
                        name: userInfo.name || '',
                        nickname: userInfo.nickname || '',
                        email: userInfo.email || '',
                        bio: userInfo.bio || '',
                        profileImage: userInfo.profileImage || '/icons/DefaultImage.svg',
                        birthDate: userInfo.birthDate || '',
                        role: userInfo.role || 'USER',
                    });

                    setAuthenticated(true);
                }
            } catch (error) {
                console.error('인증 토큰이 만료되었거나 올바르지 않습니다:', error);
                // 토큰이 탈취/만료되었다면 보안상 즉각 삭제
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                clearProfile();
                clearTokens();
            } finally {
                setAuthInitialized(true);
            }
        };

        syncAuthWithCookie();
    }, [setProfile, clearProfile, setAuthenticated, setAuthInitialized, setTokens, clearTokens]);

    return <>{children}</>;
}
