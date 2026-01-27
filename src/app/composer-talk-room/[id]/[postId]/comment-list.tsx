'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import CommentItem, { CommentData } from './comment-item';

const COMMENTS_PER_PAGE = 5;

interface CommentListProps {
  composerId?: string;
  initialComments: CommentData[];
  onReply?: (commentId: number, author: string) => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
  onLikeChange?: (commentId: number, isLiked: boolean, likeCount: number) => void;
}

export default function CommentList({ composerId, initialComments, onReply, onReportOpen, onReportClose, onLikeChange }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments.slice(0, COMMENTS_PER_PAGE));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComments.length > COMMENTS_PER_PAGE);
  const loader = useRef(null);

  // initialComments가 변경될 때마다 comments 업데이트
  useEffect(() => {
    const currentPageComments = initialComments.slice(0, page * COMMENTS_PER_PAGE);
    setComments(currentPageComments);
    setHasMore(currentPageComments.length < initialComments.length);
  }, [initialComments, page]);

  const loadMoreComments = useCallback(() => {
    if (!hasMore) return;

    const nextPage = page + 1;
    const newComments = initialComments.slice(0, nextPage * COMMENTS_PER_PAGE);
    
    setComments(newComments);
    setPage(nextPage);
    if (newComments.length >= initialComments.length) {
      setHasMore(false);
    }
  }, [hasMore, page, initialComments]);

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
  }, [hasMore, page, loadMoreComments]); // Dependency array updated for correctness

  return (
    <>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          composerId={composerId}
          onReply={onReply}
          onReportOpen={onReportOpen}
          onReportClose={onReportClose}
          onLikeChange={onLikeChange}
        />
      ))}
      {hasMore && (
        <div ref={loader} className="py-4 text-center text-zinc-500">
          댓글을 불러오는 중...
        </div>
      )}
    </>
  );
}
