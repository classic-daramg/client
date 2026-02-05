'use client';

import PostItem from './PostItem';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

// ============================================================
// Post 인터페이스 및 API 응답 타입
// ============================================================
interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  author: string;
  writerNickname: string;
  createdAt: string;
  imageUrl?: string;
}

interface ApiPost {
  id: number;
  title: string;
  content: string;
  hashtags?: string[];
  tags?: string[];
  keywords?: string[];
  likeCount?: number;
  commentCount?: number;
  writerNickname?: string;
  createdAt: string;
  thumbnailImageUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  images?: Array<{ url?: string } | string>;
}

interface Filters {
  eras: string[];
  continents: string[];
}

interface PostListProps {
  searchValue: string;
  filters: Filters;
}

export default function PostList({ searchValue, filters }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]); // 원본 데이터 저장
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== API 호출 및 초기 데이터 로딩 ==========
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // ========== 쿼리 파라미터 구성 ==========
        const queryParams = new URLSearchParams();
        
        // eras 필터 추가
        if (filters.eras.length > 0) {
          queryParams.append('eras', filters.eras.join(','));
        }
        
        // continents 필터 추가
        if (filters.continents.length > 0) {
          queryParams.append('continents', filters.continents.join(','));
        }
        
        const url = `/posts/curation${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await apiClient.get(url);

        if (response.status !== 200) {
          throw new Error('포스트 목록을 불러올 수 없습니다.');
        }

        const data = response.data;

        // ========== API 응답을 Post 형식으로 변환 ==========
        const formattedPosts = data.content?.map((post: ApiPost) => {
          // 디버깅: API 응답 구조 확인
          console.log('API Post Data:', post);
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            // tags 필드 다양하게 매핑 (백엔드 응답 구조에 따라)
            // free-talk에서는 hashtags를 사용하므로 우선순위: hashtags > tags > keywords
            tags: post.hashtags || post.tags || post.keywords || [],
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            author: post.writerNickname || 'Unknown',
            writerNickname: post.writerNickname || 'Unknown',
            createdAt: formatTimeAgo(post.createdAt),
            // 썸네일 이미지 URL 매핑 (우선순위대로 확인)
            imageUrl:
              post.thumbnailImageUrl ||
              post.imageUrl ||
              post.imageUrls?.[0] ||
              (typeof post.images?.[0] === 'string' ? post.images[0] : post.images?.[0]?.url),
          };
        }) || [];

        // 원본 데이터 저장 (검색/필터 적용 시 사용)
        setAllPosts(formattedPosts);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '오류가 발생했습니다.'
        );
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filters]);

  // ========== 검색 및 필터 적용 로직 ==========
  // searchValue 또는 filters가 변경될 때마다 실행
  useEffect(() => {
    if (allPosts.length === 0) {
      setPosts([]);
      return;
    }

    // ========== 1단계: 검색어 필터링 (클라이언트 사이드) ==========
    const searchFiltered = allPosts.filter((post) => {
      // 검색어가 없으면 모두 포함
      if (!searchValue.trim()) {
        return true;
      }

      const searchLower = searchValue.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      
      // 제목, 내용, 태그 중 하나라도 일치해야 함
      return titleMatch || contentMatch || tagsMatch;
    });

    // ========== 2단계: 정렬 (검색 일치도, 최신순) ==========
    const sortedPosts = [...searchFiltered].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 검색어가 있으면 일치도로 정렬
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        
        // 제목에 일치하면 최우선
        if (a.title.toLowerCase().includes(searchLower)) scoreA += 1000;
        if (b.title.toLowerCase().includes(searchLower)) scoreB += 1000;
        
        // 내용에 일치하면 그 다음
        if (a.content.toLowerCase().includes(searchLower)) scoreA += 500;
        if (b.content.toLowerCase().includes(searchLower)) scoreB += 500;
        
        // 태그에 일치하면 마지막
        if (a.tags.some((tag) => tag.toLowerCase().includes(searchLower))) scoreA += 100;
        if (b.tags.some((tag) => tag.toLowerCase().includes(searchLower))) scoreB += 100;
      }

      // 점수가 다르면 점수순
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // 점수가 같으면 최신순 (id 역순)
      return b.id - a.id;
    });

    setPosts(sortedPosts);
  }, [searchValue, allPosts]);

  // ========== 시간 포맷팅 함수 ==========
  // 생성 시간을 상대적 시간으로 표시 (예: "2시간전")
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}초전`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일전`;

    return date.toLocaleDateString('ko-KR');
  };

  // ========== 로딩 상태 ==========
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 bg-white">
        <p className="font-medium text-xs text-[#a6a6a6]">로딩 중...</p>
      </div>
    );
  }

  // ========== 에러 상태 ==========
  if (error) {
    return (
      <div className="flex justify-center items-center py-8 bg-white">
        <p className="font-medium text-xs text-red-500">{error}</p>
      </div>
    );
  }

  // ========== 포스트 목록 렌더링 ==========
  return (
    <div className="flex flex-col bg-white">
      {posts.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="font-medium text-xs text-[#a6a6a6]">
            {searchValue || Object.values(filters).some((arr) => arr.length > 0)
              ? '검색 또는 필터에 맞는 포스트가 없습니다.'
              : '포스트가 없습니다.'}
          </p>
        </div>
      ) : (
        posts.map((post, index) => (
          <PostItem key={post.id} post={post} isFirst={index === 0} />
        ))
      )}
    </div>
  );
}
