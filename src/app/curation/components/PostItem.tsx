import Image from 'next/image';
import Link from 'next/link';

// ============================================================
// Post 인터페이스
// ============================================================
interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  author: string;
  createdAt: string;
  imageUrl?: string;
}

interface PostItemProps {
  post: Post;
  isFirst?: boolean;
}

export default function PostItem({ post, isFirst = false }: PostItemProps) {
  const containerClasses = `flex items-start justify-between px-4 py-4 bg-white w-full ${
    !isFirst ? 'border-t border-zinc-200' : ''
  }`;

  // ========== 해시태그 렌더링 최적화 ==========
  // 백엔드에서 받은 tags 배열을 # 기호와 함께 깔끔하게 표시
  // 중복된 태그를 제거하고 고유한 키 사용
  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) {
      return null;
    }

    // 중복된 태그 제거
    const uniqueTags = Array.from(new Set(post.tags));

    return uniqueTags.map((tag, index) => (
      <span key={`tag-${index}-${tag}`} className="text-[#d9d9d9] text-[12px] font-medium">
        #{tag}
      </span>
    ));
  };

  // ========== 디버깅: tags 데이터 확인 ==========
  console.log('PostItem tags:', post.tags);

  return (
    <Link
      href={`/posts/${post.id}`}
      className={`${containerClasses} hover:bg-gray-50 cursor-pointer transition-colors font-['Pretendard']`}
    >
      <div className="w-60 flex flex-col justify-start items-start gap-2">
        {/* 큐레이션 글 라벨 */}
        <div className="inline-flex justify-start items-center gap-1.5 text-[#d9d9d9] text-[11px] font-semibold">
          <Image src="/icons/white_check.svg" alt="선택" width={16} height={16} />
          <span>큐레이션글</span>
        </div>

        {/* 제목 및 본문 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <h3 className="self-stretch text-[#1a1a1a] text-[14px] font-semibold leading-[1.1] line-clamp-1">
            {post.title}
          </h3>
          <p className="self-stretch text-[#a6a6a6] text-[12px] font-medium leading-snug line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* 해시태그 및 메타 정보 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          {/* ========== 해시태그 섹션 ========== */}
          {post.tags && post.tags.length > 0 && (
            <div className="self-stretch flex items-center gap-1 flex-wrap">
              {renderTags()}
            </div>
          )}

          {/* ========== 하단 메타 정보 (좋아요, 댓글, 시간, 작성자) ========== */}
          <div className="self-stretch flex items-center gap-3 text-[12px] font-medium text-[#d9d9d9]">
            {/* 좋아요 */}
            <div className="flex items-center gap-0.5 text-[#293a92]">
              <Image src="/icons/heart.svg" alt="좋아요" width={14} height={14} />
              <span>{post.likes}</span>
            </div>

            {/* 댓글 */}
            <div className="flex items-center gap-0.5 text-[#293a92]">
              <Image
                src="/icons/icons_comment.svg"
                alt="댓글"
                width={12}
                height={12}
              />
              <span>{post.comments}</span>
            </div>

            {/* 시간 및 작성자 */}
            <div className="flex items-center gap-1.5 text-[#d9d9d9]">
              <span>{post.createdAt}</span>
              <span className="text-[#d9d9d9]">·</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 썸네일 이미지 */}
      {post.imageUrl && (
        <div className="relative w-[100px] h-[100px] bg-[#d9d9d9] rounded-[8px] ml-4 flex items-center justify-center overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </Link>
  );
}
