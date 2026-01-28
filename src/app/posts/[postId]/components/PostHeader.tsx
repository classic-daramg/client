'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PostHeaderProps {
  author: string;
  profileImage: string;
  timestamp: string;
  postType: 'FREE' | 'CURATION' | 'STORY';
  userId?: string;
}

/**
 * PostHeader Component
 * 
 * 포스트 작성자 정보와 타입을 표시하는 헤더 컴포넌트
 * 
 * @param author - 작성자 닉네임
 * @param profileImage - 작성자 프로필 이미지 URL
 * @param timestamp - 작성 시간 (ISO 8601 형식)
 * @param postType - 포스트 타입 (FREE, CURATION, STORY)
 * @param userId - 작성자 ID (프로필 링크용, optional)
 */
export default function PostHeader({
  author,
  profileImage,
  timestamp,
  postType,
  userId,
}: PostHeaderProps) {
  // 날짜 포맷팅: ISO 8601 → YY/MM/DD HH:mm
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date
      .toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\. /g, '/')
      .replace('.', '');
  };

  // 포스트 타입별 한글 레이블
  const getTypeLabel = () => {
    switch (postType) {
      case 'FREE':
        return '자유 글';
      case 'CURATION':
        return '큐레이션';
      case 'STORY':
        return '이야기';
      default:
        return '';
    }
  };

  return (
    <div className="px-5 py-5 flex items-start gap-2 bg-white">
      {/* 프로필 이미지 */}
      {userId ? (
        <Link href={`/writer-profile/${userId}`}>
          <div className="w-[31px] h-[31px] bg-[#d9d9d9] rounded-md flex-shrink-0 overflow-hidden relative">
            <Image
              src={profileImage || '/icons/DefaultImage.svg'}
              alt={author}
              width={31}
              height={31}
              className="object-cover"
            />
          </div>
        </Link>
      ) : (
        <div className="w-[31px] h-[31px] bg-[#d9d9d9] rounded-md flex-shrink-0 overflow-hidden relative">
          <Image
            src={profileImage || '/icons/DefaultImage.svg'}
            alt={author}
            width={31}
            height={31}
            className="object-cover"
          />
        </div>
      )}

      {/* 작성자 정보 */}
      <div className="flex-1">
        <p className="font-semibold text-sm text-[#4c4c4c]">{author}</p>
        <p className="font-medium text-xs text-[#d9d9d9]">
          {formatDateTime(timestamp)}
        </p>
      </div>

      {/* 포스트 타입 뱃지 */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d9d9d9] flex-shrink-0">
        <Image src="/icons/check.svg" alt="type" width={12} height={12} />
        <span>{getTypeLabel()}</span>
      </div>
    </div>
  );
}
