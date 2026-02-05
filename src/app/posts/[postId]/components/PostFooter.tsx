'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PostFooterProps {
  likeCount: number;
  isLiked: boolean;
  isScrapped: boolean;
  onToggleLike: () => void;
  onToggleScrap: () => void;
  postId: string;
}

/**
 * PostFooter Component
 * 
 * 포스트 하단의 상호작용 버튼들을 표시하는 컴포넌트
 * 좋아요, 스크랩, 공유 기능 포함
 * 
 * @param likeCount - 좋아요 개수
 * @param isLiked - 현재 사용자의 좋아요 여부
 * @param isScrapped - 현재 사용자의 스크랩 여부
 * @param onToggleLike - 좋아요 토글 핸들러
 * @param onToggleScrap - 스크랩 토글 핸들러
 * @param postId - 포스트 ID
 */
export default function PostFooter({
  likeCount,
  isLiked,
  isScrapped,
  onToggleLike,
  onToggleScrap,
  postId,
}: PostFooterProps) {
  const router = useRouter();

  // 공유하기 핸들러
  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '클래식 다람쥐 포스트',
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      try {
        await navigator.clipboard.writeText(url);
        alert('링크가 클립보드에 복사되었습니다.');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="px-5 pb-5 bg-white">
      <div className="flex items-center justify-between pt-4 border-t border-[#f4f5f7]">
        {/* 좋아요 & 스크랩 */}
        <div className="flex gap-3">
          {/* 좋아요 버튼 */}
          <button
            onClick={onToggleLike}
            className="flex items-center gap-1.5 font-medium text-xs text-[#a6a6a6] hover:text-[#293a92] transition"
          >
            <Image
              src={isLiked ? '/icons/heart_selected.svg' : '/icons/heart_gray.svg'}
              alt="좋아요"
              width={24}
              height={24}
            />
            <span>{likeCount}</span>
          </button>

          {/* 스크랩 버튼 */}
          <button
            onClick={onToggleScrap}
            className="flex items-center gap-1.5 font-medium text-xs text-[#a6a6a6] hover:text-[#293a92] transition"
          >
            <Image
              src={isScrapped ? '/icons/bookmark-on.svg' : '/icons/bookmark_gray.svg'}
              alt="스크랩"
              width={24}
              height={24}
            />
            <span>스크랩</span>
          </button>
        </div>

        {/* 공유하기 & 신고하기 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="hover:opacity-70 transition"
          >
            <Image src="/icons/upload.svg" alt="공유" width={24} height={24} />
          </button>

          {/* 신고 버튼 */}
          <button
            onClick={() => router.push('/posts/report')}
            className="hover:opacity-70 transition"
          >
            <Image src="/icons/siren.svg" alt="신고" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
