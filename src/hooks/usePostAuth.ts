'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';

/**
 * usePostAuth Hook
 * 
 * 포스트에 대한 사용자 권한을 판별하는 커스텀 훅
 * 
 * @param writerNickname - 포스트 작성자의 닉네임
 * @param isLiked - 좋아요 상태 (null이면 비로그인)
 * @param isScrapped - 스크랩 상태 (null이면 비로그인)
 * 
 * @returns {
 *   isAuthenticated: boolean - 로그인 여부
 *   isAuthor: boolean - 작성자 본인 여부
 *   currentUserNickname: string | null - 현재 로그인한 유저의 닉네임
 * }
 */
export function usePostAuth(
  writerNickname: string,
  isLiked?: boolean | null,
  isScrapped?: boolean | null
) {
  const { isAuthenticated: checkAuth } = useAuthStore();
  const { profile } = useUserProfileStore();

  const authStatus = useMemo(() => {
    // 1. 로그인 여부 확인 (3가지 방법)
    // - authStore의 isAuthenticated() 체크
    // - isLiked/isScrapped가 null이 아닌지 확인 (서버가 로그인 유저에게만 boolean 반환)
    const isLoggedIn = checkAuth() || (isLiked !== null && isLiked !== undefined);
    
    // 2. 현재 로그인한 유저의 닉네임
    const currentNickname = profile?.nickname || null;
    
    // 3. 작성자 본인 여부 확인
    // - 로그인 상태이고, 현재 유저의 닉네임과 작성자 닉네임이 일치하는 경우
    const isPostAuthor = isLoggedIn && 
                         currentNickname !== null && 
                         currentNickname === writerNickname;

    return {
      isAuthenticated: isLoggedIn,
      isAuthor: isPostAuthor,
      currentUserNickname: currentNickname,
    };
  }, [checkAuth, profile?.nickname, writerNickname]);

  return authStatus;
}
