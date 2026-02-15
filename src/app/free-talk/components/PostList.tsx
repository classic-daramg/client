'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostItem from './PostItem';
import { getApiUrl } from '@/lib/api';
import { trackSearch } from '@/lib/ga';

interface ApiPost {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  createdAt: string;
  writerNickname: string;
  likeCount: number;
  commentCount: number;
  thumbnailImageUrl: string | null;
  videoUrl?: string | null;
  type: string;
}

interface ApiResponse {
  content: ApiPost[];
  nextCursor: string | null;
  hasNext: boolean;
}

// 상대 시간 포맷팅 함수
function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function PostList({ searchTerm }: { searchTerm?: string }) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState<ApiPost[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  // API에서 포스트 조회
  const fetchPosts = useCallback(async (nextCursor: string | null = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextCursor) {
        params.append('cursor', nextCursor);
      }
      params.append('size', '10');

      const response = await fetch(
        getApiUrl(`/posts/free?${params.toString()}`),
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data: ApiResponse = await response.json();

        if (nextCursor) {
          setPosts(prev => [...prev, ...data.content]);
        } else {
          setPosts(data.content);
        }

        setCursor(data.nextCursor);
        setHasMore(data.hasNext);
      } else {
        console.error('Failed to fetch posts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchPosts(null);
  }, [fetchPosts]);

  // 검색어 필터링 (제목, 내용, 해시태그)
  useEffect(() => {
    if (!searchTerm?.trim()) {
      // 검색어가 없으면 모든 포스트 표시
      setFilteredPosts(posts);
    } else {
      const query = searchTerm.toLowerCase();
      // GA4 검색 이벤트 추적
      trackSearch(searchTerm, 'free-talk');

      const filtered = posts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const contentMatch = post.content.toLowerCase().includes(query);
        const hashtagMatch = post.hashtags.some(tag => tag.toLowerCase().includes(query));

        // 제목, 내용, 해시태그 중 하나라도 일치하면 포함
        return titleMatch || contentMatch || hashtagMatch;
      });
      setFilteredPosts(filtered);
    }
  }, [posts, searchTerm]);

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(cursor);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, cursor, fetchPosts]);

  return (
    <div className="self-stretch bg-white flex flex-col justify-start items-center">
      {filteredPosts.length === 0 && !loading ? (
        <div className="w-full py-10 text-center text-zinc-400">
          {posts.length === 0 ? '로드된 포스트가 없습니다.' : '검색 결과가 없습니다.'}
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostItem
            key={`${post.id}-${post.title}`}
            id={post.id}
            title={post.title}
            content={post.content}
            tags={post.hashtags.map(tag => tag.replace('#', ''))}
            likes={post.likeCount}
            comments={post.commentCount}
            timeAgo={getRelativeTime(post.createdAt)}
            author={post.writerNickname}
            hasImage={post.thumbnailImageUrl !== null}
            thumbnailUrl={post.thumbnailImageUrl}
            videoUrl={post.videoUrl}
          />
        ))
      )}
      {hasMore && (
        <div ref={loaderRef} className="w-full py-4 text-center text-zinc-400">
          {loading ? '포스트를 불러오는 중...' : '더 보기'}
        </div>
      )}
    </div>
  );
}
