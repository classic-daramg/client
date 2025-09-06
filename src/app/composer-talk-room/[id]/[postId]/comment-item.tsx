// src/app/composer-talk-room/[id]/[postId]/comment-item.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReportModal } from './report-modal';

interface CommentItemProps {
  comment: {
    id: number;
    author: string;
    timestamp: string;
    content: string;
    isHeartSelected?: boolean;
  };
  isReply?: boolean;
  composerId?: string;
}

const CommentItem = ({ comment, isReply = false, composerId }: CommentItemProps) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          postId={`comment-${comment.id}`}
          composerId={composerId || ''}
        />
      )}
      <div className={`bg-white box-border content-stretch flex flex-col gap-2.5 items-center justify-start py-[18px] relative shrink-0 w-full ${isReply ? 'pl-[50px] pr-5' : 'px-5'}`}>
      <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0 w-full">
        <div className="bg-[#d9d9d9] rounded-full shrink-0 size-[31px]" />
        <div className="basis-0 content-stretch flex flex-col grow items-start justify-start">
          <p className="text-[#4c4c4c] text-[14px] font-semibold">{comment.author}</p>
          <p className="text-[#d9d9d9] text-[12px] font-medium">{comment.timestamp}</p>
        </div>
        <div className="content-stretch flex gap-0.5 items-center justify-start relative shrink-0">
          <button className="overflow-clip relative shrink-0 size-[26px]">
            <Image src={comment.isHeartSelected ? "/icons/heart_selected.svg" : "/icons/heart.svg"} alt="heart" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
          <button className="overflow-clip relative shrink-0 size-[26px]">
            <Image src="/icons/message.svg" alt="comment" width={18} height={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
          <button 
            onClick={() => setIsReportModalOpen(true)}
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
