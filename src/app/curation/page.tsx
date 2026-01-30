'use client';

import { useState } from 'react';
import Header from './components/Header';
import InfoBanner from './components/InfoBanner';
import SearchFilterBar from './components/SearchFilterBar';
import PostList from './components/PostList';
import FloatingButtons from './components/FloatingButtons';

// ============================================================
// 필터 및 검색 상태 타입
// ============================================================
type Filters = {
  eras: string[];
  continents: string[];
};

export default function CurationPage() {
  // ========== 검색 및 필터 상태 관리 (State Lifting) ==========
  // 부모 컴포넌트에서 상태를 관리하여 SearchFilterBar와 PostList에 전달
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Filters>({
    eras: [],
    continents: [],
  });

  // ========== 필터 상태 핸들러 ==========
  // 시대 필터 토글
  const handleEraToggle = (eraId: string) => {
    setFilters((prev) => ({
      ...prev,
      eras: prev.eras.includes(eraId)
        ? prev.eras.filter((id) => id !== eraId)
        : [...prev.eras, eraId],
    }));
  };

  // 대륙 필터 토글
  const handleContinentToggle = (continentId: string) => {
    setFilters((prev) => ({
      ...prev,
      continents: prev.continents.includes(continentId)
        ? prev.continents.filter((id) => id !== continentId)
        : [...prev.continents, continentId],
    }));
  };

  // 특정 필터 제거
  const removeFilter = (type: 'era' | 'continent', filterId: string) => {
    if (type === 'era') {
      setFilters((prev) => ({
        ...prev,
        eras: prev.eras.filter((id) => id !== filterId),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        continents: prev.continents.filter((id) => id !== filterId),
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 min-h-screen relative pb-28">
      <Header />
      <main className="flex flex-col mt-px">
        <InfoBanner />
        {/* SearchFilterBar에 상태 및 핸들러 전달 */}
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          onEraToggle={handleEraToggle}
          onContinentToggle={handleContinentToggle}
          onRemoveFilter={removeFilter}
        />
        {/* PostList에 상태 전달 */}
        <PostList searchValue={searchValue} filters={filters} />
      </main>
      <FloatingButtons />
    </div>
  );
}
