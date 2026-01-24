'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReportModal } from './report-modal';

export interface CommentData {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  isHeartSelected?: boolean;
  isReply?: boolean;
  likeCount?: number;
  childComments?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  composerId?: string;
  onReply?: (commentId: number, author: string) => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
  onLikeChange?: (commentId: number, isLiked: boolean, likeCount: number) => void;
  onDelete?: (commentId: number) => void;
}

export default function CommentItem({ comment, composerId, onReply, onReportOpen, onReportClose, onLikeChange, onDelete }: CommentItemProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHeartSelected, setIsHeartSelected] = useState(comment.isHeartSelected || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleReplyClick = () => onReply?.(comment.id, comment.author);

  const handleHeartClick = async () => {
    // 낙관적 UI 업데이트
    const newIsLiked = !isHeartSelected;
    const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setIsHeartSelected(newIsLiked);
    setLikeCount(newLikeCount);

    try {
      const res = await fetch(`https://classic-daramg.duckdns.org/comments/${comment.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('댓글 좋아요 토글 실패');
      }

      const data = await res.json();

      // 서버 응답과 동기화
      if (data && typeof data.isLiked === 'boolean') {
        setIsHeartSelected(data.isLiked);
        setLikeCount(data.likeCount);
        onLikeChange?.(comment.id, data.isLiked, data.likeCount);
      }
    } catch (error) {
      console.error('Comment like toggle error:', error);
      // 롤백
      setIsHeartSelected(!newIsLiked);
      setLikeCount(newIsLiked ? likeCount : likeCount + 1);
      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleReportClick = () => { setIsReportModalOpen(true); onReportOpen?.(); };
  const handleReportModalClose = () => { setIsReportModalOpen(false); onReportClose?.(); };

  const handleDeleteClick = async () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 백엔드 로그에서 accessToken 확인하고 추가
      console.log('🗑️ Deleting comment:', comment.id);

      const res = await fetch(`https://classic-daramg.duckdns.org/comments/${comment.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Delete error response: ${res.status} ${res.statusText}`, errorText);
        throw new Error(`댓글 삭제 실패 (${res.status})`);
      }

      console.log('✅ Comment deleted successfully');
      onDelete?.(comment.id);
    } catch (error) {
      console.error('Comment delete error:', error);
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {isReportModalOpen && (
        <ReportModal isOpen={isReportModalOpen} onClose={handleReportModalClose} postId={`comment-${comment.id}`} composerId={composerId || ''} />
      )}
      <div className={`bg-white flex flex-col gap-2.5 py-[18px] w-full ${comment.isReply ? 'pl-[50px] pr-5' : 'px-5'}`}>
        <div className="flex gap-2 items-start w-full">
          <div className="bg-[#d9d9d9] rounded-full size-[31px] flex items-center justify-center mt-1">
            <Image src="/icons/profile.svg" alt="profile" width={20} height={20} />
          </div>
          <div className="flex flex-col grow">
            <p className="text-[#4c4c4c] text-[14px] font-semibold">{comment.author}</p>
            <p className="text-[#d9d9d9] text-[12px] font-medium">{comment.timestamp}</p>
          </div>
          <div className="flex gap-0.5 items-center">
            <button onClick={handleHeartClick} className="relative size-[26px] hover:bg-gray-100 rounded-full flex items-center justify-center gap-1">
              <Image src={isHeartSelected ? '/icons/heart_selected.svg' : '/icons/heart_image.svg'} alt="heart" width={18} height={18} />
              {likeCount > 0 && <span className="text-xs text-gray-600">{likeCount}</span>}
            </button>
            <button onClick={handleReplyClick} className="relative size-[26px] hover:bg-gray-100 rounded-full">
              <Image src="/icons/message.svg" alt="reply" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </button>
            <button onClick={() => setShowMenu(!showMenu)} className="relative size-[26px] hover:bg-gray-100 rounded-full">
              <Image src="/icons/Icons_small.svg" alt="menu" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </button>
          </div>
          {/* 메뉴 */}
          {showMenu && (
            <div className="fixed inset-0 z-[9999]" onClick={() => setShowMenu(false)}>
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[375px] bg-white rounded-t-[22px] shadow-[-4px_-4px_10px_rgba(0,0,0,0.08)] p-5 z-[9999]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center mb-5">
                  <div className="w-[80px] h-1 bg-gray-300 rounded-full" />
                </div>
                <button onClick={() => { handleDeleteClick(); setShowMenu(false); }} className="w-full text-center py-4 text-red-500 font-medium hover:bg-gray-50 border-b border-gray-100">
                  댓글 삭제
                </button>
                <button onClick={() => { handleReportClick(); setShowMenu(false); }} className="w-full text-center py-4 text-gray-700 font-medium hover:bg-gray-50">
                  댓글 신고
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="text-[#a6a6a6] text-[14px] leading-normal">
          <p>{comment.content}</p>
        </div>
        {/* 대댓글 렌더링 */}
        {comment.childComments && comment.childComments.length > 0 && (
          <div className="mt-2">
            {comment.childComments.map(childComment => (
              <CommentItem
                key={childComment.id}
                comment={{
                  ...childComment,
                  isReply: true,
                  author: childComment.author,
                  timestamp: childComment.timestamp,
                  content: childComment.content,
                  isHeartSelected: childComment.isHeartSelected,
                  likeCount: childComment.likeCount,
                }}
                composerId={composerId}
                onReply={onReply}
                onReportOpen={onReportOpen}
                onReportClose={onReportClose}
                onLikeChange={onLikeChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
