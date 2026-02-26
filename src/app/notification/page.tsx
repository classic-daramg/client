'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: number;
  senderNickname: string;
  senderProfileImage: string | null;
  postId: number;
  postTitle: string;
  type: 'COMMENT' | 'POST_LIKE' | 'FOLLOW' | 'REPLY';
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  content: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
}

const getNotificationMessage = (notification: Notification): string => {
  const typeMessages: Record<string, string> = {
    COMMENT: `${notification.senderNickname}님이 "${notification.postTitle}"에 댓글을 달았습니다`,
    POST_LIKE: `${notification.senderNickname}님이 "${notification.postTitle}"을 좋아합니다`,
    FOLLOW: `${notification.senderNickname}님이 팔로우했습니다`,
    REPLY: `${notification.senderNickname}님이 댓글에 답변을 달았습니다`,
  };
  return typeMessages[notification.type] || '새로운 알림입니다';
};

import { formatTimeAgo as formatTime } from '@/lib/dateUtils';

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 목록 조회
  const fetchNotifications = useCallback(
    async (nextCursor?: string | null) => {
      try {
        setLoading(true);
        const params = nextCursor ? { cursor: nextCursor } : {};
        const response = await apiClient.get<NotificationResponse>('/notifications', { params });

        if (nextCursor) {
          setNotifications(prev => [...prev, ...response.data.content]);
        } else {
          setNotifications(response.data.content);
        }

        setCursor(response.data.nextCursor);
        setHasNext(response.data.hasNext);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('알림을 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 안읽은 알림 수 조회
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get<number>('/notifications/unread-count');
      setUnreadCount(response.data);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // 초기 로드 (로그인한 경우에만)
  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // 전체 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      alert('알림 처리에 실패했습니다');
    }
  };

  // 개별 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;

    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // 알림 삭제
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert('알림 삭제에 실패했습니다');
    }
  };

  // 게시물로 이동
  const handleNavigateToPost = async (notification: Notification) => {
    await handleMarkAsRead(notification.id, notification.isRead);
    router.push(`/posts/${notification.postId}`);
  };

  // 더보기 버튼
  const handleLoadMore = () => {
    if (cursor && hasNext) {
      fetchNotifications(cursor);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white font-['Pretendard']">
      {/* Status Bar Placeholder */}
      <div className="h-[21px] bg-white" />

      {/* Header */}
      <div className="w-full bg-white border-b border-[#f4f5f7]">
        <div className="px-[20px] py-[12px]">
          <div className="flex items-center gap-[4px] h-[30px]">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex w-[24px] h-[24px] items-center justify-center p-0 flex-shrink-0"
              aria-label="뒤로가기"
            >
              <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
            </button>
            <h1 className="text-[16px] font-semibold text-[#1a1a1a] flex-1">알림</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[12px] text-[#293a92] font-semibold hover:underline"
              >
                모두 읽음
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[10px] w-full bg-[#f4f5f7]" />

      {/* Notifications List */}
      <div className="w-full bg-white flex flex-col">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-[60px]">
            <p className="text-[#d9d9d9] text-[14px]">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-[60px]">
            <p className="text-[#d9d9d9] text-[14px]">{error}</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-row items-center px-[20px] py-[16px] gap-[10px] border-b border-[#f4f5f7] hover:bg-[#f4f5f7] transition-colors cursor-pointer ${!notification.isRead ? 'bg-[#fafafa]' : ''
                  }`}
                onClick={() => handleNavigateToPost(notification)}
              >
                {/* Profile Image */}
                <div className="w-[34px] h-[34px] flex-shrink-0">
                  <div className="w-[34px] h-[34px] rounded-full bg-[#d9d9d9] flex items-center justify-center overflow-hidden">
                    {notification.senderProfileImage ? (
                      <Image
                        src={notification.senderProfileImage}
                        alt="프로필"
                        width={34}
                        height={34}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/icons/DefaultImage.svg"
                        alt="프로필"
                        width={34}
                        height={34}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-[16px] ${notification.isRead ? 'text-[#a6a6a6] font-normal' : 'text-[#4c4c4c] font-semibold'
                      }`}
                  >
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-[11px] text-[#d9d9d9] mt-[4px]">{formatTime(notification.createdAt)}</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.id);
                  }}
                  className="p-[6px] text-[#d9d9d9] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
                  aria-label="알림 삭제"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 4h12v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4zm5-2h4v1h-4V2zm-1 10h2v-6H6v6zm4 0h2v-6h-2v6z" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Load More Button */}
            {hasNext && (
              <div className="flex items-center justify-center py-[20px]">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-[24px] py-[10px] bg-[#f4f5f7] text-[#1a1a1a] text-[13px] font-semibold rounded-full hover:bg-[#e8e9eb] disabled:opacity-50 transition-colors"
                >
                  {loading ? '로딩 중...' : '더보기'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-[60px]">
            <p className="text-[#d9d9d9] text-[14px]">알림이 없습니다</p>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-[34px] invisible" />
    </div>
  );
}
