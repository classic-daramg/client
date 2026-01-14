'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommentInput from './comment-input';
import CommentList from './comment-list';
import { ReportButton } from './report-button';

// API 응답 타입 (OpenAPI 스펙 기준)
interface FreeTalkPost {
  id: number;
  title: string;
  content: string;
  images: string[];
  videoUrl: string | null;
  hashtags: string[];
  postStatus: string;
  likeCount: number;
  commentCount: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  writerNickname: string;
  type: string;
  primaryComposer: string | null;
  additionalComposers: string[] | null;
  isLiked?: boolean;
}

interface CommentData {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  isHeartSelected?: boolean;
  isReply?: boolean;
  parentId?: number;
}

/**
 * ===============================
 *  DATA FETCHING LAYER (SWAPPABLE)
 * ===============================
 * 1) 현재는 MOCK 데이터를 사용합니다.
 * 2) 나중에 실제 백엔드 URL을 전달받으면 REAL fetch 부분의 주석을 해제하고
 *    USE_MOCK = false 로 바꾸면 그대로 동작하도록 설계했습니다.
 * 3) 에러/로딩/변환(어댑터) 한 곳에서 처리 → 컴포넌트 깔끔 유지.
 */

// ----- 환경 스위치 -----
const USE_MOCK = false; // 실제 API 사용
const USE_COMMENT_API = true; // 댓글 POST/GET 사용 여부

// ----- 실제 API 엔드포인트 -----
const API_BASE = 'https://classic-daramg.duckdns.org';

// ----- REAL FETCH -----
async function fetchRealPost(postId: string): Promise<FreeTalkPost> {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('게시글 요청 실패');
  const json = await res.json();
  return json as FreeTalkPost;
}

