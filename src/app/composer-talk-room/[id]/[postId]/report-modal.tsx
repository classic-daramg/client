'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  composerId: string;
}

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/혐오 표현',
  '성적인 내용',
  '폭력적/위험한 내용',
  '거짓 정보',
  '저작권 침해',
  '기타'
];

export function ReportModal({ isOpen, onClose, postId, composerId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    
    try {
      // TODO: API 호출
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          composerId,
          reason: selectedReason,
          comment: additionalComment,
        }),
      });

      if (response.ok) {
        alert('신고가 접수되었습니다.');
        onClose();
      } else {
        alert('신고 접수 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[335px] rounded-2xl p-6 mx-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">게시글 신고</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Report Reasons */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-700 mb-3">신고 사유를 선택해주세요</h3>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-700">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Comment */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-700 mb-2">추가 설명 (선택사항)</h3>
          <textarea
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            placeholder="신고 사유에 대한 구체적인 설명을 입력해주세요."
            className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {additionalComment.length}/200
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '신고 중...' : '신고하기'}
          </button>
        </div>

        {/* Notice */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 leading-relaxed">
            허위 신고 시 서비스 이용에 제한이 있을 수 있으며, 신고 내용은 관리자가 검토 후 처리됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}