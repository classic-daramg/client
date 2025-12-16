'use client';


import { useState } from 'react';
import Image from 'next/image';
import { ReportModal } from './report-modal';
import LikeButton from '@/components/LikeButton';

export interface CommentItemProps {
  comment: {
    id: number;
    author: string;
    timestamp: string;
    content: string;
    isHeartSelected?: boolean; // API에서 받아온 디폴트 값
  };
  isReply?: boolean;
  composerId?: string;
  onReply?: (commentId: number, author: string) => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
}


const CommentItem = ({ comment, isReply = false, composerId, onReply, onReportOpen, onReportClose }: CommentItemProps) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReplyClick = () => {
    if (onReply) {
      onReply(comment.id, comment.author);
    }
  };

  const handleReportClick = () => {
    setIsReportModalOpen(true);
    if (onReportOpen) {
      onReportOpen();
    }
  };

  const handleReportModalClose = () => {
    setIsReportModalOpen(false);
    if (onReportClose) {
      onReportClose();
    }
  };

  return (
    <>
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleReportModalClose}
          postId={`comment-${comment.id}`}
          composerId={composerId || ''}
        />
      )}
      <div className={`bg-white box-border content-stretch flex flex-col gap-2.5 items-center justify-start py-[18px] relative shrink-0 w-full ${isReply ? 'pl-[50px] pr-5' : 'px-5'}`}>
      <div className="content-stretch flex gap-2 items-start justify-start relative shrink-0 w-full">
        <div className="bg-[#d9d9d9] rounded-full shrink-0 size-[31px] flex items-center justify-center mt-1">
          <Image src="/icons/profile.svg" alt="profile" width={20} height={20} />
        </div>
        <div className="basis-0 content-stretch flex flex-col grow items-start justify-start">
          <p className="text-[#4c4c4c] text-[14px] font-semibold">{comment.author}</p>
          <p className="text-[#d9d9d9] text-[12px] font-medium">{comment.timestamp}</p>
        </div>
        <div className="content-stretch flex gap-0.5 items-center justify-start relative shrink-0">
          <LikeButton defaultSelected={!!comment.isHeartSelected} size={26} />
          <button 
            onClick={handleReplyClick}
            className="overflow-clip relative shrink-0 size-[26px] hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image src="/icons/message.svg" alt="reply" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
          <button 
            onClick={handleReportClick}
            className="overflow-clip relative shrink-0 size-[26px] hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image src="/icons/alarm.svg" alt="report" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center leading-normal not-italic relative shrink-0 text-[#a6a6a6] text-[14px] w-full">
        <p>{comment.content}</p>
        </div>
      </div>
    </>
  );
};

export default CommentItem;
