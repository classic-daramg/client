'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PostItemProps {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  author: string;
  hasImage?: boolean;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
}

export default function PostItem({
  id,
  title,
  content,
  tags,
  likes,
  comments,
  timeAgo,
  author,
  hasImage = true,
  thumbnailUrl,
  videoUrl
}: PostItemProps) {
  return (
    <div className="self-stretch px-3 py-4 bg-white border-b border-gray-100">
      <Link href={`/free-talk/${id}`} className="inline-flex justify-center items-center w-full hover:bg-gray-50 transition-colors rounded-lg p-2">
        <div className="flex-1 flex flex-col justify-start items-start gap-2">
          <div className="inline-flex justify-start items-center gap-[3px]">
            <div className="w-3 h-3 relative">
              <Image 
                src="/icons/talkIcon.svg" 
                alt="자유글" 
                layout="fill"
                className="opacity-70"
              />
            </div>
            <div className="text-zinc-400 text-xs font-semibold font-['Pretendard']">자유글</div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-zinc-900 text-sm font-semibold font-['Pretendard'] line-clamp-1">
              {title}
            </div>
            <div className="self-stretch text-neutral-400 text-xs font-['Pretendard'] line-clamp-2">
              {content}
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch inline-flex justify-start items-center gap-1 overflow-hidden">
              {tags.slice(0, 3).map((tag, index) => (
                <div key={index} className="text-zinc-400 text-xs font-medium font-['Pretendard'] whitespace-nowrap">
                  #{tag}
                </div>
              ))}
            </div>

            <div className="self-stretch inline-flex justify-start items-center gap-2 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-0.5">
                <Image src="/icons/heart.svg" alt="좋아요" width={12} height={12} />
                <span className="text-blue-900">{likes}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Image src="/icons/message.svg" alt="댓글" width={12} height={12} />
                <span className="text-blue-900">{comments}</span>
              </div>
              <span>{timeAgo}</span>
              <span className="w-px h-2 bg-gray-300" />
              <span>{author}</span>
            </div>
          </div>
        </div>

        {(hasImage || videoUrl) && (
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden ml-4 shrink-0 relative">
            {thumbnailUrl && thumbnailUrl.startsWith('http') ? (
              <Image
                src={thumbnailUrl}
                alt="게시글 이미지"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : videoUrl ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Image
                  src="/icons/music.svg"
                  alt="영상"
                  width={32}
                  height={32}
                  className="opacity-70"
                />
              </div>
            ) : (
              <Image
                src="/icons/img.svg"
                alt="게시글 이미지"
                width={32}
                height={32}
                className="opacity-40"
              />
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
