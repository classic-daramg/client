'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

interface EditDeleteButtonsProps {
  postId: string;
  postType: 'FREE' | 'CURATION' | 'STORY';
  postTitle?: string;
  onDelete: () => Promise<void>;
}

/**
 * EditDeleteButtons Component
 * 
 * 작성자 본인에게만 표시되는 수정/삭제 버튼 컴포넌트
 * - 드롭다운 메뉴 UI
 * - 커스텀 삭제 확인 모달
 * - 로딩 상태 표시
 * 
 * @param postId - 포스트 ID
 * @param postType - 포스트 타입 (수정 페이지 이동 시 사용)
 * @param postTitle - 포스트 제목 (삭제 모달에 표시)
 * @param onDelete - 삭제 핸들러 함수
 */
export default function EditDeleteButtons({
  postId,
  postType,
  postTitle,
  onDelete,
}: EditDeleteButtonsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 수정 페이지로 이동
  const handleEdit = () => {
    // 포스트 타입에 따라 적절한 쿼리 파라미터와 함께 수정 페이지로 이동
    const queryParams = new URLSearchParams();
    queryParams.set('type', postType.toLowerCase());
    queryParams.set('edit', postId);
    
    router.push(`/write?${queryParams.toString()}`);
    setShowMenu(false);
  };

  // 삭제 모달 열기
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  // 삭제 확인 및 실행
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="relative">
        {/* 더보기 버튼 (3-dot menu) */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition"
          aria-label="메뉴"
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
          </div>
        </button>

        {/* 드롭다운 메뉴 */}
        {showMenu && (
          <>
            {/* 배경 오버레이 (클릭 시 닫기) */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* 메뉴 팝업 */}
            <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-[#e5e7eb] min-w-[120px] overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-sm font-medium text-[#1a1a1a] hover:bg-[#f4f5f7] transition flex items-center gap-2"
              >
                <Image
                  src="/icons/write.svg"
                  alt="수정"
                  width={16}
                  height={16}
                />
                <span>수정하기</span>
              </button>

              <div className="h-px bg-[#e5e7eb]" />

              <button
                onClick={handleOpenDeleteModal}
                disabled={isDeleting}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image
                  src="/icons/close-white.svg"
                  alt="삭제"
                  width={16}
                  height={16}
                  className="filter-red"
                />
                <span>{isDeleting ? '삭제 중...' : '삭제하기'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="포스트 삭제"
        message="정말 이 포스트를 삭제하시겠습니까?"
        itemName={postTitle}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setIsDeleting(false);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
