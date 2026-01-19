'use client';

import PostItem from './PostItem';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

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

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/posts/curation');
        
        // Axios는 response.ok 대신 status로 성공 여부 판단
        if (response.status !== 200) {
          throw new Error('포스트 목록을 불러올 수 없습니다.');
        }
        const data = response.data;
        
        // API 응답을 PostItem 형식으로 변환
        const formattedPosts = data.content?.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags || [],
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          author: post.author?.nickname || 'Unknown',
          createdAt: formatTimeAgo(post.createdAt),
          imageUrl: post.images?.[0],
        })) || [];
        
        setPosts(formattedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 시간 포맷팅 함수
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 bg-white">
        <p className="text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8 bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {posts.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-zinc-400">포스트가 없습니다.</p>
        </div>
      ) : (
        posts.map((post, index) => (
          <PostItem key={post.id} post={post} isFirst={index === 0} />
        ))
      )}
    </div>
  );
}
