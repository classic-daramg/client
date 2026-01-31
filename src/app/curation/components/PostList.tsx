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
        const response = await apiClient.get('/posts/curation');

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
  }, []);

  // ========== 검색 및 필터 적용 로직 ==========
  // searchValue 또는 filters가 변경될 때마다 실행
  useEffect(() => {
    if (allPosts.length === 0) {
      setPosts([]);
      return;
    }

    // 정렬된 포스트 배열 생성
    const sortedPosts = [...allPosts].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // ========== 검색 우선순위 (최상위) ==========
      // 검색어가 존재하고 content에 포함되면 최상위 우선순위 부여
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        if (a.content.toLowerCase().includes(searchLower)) scoreA += 1000;
        if (b.content.toLowerCase().includes(searchLower)) scoreB += 1000;
        // 제목도 검색 (content보다 낮은 우선순위)
        if (a.title.toLowerCase().includes(searchLower)) scoreA += 500;
        if (b.title.toLowerCase().includes(searchLower)) scoreB += 500;
      }

      // ========== 필터링 우선순위 (그 다음) ==========
      // 시대 필터가 선택된 경우, 해당 시대에 맞는 작곡가 게시물에 우선순위 부여
      // (백엔드에서 composer.era 정보를 tags에 포함한다고 가정)
      if (filters.eras.length > 0) {
        const hasMatchingEra = filters.eras.some((era) =>
          a.tags.some((tag) => tag.includes(era))
        );
        if (hasMatchingEra) scoreA += 100;

        const hasMatchingEraB = filters.eras.some((era) =>
          b.tags.some((tag) => tag.includes(era))
        );
        if (hasMatchingEraB) scoreB += 100;
      }

      // ========== 대륙 필터 우선순위 ==========
      // 대륙 필터가 선택된 경우, 해당 대륙에 맞는 작곡가 게시물에 우선순위 부여
      if (filters.continents.length > 0) {
        const hasMatchingContinent = filters.continents.some((continent) =>
          a.tags.some((tag) => tag.includes(continent))
        );
        if (hasMatchingContinent) scoreA += 50;

        const hasMatchingContinentB = filters.continents.some((continent) =>
          b.tags.some((tag) => tag.includes(continent))
        );
        if (hasMatchingContinentB) scoreB += 50;
      }

      // ========== 동점일 경우 최신순 정렬 ==========
      // 점수가 같으면 생성 시간 역순 (최신 먼저)
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // 점수가 높을수록 앞으로
      }

      // 모든 조건이 같으면 id로 역순 정렬 (최신 먼저)
      return b.id - a.id;
    });

    setPosts(sortedPosts);
  }, [searchValue, filters, allPosts]);

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
