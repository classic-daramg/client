'use client';

import React, { useState, useEffect, useRef } from 'react';
import CommentItem from './comment-item';
import { Comment } from './page'; // Type from page.tsx

const COMMENTS_PER_PAGE = 5;

interface CommentListProps {
  composerId?: string;
  initialComments: Comment[];
}

export default function CommentList({ composerId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments.slice(0, COMMENTS_PER_PAGE));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComments.length > COMMENTS_PER_PAGE);
  const loader = useRef(null);

  const loadMoreComments = () => {
    if (!hasMore) return;

    const nextPage = page + 1;
    const newComments = initialComments.slice(0, nextPage * COMMENTS_PER_PAGE);
    
    setComments(newComments);
    setPage(nextPage);
    if (newComments.length >= initialComments.length) {
      setHasMore(false);
    }
  };

  useEffect(() => {//무한스크롤의 영역
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // Simulate network latency
          setTimeout(() => {
            loadMoreComments();
          }, 500);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, page]); // Dependency array updated for correctness

  return (
    <>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} isReply={comment.isReply} composerId={composerId} />
      ))}
      {hasMore && (
        <div ref={loader} className="py-4 text-center text-zinc-500">
          댓글을 불러오는 중...
        </div>
      )}
    </>
  );
}
