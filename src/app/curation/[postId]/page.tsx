'use client';

import Image from 'next/image';
import Link from 'next/link';
import CommentList from './comment-list';
import CommentInput from './comment-input';
import { ReportButton } from './report-button';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';

interface PostData {
  id: number;
  userId: string;
  author: string;
  profileImage: string;
  isLiked: boolean;
  isScrapped?: boolean;
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
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isScrapped, setIsScrapped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMode, setReplyMode] = useState<{
    isReply: boolean;
    replyToId: number;
    replyToAuthor: string;
  } | undefined>(undefined);
  const [showCommentInput, setShowCommentInput] = useState(true);
  const likeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // params 처리 및 포스트 데이터 로드
  useEffect(() => {
    params.then(async ({ postId: pId }) => {
      setPostId(pId);
      try {
        setLoading(true);
        const response = await apiClient.get(`/posts/${pId}`);
        const data = response.data;
        
        // API 응답을 PostData 형식으로 변환
        const formattedData: PostData = {
          id: data.id,
          userId: data.authorId || '',
          author: data.writerNickname || 'Unknown',
          profileImage: data.writerProfileImage || '/icons/DefaultImage.svg',
          isLiked: Boolean(data.isLiked),
          isScrapped: Boolean(data.isScrapped),
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
        setLikeCount(formattedData.likes);
        setIsLiked(formattedData.isLiked);
        setIsScrapped(formattedData.isScrapped || false);
        
        // 댓글 데이터는 포스트 응답에 포함되어 있음
        const formattedComments = data.comments?.map((comment: any) => ({
          id: comment.id,
          author: comment.writerNickname || 'Unknown',
          timestamp: formatDateTime(comment.createdAt),
          content: comment.content,
          isHeartSelected: comment.isLiked || false,
          isReply: comment.parentCommentId !== null,
        })) || [];
        setCurrentComments(formattedComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (likeDebounceRef.current) {
        clearTimeout(likeDebounceRef.current);
      }
    };
  }, []);

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

  const syncLikeStatus = async () => {
    if (!postId) return;
    try {
      const response = await apiClient.post(`/posts/${postId}/like`);
      console.log('✅ Like synced successfully:', response.data);
    } catch (err) {
      // 낙관적 유지, 오류만 로깅
      console.error('Failed to sync like status:', err);
    }
  };

  const handleToggleLike = () => {
    const nextLiked = !isLiked;
    const delta = nextLiked ? 1 : -1;

    // optimistic update
    setIsLiked(nextLiked);
    setLikeCount((prev) => Math.max(prev + delta, 0));

    // debounce API call
    if (likeDebounceRef.current) clearTimeout(likeDebounceRef.current);
    likeDebounceRef.current = setTimeout(() => {
      syncLikeStatus();
    }, 350);
  };

  const handleToggleScrap = async () => {
    // Save previous state for rollback
    const previousScrapped = isScrapped;

    // Optimistic UI update (immediate feedback)
    setIsScrapped(!isScrapped);

    try {
      const res = await fetch(`https://classic-daramg.duckdns.org/posts/${postId}/scrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('스크랩 토글 실패');
      }

      const data = await res.json();

      // Sync with actual server state
      if (data && typeof data.isScrapped === 'boolean') {
        setIsScrapped(data.isScrapped);
      }
    } catch (error) {
      console.error('Scrap toggle error:', error);

      // Rollback on failure
      setIsScrapped(previousScrapped);

      alert('스크랩 처리에 실패했습니다. 다시 시도해주세요.');
    }
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
      <div className="bg-white w-full max-w-md mx-auto">
        {/* Header with title and edit button */}
        <div className="px-5 py-3 flex items-center gap-1 border-b border-[#f4f5f7]">
          <Link href="/curation" className="flex-shrink-0">
            <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
          </Link>
          <h1 className="flex-1 text-center text-[#1a1a1a] text-base font-semibold">라흐마니노프 토크룸</h1>
          <button className="px-3 py-1.5 bg-white rounded-full border border-[#d9d9d9] text-[#a6a6a6] text-xs font-semibold flex-shrink-0">
            수정
          </button>
        </div>

        {/* Post Content */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Author info */}
          <div className="flex items-start gap-2">
            <Link href={`/writer-profile/${mockPostData.userId}`}>
              <div className="w-[31px] h-[31px] bg-[#d9d9d9] rounded-md flex-shrink-0 overflow-hidden relative">
                <Image 
                  src={mockPostData.profileImage} 
                  alt={mockPostData.author}
                  width={31}
                  height={31}
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#4c4c4c]">{mockPostData.author}</p>
              <p className="font-medium text-xs text-[#d9d9d9]">{mockPostData.timestamp}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d9d9d9] flex-shrink-0">
              <Image src="/icons/check.svg" alt="type" width={12} height={12} />
              <span>{mockPostData.postType}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">{mockPostData.title}</h2>
          </div>

          {/* Content */}
          <div className="font-medium text-sm text-[#a6a6a6] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
            {mockPostData.content}
          </div>

          {/* Tags */}
          {mockPostData.tags.length > 0 && (
            <div className="flex gap-1 font-medium text-xs text-[#d9d9d9]">
              {mockPostData.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
          )}

          {/* Images */}
          {mockPostData.images.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto">
              {mockPostData.images.map((src, index) => (
                <div key={index} className="relative w-[151px] h-[151px] bg-[#d9d9d9] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={src}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f4f5f7]">
            <div className="flex gap-3">
              <button
                onClick={handleToggleLike}
                className="flex items-center gap-1.5 font-medium text-xs text-[#a6a6a6]"
              >
                <Image
                  src={isLiked ? '/icons/heart_selected.svg' : '/icons/heart_gray.svg'}
                  alt="좋아요"
                  width={24}
                  height={24}
                />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={handleToggleScrap}
                className="flex items-center gap-1.5 font-medium text-xs text-[#a6a6a6]"
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
            <div className="flex items-center gap-2.5">
              <button>
                <Image src="/icons/upload.svg" alt="공유" width={24} height={24} />
              </button>
              <ReportButton postId={postId} composerId="curation" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className={`mt-1.5 flex flex-col gap-1.5 w-full max-w-md mx-auto ${showCommentInput ? 'pb-32' : 'pb-8'}`}>
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