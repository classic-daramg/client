'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommentList from './comment-list';
import CommentInput from './comment-input';
import { ReportButton } from './report-button';
import { useState, useEffect } from 'react';
import LikeButton from '@/components/LikeButton';
import ScrapButton from '@/components/ScrapButton';
import { useAuthStore } from '@/store/authStore';
import { useUserProfileStore } from '@/store/userProfileStore';

const API_BASE = 'https://classic-daramg.duckdns.org';

// API 응답 타입
interface ApiComment {
  id: number;
  content: string;
  isDeleted: boolean;
  likeCount: number;
  childCommentCount: number;
  createdAt: string;
  writerNickname: string;
  writerProfileImage?: string;
  isLiked: boolean;
  childComments?: ApiComment[];
}

interface ComposerPost {
  id: number;
  title: string;
  content: string;
  images: string[];
  hashtags: string[];
  writerNickname: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isScrapped?: boolean;
  comments?: ApiComment[];
  type?: string;
  primaryComposer?: string | null;
}

// 댓글 데이터 타입
interface CommentData {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  isHeartSelected?: boolean;
  isReply?: boolean;
  likeCount?: number;
  childComments?: CommentData[];
}


type PostDetailPageProps = {
  params: Promise<{
    id: string;
    postId: string;
  }>;
};

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { profile } = useUserProfileStore();

  const [post, setPost] = useState<ComposerPost | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerId, setComposerId] = useState('');
  const [postId, setPostId] = useState('');
  const [replyMode, setReplyMode] = useState<{
    isReply: boolean;
    replyToId: number;
    replyToAuthor: string;
  } | undefined>(undefined);
  const [showCommentInput, setShowCommentInput] = useState(true);

  // 상대 시간 포맷팅
  const getRelativeTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // API 댓글을 CommentData로 변환
  const transformComments = (apiCommentList: any[]): CommentData[] => {
    return apiCommentList.map((comment: any) => ({
      id: comment.id,
      author: comment.writerNickname,
      timestamp: getRelativeTime(comment.createdAt),
      content: comment.content,
      isHeartSelected: comment.isLiked || false,
      isReply: false,
      likeCount: comment.likeCount || 0,
      childComments: comment.childComments && comment.childComments.length > 0
        ? transformComments(comment.childComments)
        : undefined
    }));
  };

  // params 처리 및 포스트 데이터 가져오기
  useEffect(() => {
    params.then(async ({ id, postId: pId }) => {
      setComposerId(id);
      setPostId(pId);
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/posts/${pId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setPost(data);

          // 댓글 변환 및 저장
          if (data.comments && Array.isArray(data.comments)) {
            const apiComments = transformComments(data.comments);
            setComments(apiComments);
          } else {
            setComments([]);
          }

          console.log('✅ Composer post loaded:', data);
        } else {
          console.error(`Failed to fetch post: ${res.status}`);
        }
      } catch (error) {
        console.error('Failed to fetch post data:', error);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  const handleAddComment = async (content: string, isReply: boolean = false, replyToId?: number) => {
    const currentUserNickname = profile?.nickname || '익명다람쥐';

    // 낙관적 UI 반영
    const optimisticId = Date.now();
    const optimistic: CommentData = {
      id: optimisticId,
      author: currentUserNickname,
      timestamp: '방금',
      content,
      isReply: !!isReply,
      likeCount: 0,
    };

    setComments(prev => [...prev, optimistic]);
    if (!isReply && post) {
      setPost(p => p ? { ...p, commentCount: p.commentCount + 1 } : p);
    }
    setReplyMode(undefined);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // 댓글과 대댓글 API 엔드포인트 구분
      const apiUrl = isReply
        ? `${API_BASE}/comments/${replyToId}/replies`
        : `${API_BASE}/posts/${postId}/comments`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error(`댓글 전송 실패 (${res.status})`);
      }

      // 댓글 생성 성공 후 포스트 데이터 새로고침
      try {
        const refreshRes = await fetch(`${API_BASE}/posts/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const updatedPost = await refreshRes.json();
          setPost(updatedPost);

          if (updatedPost.comments && Array.isArray(updatedPost.comments)) {
            const apiComments = transformComments(updatedPost.comments);
            setComments(apiComments);
            console.log('✅ Comments updated from API');
          }
        }
      } catch (refreshError) {
        console.warn('Post refresh failed:', refreshError);
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      // 롤백
      setComments(prev => prev.filter(c => c.id !== optimisticId));
      if (!isReply && post) {
        setPost(p => p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p);
      }
      alert('댓글 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCommentDelete = (commentId: number) => {
    // 댓글 삭제 후 포스트 데이터 새로고침
    const refreshPost = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (res.ok) {
          const updatedPost = await res.json();
          setPost(updatedPost);

          if (updatedPost.comments && Array.isArray(updatedPost.comments)) {
            const apiComments = transformComments(updatedPost.comments);
            setComments(apiComments);
            console.log('✅ Comments updated after deletion');
          }
        }
      } catch (error) {
        console.error('Failed to refresh after deletion:', error);
      }
    };

    refreshPost();
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
    // 신고 모달 열렸을 때 댓글 입력창 숨기기
    setShowCommentInput(false);
  };

  const handleReportClose = () => {
    // 신고 모달 닫혔을 때 댓글 입력창 다시 보이기
    setShowCommentInput(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen flex items-center justify-center text-sm text-zinc-500">
        로딩 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen flex items-center justify-center text-sm text-red-500">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="bg-white w-[375px] mx-auto">
        {/* Header */}
        <div className="h-14 flex items-center gap-1 px-5 border-b border-neutral-100">
          <button onClick={() => router.back()} className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200" aria-label="뒤로가기">
            <svg width="18" height="18" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <path d="M18 22L11 14.5L18 7" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1 text-zinc-900 text-base font-semibold text-center">작곡가 토크룸</div>
          <div className="w-9 h-9 flex items-center justify-center -mr-2">
            <ReportButton postId={postId} composerId={composerId} onOpenChange={(o)=> setShowCommentInput(!o)} />
          </div>
        </div>

        {/* Post Content */}
        <div className="px-5 pb-5 pt-4">
            <div className="flex items-start gap-2 mb-4">
                <Link href={`/writer-profile/${post.writerNickname}`}>
                    <div className="w-[31px] h-[31px] bg-zinc-300 rounded-md" />
                </Link>
                <div className="flex-1">
                    <p className="font-semibold text-sm text-zinc-700">{post.writerNickname}</p>
                    <p className="text-xs text-zinc-400">{getRelativeTime(post.createdAt)}</p>
                </div>
                <div className="flex items-center gap-[3px]">
                    <div className="w-3 h-3 bg-stone-300 rounded-sm" />
                    <span className="text-zinc-300 text-xs font-semibold">{post.type === 'STORY' ? '스토리' : '큐레이션'}</span>
                </div>
            </div>

            <div className="mb-2">
                <h2 className="text-sm font-semibold text-zinc-900">{post.title}</h2>
            </div>

            <div className="text-sm text-zinc-500 mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {post.content}
            </div>

            <div className="flex gap-1 text-sm text-zinc-400 mb-4">
                {post.hashtags.map((tag, idx) => <span key={`${tag}-${idx}`}>{tag}</span>)}
            </div>

            <div className="flex gap-1.5 mb-4">
                {post.images.map((src, index) => (
                    <Image
                      key={index}
                      src={src}
                      alt="Post image"
                      width={151}
                      height={151}
                      className="rounded-lg object-cover w-[151px] h-[151px]"
                    />
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <LikeButton defaultSelected={post.isLiked || false} size={30} />
                      <span>좋아요</span>
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ScrapButton defaultSelected={post.isScrapped || false} size={24} />
                      <span>스크랩</span>
                      <span>0</span>
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
          composerId={composerId}
          initialComments={[...comments].sort((a,b) => a.id - b.id)}
          onReply={handleReply}
          onReportOpen={handleReportOpen}
          onReportClose={handleReportClose}
          onDelete={handleCommentDelete}
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