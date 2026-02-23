'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useScrollLock } from '@/hooks/useScrollLock';

const eraFilters = [
  { id: 'MEDIEVAL_RENAISSANCE', label: '중세/르네상스' },
  { id: 'BAROQUE', label: '바로크' },
  { id: 'CLASSICAL', label: '고전주의' },
  { id: 'ROMANTIC', label: '낭만주의' },
  { id: 'MODERN_CONTEMPORARY', label: '근현대' },
];

const continentFilters = [
  { id: 'ASIA', label: '아시아' },
  { id: 'NORTH_AMERICA', label: '북아메리카' },
  { id: 'EUROPE', label: '유럽' },
  { id: 'SOUTH_AMERICA', label: '남아메리카' },
  { id: 'AFRICA_OCEANIA', label: '아프리카/오세아니아' },
];

type Filters = {
  eras: string[];
  continents: string[];
};

// ============================================================
// SearchFilterBar Props 타입 정의
// ============================================================
interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: Filters;
  onEraToggle: (eraId: string) => void;
  onContinentToggle: (continentId: string) => void;
  onRemoveFilter: (type: 'era' | 'continent', filterId: string) => void;
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  filters,
  onEraToggle,
  onContinentToggle,
  onRemoveFilter,
}: SearchFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);

  useScrollLock(isFilterOpen);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientY;
    const offset = Math.max(0, currentTouch - touchStart);
    setTouchOffset(offset);
  };

  const handleTouchEnd = () => {
    if (touchOffset > 100) {
      setIsFilterOpen(false);
    }
    setTouchStart(null);
    setTouchOffset(0);
  };

  // ========== 필터 라벨 조회 함수 ==========
  // 필터 ID로부터 한글 라벨을 반환
  const getFilterLabel = (type: 'era' | 'continent', filterId: string) => {
    const filterList = type === 'era' ? eraFilters : continentFilters;
    return filterList.find((f) => f.id === filterId)?.label || '';
  };

  // ========== 활성 필터 목록 생성 ==========
  // 현재 선택된 모든 필터를 통합 배열로 생성
  const activeFilters = [
    ...filters.eras.map((id) => ({
      type: 'era' as const,
      id,
      label: getFilterLabel('era', id),
    })),
    ...filters.continents.map((id) => ({
      type: 'continent' as const,
      id,
      label: getFilterLabel('continent', id),
    })),
  ];

  const totalActiveFilters = filters.eras.length + filters.continents.length;

  return (
    <>
      {/* 검색 및 필터 바 */}
      <div className="py-2.5 bg-white flex justify-center">
        <div className="w-80 px-2 py-1 bg-gray-100 rounded-full flex items-center justify-between">
          {/* 검색 입력 필드 */}
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent px-3 text-sm focus:outline-none"
          />
          <div className="flex">
            {/* 검색 버튼 */}
            <button className="p-1.5">
              <Image src="/icons/search.svg" alt="Search" width={20} height={20} />
            </button>
            {/* 필터 패널 토글 버튼 */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-1.5"
            >
              <Image src="/icons/filter.svg" alt="Filter" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 필터 패널 (모달) */}
      {isFilterOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* 필터 패널 */}
          <div
            style={{
              transform: `translateY(${touchOffset}px)`,
              transition: touchStart === null ? 'transform 0.3s ease-out' : 'none'
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[22px] shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.08)] z-50 max-w-[600px] mx-auto max-h-[85vh] flex flex-col overscroll-behavior-contain"
          >
            {/* 드래그 핸들 바 - touch-none으로 스크롤 간섭 방지 */}
            <div
              className="flex justify-center pt-[22px] pb-4 sticky top-0 bg-white rounded-t-[22px] cursor-grab active:cursor-grabbing touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-[80px] h-[5px] bg-[#bfbfbf] rounded-full" />
            </div>

            {/* 필터 패널 컨텐츠 */}
            <div className="px-5 pt-[10px] pb-10 flex flex-col gap-5 overflow-y-auto -webkit-overflow-scrolling-touch" style={{ overscrollBehavior: 'contain' }}>
              {/* 활성 필터 표시 영역 */}
              {totalActiveFilters > 0 && (
                <>
                  <div className="flex flex-wrap gap-[5px]">
                    {activeFilters.map((filter) => (
                      <button
                        key={`${filter.type}-${filter.id}`}
                        onClick={() => onRemoveFilter(filter.type, filter.id)}
                        className="bg-[#4c4c4c] border border-[#4c4c4c] px-3 py-[6px] rounded-full flex items-center gap-0.5"
                      >
                        <span className="text-white text-[13px] font-semibold">
                          {filter.label}
                        </span>
                        <Image
                          src="/icons/close-white.svg"
                          alt="제거"
                          width={12}
                          height={12}
                        />
                      </button>
                    ))}
                  </div>
                  {/* 구분선 */}
                  <div className="h-[1px] bg-[#f4f5f7]" />
                </>
              )}

              {/* 시대별 필터 섹션 */}
              <div>
                <h3 className="text-[#bfbfbf] text-[14px] font-semibold mb-5">
                  시대별
                </h3>
                <div className="flex flex-wrap gap-[5px]">
                  {eraFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => onEraToggle(filter.id)}
                      className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${filters.eras.includes(filter.id)
                        ? 'bg-[#4c4c4c] border-[#4c4c4c] text-white'
                        : 'bg-white border-[#d9d9d9] text-[#4c4c4c]'
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-[1px] bg-[#f4f5f7]" />

              {/* 대륙별 필터 섹션 */}
              <div>
                <h3 className="text-[#bfbfbf] text-[14px] font-semibold mb-5">
                  대륙별
                </h3>
                <div className="flex flex-wrap gap-[5px]">
                  {continentFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => onContinentToggle(filter.id)}
                      className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${filters.continents.includes(filter.id)
                        ? 'bg-[#4c4c4c] border-[#4c4c4c] text-white'
                        : 'bg-white border-[#d9d9d9] text-[#4c4c4c]'
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
