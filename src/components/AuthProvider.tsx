'use client';

import React, { useEffect } from 'react';
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
            // (액세스 토큰이 만료되어 없더라도 리프레시 토큰이 있으면 API 요청을 통해 갱신 가능)
            if (!token && !refreshToken) {
                clearProfile();
                clearTokens();
                setAuthInitialized(true);
                return;
            }

            try {
                // 이미 렌더링 시점에 액세스/리프레시 토큰 중 있는 것은 전역 상태에 저장
                setTokens(token || null, refreshToken || null);

                // 유효성 검사 및 프로필 최신화 (Hydration)
                // 💡 백엔드의 내 정보 조회 API인 /users 로 변경
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
