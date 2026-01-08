'use client';

import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  postId: string;
  composerId: string;
}

// 자유 토크룸 전용 신고 사유 목록
const REPORT_REASONS = [
  { id: 1, title: '1. 스팸/광고', description: '무관한 상업 광고, 도배성 홍보, 외부 사이트 유도' },
  { id: 2, title: '2. 부적절한 언어/욕설', description: '비속어, 혐오 발언, 음란 표현 등' },
  { id: 3, title: '3. 명예훼손/비방', description: '특정 개인/단체에 대한 악의적 허위사실 유포' },
  { id: 4, title: '4. 저작권 침해', description: '불법 복제 음원/영상/악보/촬영, 무단 이미지 사용' },
  { id: 5, title: '5. 주제와 무관한 내용', description: '카테고리/토크룸 주제와 전혀 상관없는 내용' },
  { id: 6, title: '6. 개인정보 유출', description: '전화번호, 주소, 계좌번호 등 개인정보 노출' },
  { id: 7, title: '7. 기타 (내용 입력 필수)', description: '위 항목에 해당하지 않는 부적절한 콘텐츠' }
];

export function ReportModal({ isOpen, onClose, onSubmit, postId, composerId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [additionalComment, setAdditionalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, composerId, reason: selectedReason, comment: additionalComment })
      });
      if (response.ok) {
        alert('신고가 접수되었습니다.');
        if (onSubmit) {
          onSubmit();
        } else {
          onClose();
        }
      } else {
        alert('신고 접수 중 오류가 발생했습니다.');
      }
    } catch {
      console.error('신고 접수 중 오류 발생');
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-[375px] max-h-[90vh] overflow-y-auto" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="flex items-center justify-center w-6 h-6" aria-label="닫기">
              <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="text-base font-semibold text-[#1A1A1A] ml-1">신고하기</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSubmit} disabled={!selectedReason || isSubmitting} className="flex items-center justify-center px-3.5 py-1.5 bg-[#293A92] rounded-full disabled:opacity-50">
              <span className="text-[13px] font-semibold text-white">등록</span>
              <svg width="12" height="11" viewBox="0 0 12 11" className="ml-0.5 rotate-90">
                <path d="M1 1L6 7.5L1 14" stroke="#BFC4DE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Post Type Section */}
        <div className="px-5 py-3.5 bg-[#F4F5F7]">
          <span className="text-[12px] font-medium text-[#4C4C4C]">게시글 유형</span>
        </div>
        <div className="flex items-center px-6 py-4">
          <div className="w-3 h-3 mr-2">
            <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#293A92" /></svg>
          </div>
          <span className="text-[14px] font-semibold text-[#1A1A1A]">자유글</span>
        </div>

        {/* Title Section */}
        <div className="px-5 py-3.5 bg-[#F4F5F7]">
          <span className="text-[12px] font-medium text-[#4C4C4C]">게시글 제목</span>
        </div>
        <div className="px-5 py-4">
          <input readOnly type="text" placeholder="자유글 제목" className="w-full text-[14px] font-medium text-[#D9D9D9] placeholder-[#D9D9D9] outline-none" />
        </div>

        {/* Report Reasons */}
        <div className="px-5 py-5">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-5">신고 사유 선택</h3>
          <div className="space-y-5">
            {REPORT_REASONS.map(r => (
              <div key={r.id} className="flex items-center gap-4.5">
                <button onClick={() => setSelectedReason(r.id)} className={`w-3 h-3 rounded-full border-[1.5px] ${selectedReason === r.id ? 'bg-[#293A92] border-[#293A92]' : 'border-[#D9D9D9] bg-white'}`} />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-[#4C4C4C] leading-[17px] tracking-[-0.02em]">{r.title}</div>
                  <div className="text-[14px] font-medium text-[#BFBFBF] leading-[17px] tracking-[-0.02em] mt-0.5">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
          {selectedReason === 7 && (
            <div className="mt-4">
              <div className="w-[284px] h-[88px] bg-[#F5F5F5] rounded-[10px] p-3.5">
                <textarea value={additionalComment} onChange={e => setAdditionalComment(e.target.value)} placeholder="기타 내용 작성" className="w-full h-full bg-transparent text-[12px] font-medium text-[#BFBFBF] placeholder-[#BFBFBF] outline-none resize-none" maxLength={200} />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-5 py-3.5 bg-[#F4F5F7]">
          <span className="text-[12px] font-medium text-[#4C4C4C]">게시글 내용</span>
        </div>
        <div className="px-5 py-4 h-[160px]">
          <textarea readOnly placeholder="신고 대상 게시글 내용" className="w-full h-full text-[14px] font-medium text-[#D9D9D9] placeholder-[#D9D9D9] outline-none resize-none" />
        </div>
      </div>
    </div>
  );
}
