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
  onDelete?: (commentId: number) => void;
}

export default function CommentList({ composerId, initialComments, onReply, onReportOpen, onReportClose, onLikeChange, onDelete }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments.slice(0, COMMENTS_PER_PAGE));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComments.length > COMMENTS_PER_PAGE);
  const loader = useRef<HTMLDivElement | null>(null);

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
    if (newComments.length >= initialComments.length) setHasMore(false);
  }, [hasMore, page, initialComments]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setTimeout(() => loadMoreComments(), 400);
      }
    }, { threshold: 1.0 });
    const current = loader.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore, loadMoreComments]);

  return (
    <>
      {comments.map(c => (
        <CommentItem key={c.id} comment={c} composerId={composerId} onReply={onReply} onReportOpen={onReportOpen} onReportClose={onReportClose} onLikeChange={onLikeChange} onDelete={onDelete} />
      ))}
      {hasMore && <div ref={loader} className="py-4 text-center text-zinc-500">댓글을 불러오는 중...</div>}
    </>
  );
}
