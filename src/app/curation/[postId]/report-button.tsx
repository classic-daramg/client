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
        <Image src="/icons/siren.svg" alt="신고" width={24} height={24} />
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