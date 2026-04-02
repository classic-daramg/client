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

  // checkAuth는 함수 참조이므로 deps에 넣으면 매 렌더마다 재계산됨
  // 대신 호출 결과를 밖에서 한 번만 평가
  const isAuthStoreLoggedIn = checkAuth();

  const authStatus = useMemo(() => {
    const isLoggedIn =
      isAuthStoreLoggedIn ||
      (isLiked !== null && isLiked !== undefined) ||
      (isScrapped !== null && isScrapped !== undefined);

    const currentNickname = profile?.nickname || null;

    const isPostAuthor = isLoggedIn &&
                         currentNickname !== null &&
                         currentNickname === writerNickname;

    return {
      isAuthenticated: isLoggedIn,
      isAuthor: isPostAuthor,
      currentUserNickname: currentNickname,
    };
  }, [isAuthStoreLoggedIn, isLiked, isScrapped, profile?.nickname, writerNickname]);

  return authStatus;
}
