'use client';

import Image from 'next/image';

interface Comment {
  id: number;
  content: string;
  writerNickname: string;
  writerProfileImage: string;
  createdAt: string;
  isLiked: boolean;
  likeCount: number;
  isDeleted?: boolean;
  childComments?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  isNested?: boolean;
  currentUserNickname?: string;
  isAuthenticated?: boolean;
  onReply?: (commentId: number, author: string) => void;
  onDelete?: (commentId: number) => void;
  onLike?: (commentId: number) => void;
  onToggleLike?: (commentId: number) => void;
}

/**
 * CommentItem Component (Figma Design Aligned)
 * 
 * 피그마 디자인 스펙에 맞춘 댓글 컴포넌트
 * - 부모 댓글: px-[20px] py-[18px]
 * - 대댓글: pl-[50px] pr-[20px] py-[18px]
 * - 프로필: 31px 원형
 * - 폰트: Username(14px/SemiBold/#4c4c4c), Time(12px/Medium/#d9d9d9), Content(14px/Medium/#a6a6a6)
 */
export default function CommentItem({
  comment,
  isNested = false,
  currentUserNickname,
  isAuthenticated = false,
  onReply,
  onDelete,
  onLike,
  onToggleLike,
}: CommentItemProps) {
  const handleLike = onLike || onToggleLike;
  const isAuthor = currentUserNickname === comment.writerNickname;

  // 시간 포맷팅 (YY/MM/DD HH:MM)
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date
      .toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(/\. /g, '/')
      .replace('.', '');
  };

  // 삭제된 댓글 렌더링
  if (comment.isDeleted) {
    return (
      <div className={`bg-white py-[18px] ${isNested ? 'pl-[50px] pr-[20px]' : 'px-[20px]'}`}>
        <p className="text-sm font-medium text-[#a6a6a6] italic">삭제된 댓글입니다</p>
        
        {comment.childComments && comment.childComments.length > 0 && (
          <div className="mt-[10px]">
            {comment.childComments.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isNested={true}
                currentUserNickname={currentUserNickname}
                isAuthenticated={isAuthenticated}
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white flex flex-col gap-[10px] py-[18px] ${isNested ? 'pl-[50px] pr-[20px]' : 'px-[20px]'}`}>
      {/* 댓글 헤더 & 본문 */}
      <div className="flex gap-2 items-start w-full">
        {/* 프로필 이미지 - 31px 원형 */}
        <div className="w-[31px] h-[31px] bg-[#d9d9d9] rounded-full flex-shrink-0 overflow-hidden">
          <Image
            src={comment.writerProfileImage || '/icons/DefaultImage.svg'}
            alt={comment.writerNickname}
            width={31}
            height={31}
            className="object-cover w-full h-full"
          />
        </div>

        {/* 작성자 정보 & 본문 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Username & Time */}
          <div className="flex gap-2 items-center mb-1">
            <p className="text-[14px] font-semibold leading-normal text-[#4c4c4c]">
              {comment.writerNickname}
            </p>
            <p className="text-[12px] font-medium leading-normal text-[#d9d9d9]">
              {formatDateTime(comment.createdAt)}
            </p>
          </div>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-0 flex-shrink-0">
          {/* 좋아요 */}
          <button
            onClick={() => handleLike?.(comment.id)}
            className="flex items-center gap-[2px]"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Image
                src={comment.isLiked ? '/icons/heart_selected.svg' : '/icons/heart_gray.svg'}
                alt="좋아요"
                width={14}
                height={12}
                className="object-contain"
              />
            </div>
            <span className="text-[12px] font-medium text-[#bfbfbf] w-[13px] text-center">
              {comment.likeCount}
            </span>
          </button>

          {/* 답글 아이콘 (최상위만) */}
          {!isNested && onReply && (
            <button
              onClick={() => onReply(comment.id, comment.writerNickname)}
              className="w-[26px] h-[26px] flex items-center justify-center"
            >
              <Image
                src="/icons/Icons_comment.svg"
                alt="답글"
                width={12}
                height={12}
              />
            </button>
          )}

          {/* More 버튼 (작성자 본인) */}
          {isAuthor && isAuthenticated && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="w-6 h-6 flex items-center justify-center"
            >
              <div className="w-[2px] h-[10px] bg-[#bfbfbf]" />
            </button>
          )}
        </div>
      </div>

      {/* 댓글 내용 */}
      <div className="w-full">
        <p className="text-[14px] font-medium leading-normal text-[#a6a6a6] whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* 대댓글 */}
      {comment.childComments && comment.childComments.length > 0 && (
        <div className="flex flex-col gap-[6px] mt-[6px]">
          {comment.childComments.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isNested={true}
              currentUserNickname={currentUserNickname}
              isAuthenticated={isAuthenticated}
              onReply={onReply}
              onDelete={onDelete}
              onLike={onLike}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
