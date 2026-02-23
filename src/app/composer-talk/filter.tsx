'use client';

import React from 'react';
import Image from 'next/image';
import { useComposerTalk } from './context';

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

export default function Filter() {
    const {
        filters,
        setFilters,
        isFilterOpen,
        setIsFilterOpen,
        setHasActiveFilters
    } = useComposerTalk();

    const handleEraToggle = (eraId: string) => {
        const newSelectedEras = filters.era.includes(eraId)
            ? filters.era.filter(id => id !== eraId)
            : [...filters.era, eraId];

        const newFilters = {
            era: newSelectedEras,
            continent: filters.continent
        };

        setFilters(newFilters);

        // 활성 필터 존재 여부 업데이트
        const hasActive = newSelectedEras.length > 0 || filters.continent.length > 0;
        setHasActiveFilters(hasActive);
    };

    const handleContinentToggle = (continentId: string) => {
        const newSelectedContinents = filters.continent.includes(continentId)
            ? filters.continent.filter(id => id !== continentId)
            : [...filters.continent, continentId];

        const newFilters = {
            era: filters.era,
            continent: newSelectedContinents
        };

        setFilters(newFilters);

        // 활성 필터 존재 여부 업데이트
        const hasActive = filters.era.length > 0 || newSelectedContinents.length > 0;
        setHasActiveFilters(hasActive);
    };

    const removeFilter = (type: 'era' | 'continent', filterId: string) => {
        if (type === 'era') {
            const newFilters = {
                era: filters.era.filter(id => id !== filterId),
                continent: filters.continent
            };
            setFilters(newFilters);
            const hasActive = newFilters.era.length > 0 || newFilters.continent.length > 0;
            setHasActiveFilters(hasActive);
        } else {
            const newFilters = {
                era: filters.era,
                continent: filters.continent.filter(id => id !== filterId)
            };
            setFilters(newFilters);
            const hasActive = newFilters.era.length > 0 || newFilters.continent.length > 0;
            setHasActiveFilters(hasActive);
        }
    };

    const getFilterLabel = (type: 'era' | 'continent', filterId: string) => {
        const filters = type === 'era' ? eraFilters : continentFilters;
        return filters.find(filter => filter.id === filterId)?.label || '';
    };

    const totalActiveFilters = filters.era.length + filters.continent.length;
    const activeFiltersList = [
        ...filters.era.map(id => ({ type: 'era' as const, id, label: getFilterLabel('era', id) })),
        ...filters.continent.map(id => ({ type: 'continent' as const, id, label: getFilterLabel('continent', id) }))
    ];

    if (!isFilterOpen) return null;

    return (
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
                                {activeFiltersList.map((filter) => (
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
                                    className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${filters.era.includes(filter.id)
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
                                    className={`px-3 py-[6px] rounded-full border text-[13px] font-semibold ${filters.continent.includes(filter.id)
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
    );
}