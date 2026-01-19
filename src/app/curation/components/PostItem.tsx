import Image from 'next/image';
import Link from 'next/link';

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

  return (
    <Link href={`/curation/${post.id}`} className={`${containerClasses} hover:bg-gray-50 cursor-pointer transition-colors`}>
      <div className="w-60 flex flex-col justify-start items-start gap-2">
        <div className="inline-flex justify-start items-center gap-1.5 text-[#d9d9d9] text-[11px] font-semibold">
          <Image src="/icons/white_check.svg" alt="선택" width={16} height={16} />
          {/* <Image src="/icons/music.svg" alt="큐레이션" width={12} height={12} /> */}
          <span>큐레이션글</span>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <h3 className="self-stretch text-[#1a1a1a] text-[14px] font-semibold leading-[1.1] line-clamp-1">
            {post.title}
          </h3>
          <p className="self-stretch text-[#a6a6a6] text-[12px] font-medium leading-snug line-clamp-2">
            {post.content}
          </p>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <div className="self-stretch flex items-center gap-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[#d9d9d9] text-[12px] font-medium">
                #{tag}
              </span>
            ))}
          </div>
          <div className="self-stretch flex items-center gap-3 text-[12px] font-medium text-[#d9d9d9]">
            <div className="flex items-center gap-0.5 text-[#293a92]">
              <Image src="/icons/heart.svg" alt="좋아요" width={14} height={14} />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[#293a92]">
              <Image src="/icons/icons_comment.svg" alt="댓글" width={12} height={12} />
              <span>{post.comments}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#d9d9d9]">
              <span>{post.createdAt}</span>
              <span className="text-[#d9d9d9]">·</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>
      </div>
      {post.imageUrl && (
        <div className="relative w-24 h-24 bg-[#d9d9d9] rounded-[8px] ml-4 flex items-center justify-center overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-lg object-cover"
          />
        </div>
      )}
    </Link>
  );
}
