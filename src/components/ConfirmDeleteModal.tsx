'use client';

import { useEffect } from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * ConfirmDeleteModal Component
 * 
 * Tailwind CSS로 디자인된 커스텀 삭제 확인 모달
 * - 뒤로가기 및 ESC 키로 닫기 가능
 * - 로딩 상태 표시
 * - 클래식 다람쥐 테마 색상 적용
 * 
 * @param isOpen - 모달 표시 여부
 * @param title - 모달 제목 (기본값: '삭제 확인')
 * @param message - 모달 메시지 (기본값: '정말 삭제하시겠습니까?')
 * @param itemName - 삭제할 항목명
 * @param onConfirm - 확인 버튼 클릭 핸들러
 * @param onCancel - 취소 버튼 클릭 핸들러
 * @param isLoading - 삭제 진행 중 여부
 */
export default function ConfirmDeleteModal({
  isOpen,
  title = '삭제 확인',
  message = '정말 삭제하시겠습니까?',
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  // ESC 키 핸들링
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-center">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">{title}</h2>
          </div>

          {/* 본문 */}
          <div className="px-6 py-4 space-y-2">
            <p className="text-sm text-[#666666]">{message}</p>
            {itemName && (
              <p className="text-sm font-medium text-[#1a1a1a] break-all">
                '{itemName}'
              </p>
            )}
            <p className="text-xs text-[#999999] pt-2">
              삭제된 포스트는 복구할 수 없습니다.
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#e5e7eb]">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-[#666666] bg-[#f4f5f7] hover:bg-[#efefef] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>삭제 중...</span>
                </>
              ) : (
                '삭제'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
