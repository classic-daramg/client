'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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

export default function SearchFilterBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ eras: [], continents: [] });
  const [searchValue, setSearchValue] = useState('');

  const handleEraToggle = (eraId: string) => {
    setFilters(prev => ({
      ...prev,
      eras: prev.eras.includes(eraId)
        ? prev.eras.filter(id => id !== eraId)
        : [...prev.eras, eraId]
    }));
  };

  const handleContinentToggle = (continentId: string) => {
    setFilters(prev => ({
      ...prev,
      continents: prev.continents.includes(continentId)
        ? prev.continents.filter(id => id !== continentId)
        : [...prev.continents, continentId]
    }));
  };

  const removeFilter = (type: 'era' | 'continent', filterId: string) => {
    if (type === 'era') {
      setFilters(prev => ({
        ...prev,
        eras: prev.eras.filter(id => id !== filterId)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        continents: prev.continents.filter(id => id !== filterId)
      }));
    }
  };

  const getFilterLabel = (type: 'era' | 'continent', filterId: string) => {
    const filterList = type === 'era' ? eraFilters : continentFilters;
    return filterList.find(f => f.id === filterId)?.label || '';
  };

  const activeFilters = [
    ...filters.eras.map(id => ({ type: 'era' as const, id, label: getFilterLabel('era', id) })),
    ...filters.continents.map(id => ({ type: 'continent' as const, id, label: getFilterLabel('continent', id) }))
  ];

  const totalActiveFilters = filters.eras.length + filters.continents.length;

  return (
    <>
      <div className="py-2.5 bg-white flex justify-center">
        <div className="w-80 px-2 py-1 bg-gray-100 rounded-full flex items-center justify-between">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 bg-transparent px-3 text-sm focus:outline-none"
          />
          <div className="flex">
            <button className="p-1.5">
              <Image src="/icons/search.svg" alt="Search" width={20} height={20} />
            </button>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-1.5"
            >
              <Image src="/icons/filter.svg" alt="Filter" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Filter Panel */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[22px] shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.08)] z-50 max-w-[600px] mx-auto max-h-[80vh] overflow-y-auto">
            {/* Handle Bar */}
            <div className="flex justify-center pt-[22px] sticky top-0 bg-white">
              <div className="w-[80px] h-[5px] bg-[#bfbfbf] rounded-full" />
            </div>

            {/* Content */}
            <div className="px-5 pt-[38px] pb-5 flex flex-col gap-5">
              {/* Active Filters */}
              {totalActiveFilters > 0 && (
                <>
                  <div className="flex flex-wrap gap-[5px]">
                    {activeFilters.map((filter) => (
                      <button
                        key={`${filter.type}-${filter.id}`}
                        onClick={() => removeFilter(filter.type, filter.id)}
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
                  {/* Separator */}
                  <div className="h-[1px] bg-[#f4f5f7]" />
                </>
              )}

              {/* 시대별 필터 */}
              <div>
                <h3 className="text-[#bfbfbf] text-[14px] font-semibold mb-5">시대별</h3>
                <div className="flex flex-wrap gap-[5px]">
                  {eraFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => handleEraToggle(filter.id)}
                      className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${
                        filters.eras.includes(filter.id)
                          ? 'bg-[#4c4c4c] border-[#4c4c4c] text-white'
                          : 'bg-white border-[#d9d9d9] text-[#4c4c4c]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="h-[1px] bg-[#f4f5f7]" />

              {/* 대륙별 필터 */}
              <div>
                <h3 className="text-[#bfbfbf] text-[14px] font-semibold mb-5">대륙별</h3>
                <div className="flex flex-wrap gap-[5px]">
                  {continentFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => handleContinentToggle(filter.id)}
                      className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${
                        filters.continents.includes(filter.id)
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
