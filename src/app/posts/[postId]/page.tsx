'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeBack } from '@/hooks/useSafeBack';
import Image from 'next/image';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';
import { usePostAuth } from '@/hooks/usePostAuth';
import PostHeader from './components/PostHeader';
import PostContent from './components/PostContent';
import PostFooter from './components/PostFooter';
import CommentSection from './components/CommentSection';
import PostSkeleton from './components/PostSkeleton';
import EditDeleteButtons from './components/EditDeleteButtons';
import ToastNotification from '@/components/ToastNotification';

// ================== TypeScript Interfaces ==================

interface Composer {
  composerId: number;
  koreanName: string;
  englishName: string;
  nativeName: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthYear: number;
  deathYear: number;
  bio: string;
}

interface Comment {
  id: number;
  content: string;
  writerNickname: string;
  writerProfileImage: string;
  createdAt: string;
  isLiked: boolean;
  likeCount: number;
  parentCommentId: number | null;
  childComments?: Comment[];
}

interface PostDetail {
  id: number;
  type: 'FREE' | 'CURATION' | 'STORY';
  title: string;
  content: string;
  writerNickname: string;
  writerProfileImage: string;
  createdAt: string;
  updatedAt: string;
  postStatus: 'PUBLISHED' | 'DRAFT';
  isLiked: boolean;
  isScrapped: boolean;
  isBlocked: boolean;
  likeCount: number;
  commentCount: number;
  images: string[];
  hashtags: string[];
  videoUrl: string | null;
  primaryComposer?: Composer;
  additionalComposers?: Composer[];
  comments: Comment[];
}

interface PostDetailPageProps {
  params: Promise<{
    postId: string;
  }>;
}

