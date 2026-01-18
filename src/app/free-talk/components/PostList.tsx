'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostItem from './PostItem';

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
        `https://classic-daramg.duckdns.org/posts/free?${params.toString()}`,
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
  }, [posts.length]);

  // 초기 로드
  useEffect(() => {
    fetchPosts(null);
  }, []);

  // 검색어 필터링
  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
      post.content.toLowerCase().includes(searchTerm?.toLowerCase() || '')
    );
    setFilteredPosts(filtered);
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

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
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
