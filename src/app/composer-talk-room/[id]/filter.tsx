'use client';

import React from 'react';
import Image from 'next/image';

type FilterProps = {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: string[];
  onRemoveFilter: (filterId: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
};

export default function RoomFilter({
  isOpen,
  onClose,
  activeFilters,
  onRemoveFilter,
  selectedCategory,
  onCategorySelect,
}: FilterProps) {
  const categories = [
    { id: 'rachmaninoff', label: '라흐마니노프 이야기' },
    { id: 'curation', label: '큐레이션글' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[22px] shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.08)] z-50 max-w-[600px] mx-auto">
        {/* Handle Bar */}
        <div className="flex justify-center pt-[22px]">
          <div className="w-[80px] h-[5px] bg-[#bfbfbf] rounded-full" />
        </div>

        {/* Content */}
        <div className="px-5 pt-[38px] pb-5 flex flex-col gap-5">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-[5px]">
              {activeFilters.map((filterId) => {
                const filter = categories.find(c => c.id === filterId);
                if (!filter) return null;
                
                return (
                  <button
                    key={filterId}
                    onClick={() => onRemoveFilter(filterId)}
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
                );
              })}
            </div>
          )}

          {/* Separator */}
          {activeFilters.length > 0 && (
            <div className="h-[1px] bg-[#f4f5f7]" />
          )}

          {/* Category Label */}
          <div className="text-[#bfbfbf] text-[14px] font-semibold">
            글 종류
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-[5px]">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(isSelected ? null : category.id)}
                  className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${
                    isSelected
                      ? 'bg-[#4c4c4c] border-[#4c4c4c] text-white'
                      : 'bg-white border-[#d9d9d9] text-[#4c4c4c]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