// ================== Main Component ==================

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const handleSafeBack = useSafeBack('/');
  const [postId, setPostId] = useState<string>('');
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ========== Authorization Hook ==========
  // 로그인 여부 및 작성자 본인 여부를 판별
  const { isAuthenticated, isAuthor, currentUserNickname } = usePostAuth(
    post?.writerNickname || '',
    post?.isLiked,
    post?.isScrapped
  );

  // ========== Data Fetching ==========
  useEffect(() => {
    params.then(async ({ postId: pId }) => {
      setPostId(pId);
      await fetchPostDetail(pId);
    });
  }, [params]);

  const fetchPostDetail = async (pId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/posts/${pId}`);
      setPost(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || '포스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ========== Event Handlers ==========
  
  // 토스트 알림 표시 헬퍼
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 로그인 필수 액션 체크
  const requireAuth = (action: string = '기능'): boolean => {
    if (!isAuthenticated) {
      if (confirm(`${action}을 사용하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`)) {
        router.push('/loginpage');
      }
      return false;
    }
    return true;
  };
  
  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    if (!post) return;
    
    // 로그인 체크
    if (!requireAuth('좋아요')) return;

    const prevLiked = post.isLiked;
    const prevCount = post.likeCount;

    // Optimistic Update
    setPost({
      ...post,
      isLiked: !prevLiked,
      likeCount: prevLiked ? prevCount - 1 : prevCount + 1,
    });

    try {
      await apiClient.post(`/posts/${postId}/like`);
      showToast(prevLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.');
    } catch (err) {
      // Rollback on error
      setPost({
        ...post,
        isLiked: prevLiked,
        likeCount: prevCount,
      });
      console.error('Failed to toggle like:', err);
      showToast('좋아요 처리에 실패했습니다.', 'error');
    }
  };

  // 스크랩 토글 핸들러
  const handleToggleScrap = async () => {
    if (!post) return;
    
    // 로그인 체크
    if (!requireAuth('스크랩')) return;

    const prevScrapped = post.isScrapped;

    // Optimistic Update
    setPost({
      ...post,
      isScrapped: !prevScrapped,
    });

    try {
      await apiClient.post(`/posts/${postId}/scrap`);
      showToast(prevScrapped ? '스크랩을 취소했습니다.' : '스크랩했습니다.');
    } catch (err) {
      // Rollback on error
      setPost({
        ...post,
        isScrapped: prevScrapped,
      });
      console.error('Failed to toggle scrap:', err);
      const axiosError = err as AxiosError<{ message: string }>;
      showToast(axiosError.response?.data?.message || '스크랩 처리에 실패했습니다.', 'error');
    }
  };

  // 댓글 추가 핸들러
  const handleAddComment = async (content: string, parentCommentId?: number) => {
    // 로그인 체크
    if (!requireAuth('댓글 작성')) return;

    try {
      if (parentCommentId) {
        // 대댓글 생성
        await apiClient.post(`/comments/${parentCommentId}/replies`, { content });
        showToast('답글이 작성되었습니다.');
      } else {
        // 댓글 생성
        await apiClient.post(`/posts/${postId}/comments`, { content });
        showToast('댓글이 작성되었습니다.');
      }
      
      // 포스트 데이터 새로고침
      await fetchPostDetail(postId);
    } catch (err) {
      console.error('Failed to add comment:', err);
      showToast('댓글 작성에 실패했습니다.', 'error');
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/comments/${commentId}`);
      showToast('댓글이 삭제되었습니다.');
      await fetchPostDetail(postId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showToast('댓글 삭제에 실패했습니다.', 'error');
    }
  };

  // 댓글 좋아요 토글 핸들러
  const handleToggleCommentLike = async (commentId: number) => {
    // 로그인 체크
    if (!requireAuth('댓글 좋아요')) return;

    try {
      await apiClient.post(`/comments/${commentId}/like`);
      await fetchPostDetail(postId);
    } catch (err) {
      console.error('Failed to toggle comment like:', err);
      showToast('댓글 좋아요 처리에 실패했습니다.', 'error');
    }
  };  // 포스트 삭제 핸들러 (작성자 전용)
  const handleDeletePost = async () => {
    try {
      await apiClient.delete(`/posts/${postId}`);
      showToast('포스트가 삭제되었습니다.');
      
      // 1초 후 타입별 이전 페이지로 이동
      setTimeout(() => {
        if (post?.type === 'CURATION') {
          router.push('/curation');
        } else if (post?.type === 'FREE') {
          router.push('/free-talk');
        } else if (post?.type === 'STORY' && post.primaryComposer) {
          router.push(`/composer-talk-room/${post.primaryComposer.composerId}`);
        } else {
          router.push('/');
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to delete post:', err);
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMsg = axiosError.response?.data?.message || '포스트 삭제에 실패했습니다.';
      showToast(errorMsg, 'error');
      throw err; // 모달을 닫기 위해 에러 던지기
    }
  };

  // ========== Render States ==========
  
  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '포스트를 불러올 수 없습니다.'}</p>
          <button
            onClick={handleSafeBack}
            className="px-4 py-2 bg-[#293a92] text-white rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ========== Get Header Title Based on Type ==========
  const getHeaderTitle = () => {
    if (post.type === 'CURATION') return '큐레이션 글';
    if (post.type === 'FREE') return '자유 글';
    if (post.type === 'STORY' && post.primaryComposer) {
      return `${post.primaryComposer.koreanName} 이야기`;
    }
    return '포스트';
  };

  // ========== Get Back URL Based on Type ==========
  const getBackUrl = () => {
    if (post.type === 'CURATION') return '/curation';
    if (post.type === 'FREE') return '/free-talk';
    if (post.type === 'STORY' && post.primaryComposer) {
      return `/composer-talk-room/${post.primaryComposer.composerId}`;
    }
    return '/';
  };

  // ========== Main Render ==========
  
  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="bg-white w-full max-w-md mx-auto">
        {/* ========== Header ========== */}
        <div className="px-5 py-3 flex items-center gap-1 border-b border-[#f4f5f7] sticky top-0 bg-white z-10">
          <Link href={getBackUrl()} className="flex-shrink-0">
            <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
          </Link>
          <h1 className="flex-1 text-center text-[#1a1a1a] text-base font-semibold">
            {getHeaderTitle()}
          </h1>
          
          {/* 작성자 본인에게만 수정/삭제 버튼 표시 */}
          {isAuthor && (
            <EditDeleteButtons
              postId={postId}
              postType={post.type}
              postTitle={post.title}
              onDelete={handleDeletePost}
            />
          )}
        </div>

        {/* ========== Post Header ========== */}
        <PostHeader
          author={post.writerNickname}
          profileImage={post.writerProfileImage}
          timestamp={post.createdAt}
          postType={post.type}
        />

        {/* ========== Post Content ========== */}
        <PostContent
          title={post.title}
          content={post.content}
          images={post.images}
          videoUrl={post.videoUrl}
          hashtags={post.hashtags}
          primaryComposerName={post.primaryComposer?.koreanName}
          additionalComposerNames={
            post.type === 'CURATION'
              ? (post.additionalComposers || [])
                  .map((composer) => composer.koreanName || composer.englishName)
                  .filter((name): name is string => !!name)
              : []
          }
          showComposerChip={post.type === 'CURATION' && !!post.primaryComposer}
        />

        {/* ========== Post Footer ========== */}
        <PostFooter
          likeCount={post.likeCount}
          isLiked={post.isLiked}
          isScrapped={post.isScrapped}
          onToggleLike={handleToggleLike}
          onToggleScrap={handleToggleScrap}
          postId={postId}
        />
      </div>

      {/* ========== Comment Section ========== */}
      <div className="mt-1.5 w-full max-w-md mx-auto pb-32">
        <CommentSection
          comments={post.comments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onToggleCommentLike={handleToggleCommentLike}
          isAuthenticated={isAuthenticated}
          currentUserNickname={currentUserNickname ?? undefined}
        />
      </div>

      {/* ========== Toast Notification ========== */}
      {toast && (
        <ToastNotification
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
