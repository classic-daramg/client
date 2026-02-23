'use client';

import { useState } from 'react';
import Image from 'next/image';
import CommentItem from './CommentItem';

interface Comment {
  id: number;
  content: string;
  writerNickname: string;
  writerProfileImage: string;
  createdAt: string;
  isLiked: boolean;
  likeCount: number;
  isDeleted?: boolean;
  parentCommentId: number | null;
  childComments?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string, parentCommentId?: number) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleCommentLike: (commentId: number) => Promise<void>;
  isAuthenticated?: boolean;
  currentUserNickname?: string;
}

/**
 * CommentSection Component
 * 
 * 댓글 및 대댓글 섹션을 표시하고 관리하는 컴포넌트
 * 
 * @param comments - 댓글 리스트
 * @param onAddComment - 댓글 추가 핸들러
 * @param onDeleteComment - 댓글 삭제 핸들러
 * @param onToggleCommentLike - 댓글 좋아요 토글 핸들러
 */
export default function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  onToggleCommentLike,
  isAuthenticated = false,
  currentUserNickname,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyMode, setReplyMode] = useState<{
    commentId: number;
    author: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 제출 핸들러
  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(
        newComment.trim(),
        replyMode?.commentId
      );
      setNewComment('');
      setReplyMode(null);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 답글 모드 활성화
  const handleReply = (commentId: number, author: string) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }
    setReplyMode({ commentId, author });
    setNewComment('');
  };

  // 답글 모드 취소
  const handleCancelReply = () => {
    setReplyMode(null);
    setNewComment('');
  };

  // 좋아요 핸들러
  const handleLike = async (commentId: number) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }
    await onToggleCommentLike(commentId);
  };

  // 댓글 삭제 핸들러
  const handleDelete = async (commentId: number) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (confirm('정말로 댓글을 삭제하시겠습니까?')) {
      await onDeleteComment(commentId);
    }
  };

  // 최상위 댓글만 필터링
  // API가 이미 계층 구조로 데이터를 보내주므로 parentCommentId가 없거나 null인 경우를 최상위로 간주
  const topLevelComments = comments.filter(c => !c.parentCommentId || c.parentCommentId === null);

  return (
    <div className="flex flex-col gap-[6px] pb-24">
      {/* 댓글 리스트 */}
      {topLevelComments.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 bg-white">
          <div className="mb-4">
            <Image
              src="/icons/icons_comment.svg"
              alt="댓글 없음"
              width={48}
              height={48}
              className="opacity-30"
            />
          </div>
          <p className="text-sm text-[#a6a6a6] mb-1">아직 댓글이 없습니다</p>
          <p className="text-xs text-[#d9d9d9]">첫 댓글을 남겨보세요!</p>
        </div>
      ) : (
        // 댓글 렌더링
        <div className="flex flex-col gap-[6px]">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isNested={false}
              currentUserNickname={currentUserNickname}
              isAuthenticated={isAuthenticated}
              onReply={handleReply}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          ))}
        </div>
      )}

      {/* 댓글 입력창 - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-5 py-3 max-w-md mx-auto z-50">
        {!isAuthenticated ? (
          // 비로그인 유저를 위한 로그인 유도 UI
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f4f5f7] rounded-lg">
            <div className="w-5 h-5 flex items-center justify-center">
              <Image
                src="/icons/Icons_comment.svg"
                alt="댓글"
                width={20}
                height={20}
                className="opacity-50"
              />
            </div>
            <p className="flex-1 text-sm text-[#4c4c4c]">
              로그인이 필요한 서비스입니다.
            </p>
            <a
              href="/loginpage"
              className="px-4 py-2 bg-[#293a92] text-white text-xs font-semibold rounded-full hover:bg-[#1f2d6f] transition"
            >
              로그인
            </a>
          </div>
        ) : (
          // 로그인 유저를 위한 댓글 입력창
          <>
            {replyMode && (
              <div className="flex items-center justify-between mb-2 px-3 py-2 bg-[#f4f5f7] rounded">
                <p className="text-xs text-[#4c4c4c]">
                  <span className="font-semibold">{replyMode.author}</span>님에게 답글
                </p>
                <button
                  onClick={handleCancelReply}
                  className="text-xs text-[#a6a6a6] hover:text-[#4c4c4c]"
                >
                  취소
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={replyMode ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
                className="flex-1 px-4 py-2.5 bg-[#f4f5f7] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                disabled={isSubmitting}
              />
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                  newComment.trim() && !isSubmitting
                    ? 'bg-[#293a92] text-white hover:bg-[#1f2d6f]'
                    : 'bg-[#d9d9d9] text-[#a6a6a6] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '...' : '등록'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