// ----- MOCK 구현 -----
async function fetchMockPost(postId: string): Promise<FreeTalkPost> {
  await new Promise(r => setTimeout(r, 200));
  return {
    id: parseInt(postId),
    title: `샘플 자유글 제목 ${postId}`,
    content: '이곳은 자유 토크룸 글 내용입니다. 백엔드 연동 후 실제 데이터가 표기됩니다.\n여러 줄도 정상적으로 표현됩니다.',
    hashtags: ['#잡담', '#클래식', '#일상'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 5,
    commentCount: 2,
    images: ['/icons/img.svg'],
    videoUrl: null,
    postStatus: 'PUBLISHED',
    isBlocked: false,
    writerNickname: '익명다람쥐',
    type: 'FREE',
    primaryComposer: null,
    additionalComposers: null
  };
}

// ----- Unified Fetch Wrapper -----
async function fetchPostDetail(postId: string): Promise<FreeTalkPost> {
  if (USE_MOCK) return fetchMockPost(postId);
  return fetchRealPost(postId);
}

interface PageProps {
  params: Promise<{ postId: string }>; // Next 15 app router async params
}

export default function FreeTalkPostDetail({ params }: PageProps) {
  const [post, setPost] = useState<FreeTalkPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string>('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  // 댓글 상태
  const [comments, setComments] = useState<CommentData[]>([]);
  const [replyMode, setReplyMode] = useState<{ isReply: boolean; replyToId: number; replyToAuthor: string } | null>(null);
  const [hideInput, setHideInput] = useState(false); // 신고 모달 열릴 때 입력 숨김

  useEffect(() => {
    let active = true;
    params.then(async ({ postId }) => {
      setPostId(postId);
      try {
  const data = await fetchPostDetail(postId);
        if (active) {
          setPost(data);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '게시글을 불러오지 못했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [params]);

  // 초기 Mock 댓글 세팅 (포스트 로드 후 1회)
  useEffect(() => {
    if (post) {
      setLikesCount(post.likeCount);
      setLiked(post.isLiked || false);
      // 샘플 댓글 8개 (답글 포함)
      const mock: CommentData[] = [
        { id: 1, author: '익명1', timestamp: '1분 전', content: '재밌는 글이네요!', isHeartSelected: false },
        { id: 2, author: '익명2', timestamp: '3분 전', content: '동의합니다 ㅎㅎ', isHeartSelected: true },
        { id: 3, author: '익명3', timestamp: '5분 전', content: '클래식은 언제나 옳죠', isHeartSelected: false },
        { id: 4, author: '익명4', timestamp: '10분 전', content: '좋은 하루 되세요', isHeartSelected: false },
        { id: 5, author: '익명5', timestamp: '15분 전', content: '저도 비슷한 경험!', isHeartSelected: false },
        { id: 6, author: '익명6', timestamp: '20분 전', content: '답글 예시', isHeartSelected: false, isReply: true, parentId: 2 },
        { id: 7, author: '익명7', timestamp: '25분 전', content: '또 다른 댓글', isHeartSelected: false },
        { id: 8, author: '익명8', timestamp: '30분 전', content: '또 다른 답글', isHeartSelected: false, isReply: true, parentId: 7 }
      ];
      setComments(mock);
    }
  }, [post]);

  const handleToggleLike = async () => {
    // Save previous state for rollback
    const previousLiked = liked;
    const previousCount = likesCount;

    // Optimistic UI update (immediate feedback)
    setLiked(!liked);
    setLikesCount(c => liked ? c - 1 : c + 1);

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('좋아요 토글 실패');
      }

      const data = await res.json();

      // Sync with actual server state
      if (data && typeof data.isLiked === 'boolean') {
        setLiked(data.isLiked);
        setLikesCount(data.likeCount);
      }
    } catch (error) {
      console.error('Like toggle error:', error);

      // Rollback on failure
      setLiked(previousLiked);
      setLikesCount(previousCount);

      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleToggleBookmark = () => {
    setBookmarked(prev => !prev);
    // TODO: backend sync
  };

  const handleAddComment = async (content: string, isReply?: boolean, replyToId?: number) => {
    // 낙관적 UI 반영
    const optimisticId = Date.now();
    const optimistic: CommentData = {
      id: optimisticId,
      author: '익명다람쥐',
      timestamp: '방금',
      content,
      isReply: !!isReply,
      parentId: replyToId
    };
    setComments(prev => [...prev, optimistic]);
    if (!isReply) setPost(p => p ? { ...p, commentCount: p.commentCount + 1 } : p);
    setReplyMode(null);

    if (USE_COMMENT_API) {
      try {
        const res = await fetch(`/api/free-talk/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, parentId: replyToId })
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.comment) {
            // 낙관적 항목 교체
            setComments(prev => prev.map(c => c.id === optimisticId ? { ...json.comment, timestamp: '방금' } : c));
          }
        } else {
          throw new Error('댓글 전송 실패');
        }
      } catch (e) {
        console.error(e);
        // 롤백
        setComments(prev => prev.filter(c => c.id !== optimisticId));
        if (!isReply) setPost(p => p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p);
        alert('댓글 전송에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleReply = (commentId: number, author: string) => {
    setReplyMode({ isReply: true, replyToId: commentId, replyToAuthor: author });
  };

  const handleReportOpen = () => setHideInput(true);
  const handleReportClose = () => setHideInput(false);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen flex items-center justify-center text-sm text-zinc-500">
        로딩 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen flex items-center justify-center text-sm text-red-500">
        {error || '게시글을 찾을 수 없습니다.'}
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleString('ko-KR', { hour12: false });

  return (
    <div className="bg-gray-100 min-h-screen pb-40" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{/* bottom padding for fixed input */}
      <div className="bg-white w-96 mx-auto shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="h-14 flex items-center gap-1 px-5 border-b border-neutral-100">
          <Link href="/free-talk" className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200" aria-label="뒤로가기">
            <svg width="18" height="18" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <path d="M18 22L11 14.5L18 7" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="flex-1 text-zinc-900 text-base font-semibold text-center">자유 토크룸</div>
          <div className="w-9 h-9 flex items-center justify-center -mr-2">
            <ReportButton postId={post.id.toString()} composerId="" onOpenChange={(o)=> setHideInput(o)} />
          </div>
        </div>

        {/* Writer Info */}
        <div className="px-5 pb-5 pt-4 flex flex-col gap-4">
          <div className="w-full flex items-start gap-2">
            <Link href={`/writer-profile/${post.writerNickname}`} className="w-8 h-8 rounded-md bg-zinc-300 flex-shrink-0" />
            <div className="flex-1 flex flex-col">
              <p className="text-neutral-600 text-sm font-semibold leading-none mb-1">{post.writerNickname}</p>
              <p className="text-zinc-300 text-xs font-medium leading-none">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-[3px]">
              <div className="w-3 h-3 bg-stone-300 rounded-sm" />
              <span className="text-zinc-300 text-xs font-semibold">자유글</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-900 leading-snug break-words">{post.title}</h2>
            {/* Content */}
            <div className="text-neutral-400 text-sm font-medium whitespace-pre-wrap leading-relaxed">{post.content}</div>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap text-zinc-300 text-sm font-medium">
            {post.hashtags.map((tag: string) => <span key={tag}>{tag}</span>)}
          </div>

          {/* Images */}
          {(() => {
            const validImages = post.images?.filter(src =>
              src && (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://'))
            ) || [];

            return validImages.length > 0 && (
              <div className="flex gap-[5px]">
                {validImages.slice(0,3).map((src, idx) => (
                  <div key={idx} className="w-36 h-36 bg-zinc-300 rounded-lg overflow-hidden relative">
                    <Image src={src} alt="이미지" fill sizes="144px" className="object-cover" />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Reactions */}
          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2.5">
              <button onClick={handleToggleLike} className="flex items-center gap-1.5 group" aria-pressed={liked}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <Image src={liked ? '/icons/heart_selected.svg' : '/icons/heart.svg'} alt="좋아요" width={20} height={20} />
                </div>
                <span className={`text-xs font-medium ${liked ? 'text-blue-900' : 'text-neutral-400 group-hover:text-neutral-600'}`}>좋아요{likesCount > 0 ? ` ${likesCount}` : ''}</span>
              </button>
              <button onClick={handleToggleBookmark} className="flex items-center gap-1.5 group" aria-pressed={bookmarked}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <Image src={bookmarked ? '/icons/bookmark-on.svg' : '/icons/bookmark-off.svg'} alt="스크랩" width={20} height={20} />
                </div>
                <span className={`text-xs font-medium ${bookmarked ? 'text-blue-900' : 'text-neutral-400 group-hover:text-neutral-600'}`}>스크랩</span>
              </button>
            </div>
            <button className="w-6 h-6 flex items-center justify-center" aria-label="공유">
              <Image src="/icons/share.svg" alt="공유" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
      {/* 댓글 영역 */}
      <div className="w-96 mx-auto mt-2 flex flex-col gap-1.5">
        <div className="bg-white">
          <div className="px-5 pt-5 pb-2 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">댓글</h3>
            <span className="text-[11px] text-zinc-400">총 {post.commentCount}개</span>
          </div>
          <CommentList
            composerId=""
            initialComments={comments.sort((a,b) => a.id - b.id)}
            onReply={handleReply}
            onReportOpen={handleReportOpen}
            onReportClose={handleReportClose}
          />
        </div>
      </div>
      <CommentInput
        onSubmitComment={handleAddComment}
        replyMode={replyMode}
        onCancelReply={() => setReplyMode(null)}
        hidden={hideInput}
      />
    </div>
  );
}
