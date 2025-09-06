'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReportModal } from './report-modal';

interface ReportButtonProps {
  postId: string;
  composerId: string;
}

export function ReportButton({ postId, composerId }: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="신고하기"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"
            fill="currentColor"
          />
        </svg>
      </button>
      
      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          postId={postId}
          composerId={composerId}
        />
      )}
    </>
  );
}