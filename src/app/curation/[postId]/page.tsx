'use client';

import Image from 'next/image';
import Link from 'next/link';
import CommentList from './comment-list';
import CommentInput from './comment-input';
import { ReportButton } from './report-button';
import { useState, useEffect } from 'react';

interface PostData {
  id: number;
  userId: string;
  author: string;
  timestamp: string;
  category: string;
  postType: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  likes: number;
  scraps: number;
}

interface Comment {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  isHeartSelected: boolean;
  isReply: boolean;
}

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default function CurationPostDetail({ params }: PostDetailPageProps) {
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [postId, setPostId] = useState('');
  const [mockPostData, setMockPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMode, setReplyMode] = useState<{
    isReply: boolean;
    replyToId: number;
    replyToAuthor: string;
  } | undefined>(undefined);
  const [showCommentInput, setShowCommentInput] = useState(true);

  // params 처리 및 포스트 데이터 로드
  useEffect(() => {
    params.then(async ({ postId: pId }) => {
      setPostId(pId);
      try {
        setLoading(true);
        const response = await fetch(`https://classic-daramg.duckdns.org/posts/${pId}`);
        if (!response.ok) {
          throw new Error('포스트를 불러올 수 없습니다.');
        }
        const data = await response.json();
        
        // API 응답을 PostData 형식으로 변환
        const formattedData: PostData = {
          id: data.id,
          userId: data.author?.id || '',
          author: data.author?.nickname || 'Unknown',
          timestamp: formatDateTime(data.createdAt),
          category: '큐레이션글',
          postType: '큐레이션',
          title: data.title,
          content: data.content,
          tags: data.tags?.map((tag: string) => `#${tag}`) || [],
          images: data.images || [],
          likes: data.likeCount || 0,
          scraps: data.scrapCount || 0,
        };
        
        setMockPostData(formattedData);
        
        // 댓글 데이터 로드
        const commentsResponse = await fetch(`https://classic-daramg.duckdns.org/posts/${pId}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          const formattedComments = commentsData.content?.map((comment: any) => ({
            id: comment.id,
            author: comment.author?.nickname || 'Unknown',
            timestamp: formatDateTime(comment.createdAt),
            content: comment.content,
            isHeartSelected: comment.isLiked || false,
            isReply: comment.isReply || false,
          })) || [];
          setCurrentComments(formattedComments);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\. /g, '/').replace('.', '');
  };

  const handleAddComment = (content: string, isReply: boolean = false, replyToId?: number) => {
    const newComment: Comment = {
      id: Math.max(...currentComments.map(c => c.id), 0) + 1,
      author: 'Username',
      timestamp: new Date().toLocaleDateString('ko-KR', { 
        year: '2-digit', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\. /g, '/').replace('.', ''),
      content,
      isHeartSelected: false,
      isReply
    };

    if (isReply && replyToId) {
      const replyToIndex = currentComments.findIndex(c => c.id === replyToId);
      if (replyToIndex !== -1) {
        const newComments = [...currentComments];
        newComments.splice(replyToIndex + 1, 0, newComment);
        setCurrentComments(newComments);
      } else {
        setCurrentComments([newComment, ...currentComments]);
      }
    } else {
      setCurrentComments([newComment, ...currentComments]);
    }
    
    if (replyMode) {
      setReplyMode(undefined);
    }
  };

  const handleReply = (commentId: number, author: string) => {
    setReplyMode({
      isReply: true,
      replyToId: commentId,
      replyToAuthor: author
    });
  };

  const handleCancelReply = () => {
    setReplyMode(undefined);
  };

  const handleReportOpen = () => {
    setShowCommentInput(false);
  };

  const handleReportClose = () => {
    setShowCommentInput(true);
  };

  if (loading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  if (error || !mockPostData) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || '포스트를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="bg-white w-[375px] mx-auto">
        {/* Post Content */}
        <div className="px-5 pb-5 pt-4">
            <div className="flex items-start gap-2 mb-4">
                <Link href={`/writer-profile/${mockPostData.userId}`}>
                    <div className="w-[31px] h-[31px] bg-zinc-300 rounded-md" />
                </Link>
                <div className="flex-1">
                    <p className="font-semibold text-sm text-zinc-700">{mockPostData.author}</p>
                    <p className="text-xs text-zinc-400">{mockPostData.timestamp} · {mockPostData.category}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                        <Image src="/icons/music.svg" alt="" width={12} height={12} />
                        <span>{mockPostData.postType}</span>
                    </div>
                    <ReportButton postId={postId} composerId="curation" />
                </div>
            </div>

            <div className="mb-2">
                <h2 className="text-sm font-semibold text-zinc-900">{mockPostData.title}</h2>
            </div>

            <div className="text-sm text-zinc-500 mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {mockPostData.content}
            </div>

            <div className="flex gap-1 text-sm text-zinc-400 mb-4">
                {mockPostData.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            {mockPostData.images.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                  {mockPostData.images.map((src, index) => (
                      <div key={index} className="relative w-[151px] h-[151px] bg-zinc-300 rounded-lg overflow-hidden">
                          <Image
                              src={src}
                              alt={`Post image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                          />
                      </div>
                  ))}
              </div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Image src="/icons/heart.svg" alt="likes" width={24} height={24} />
                        <span>좋아요</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Image src="/icons/logo.svg" alt="scraps" width={24} height={24} />
                        <span>스크랩</span>
                    </div>
                </div>
                <button>
                    <Image src="/icons/music.svg" alt="share" width={24} height={24} />
                </button>
            </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className={`mt-1.5 flex flex-col gap-1.5 w-[375px] mx-auto ${showCommentInput ? 'pb-32' : 'pb-8'}`}>
        <CommentList 
          composerId="curation"
          initialComments={currentComments}
          onReply={handleReply}
          onReportOpen={handleReportOpen}
          onReportClose={handleReportClose}
        />
      </div>

      {/* Comment Input - Fixed at bottom */}
      {showCommentInput && (
      <CommentInput 
        onSubmitComment={handleAddComment}
        replyMode={replyMode}
        onCancelReply={handleCancelReply}
      />
      )}
    </div>
  );
}