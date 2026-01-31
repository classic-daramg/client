'use client';

import Link from 'next/link';

interface Composer {
  composerId: number;
  koreanName: string;
  englishName: string;
  nativeName: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthYear: number;
  deathYear: number;
  bio: string;
}

interface ComposerInfoProps {
  primaryComposer: Composer;
  additionalComposers?: Composer[];
  showAdditional?: boolean;
}

/**
 * ComposerInfo Component
 * 
 * 포스트와 연결된 작곡가 정보를 표시하는 컴포넌트
 * STORY 타입: 주 작곡가만 표시
 * CURATION 타입: 주 작곡가 + 추가 작곡가 리스트 표시
 * 
 * @param primaryComposer - 주 작곡가 정보
 * @param additionalComposers - 추가 작곡가 리스트 (optional)
 * @param showAdditional - 추가 작곡가 표시 여부 (CURATION 타입일 때 true)
 */
export default function ComposerInfo({
  primaryComposer,
  additionalComposers = [],
  showAdditional = false,
}: ComposerInfoProps) {
  // 작곡가 생애 기간 표시
  const getLifespan = (composer: Composer): string => {
    return `${composer.birthYear} - ${composer.deathYear}`;
  };

  return (
    <div className="px-5 py-4 bg-[#f9fafb] border-y border-[#e5e7eb]">
      {/* 주 작곡가 정보 */}
      <Link href={`/composer-talk-room/${primaryComposer.composerId}`}>
        <div className="flex items-center gap-3 mb-3 hover:bg-white p-2 rounded-lg transition">
          <div className="w-12 h-12 bg-[#d9d9d9] rounded-full flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#1a1a1a]">
              {primaryComposer.koreanName}
            </h3>
            <p className="text-xs text-[#a6a6a6]">
              {primaryComposer.englishName} · {getLifespan(primaryComposer)}
            </p>
            <p className="text-xs text-[#a6a6a6] line-clamp-1">
              {primaryComposer.nationality}
            </p>
          </div>
        </div>
      </Link>

      {/* 추가 작곡가 리스트 (CURATION 타입만) */}
      {showAdditional && additionalComposers && additionalComposers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <p className="text-xs font-semibold text-[#4c4c4c] mb-2">
            추가 작곡가
          </p>
          <div className="flex flex-col gap-2">
            {additionalComposers.map((composer) => (
              <Link
                key={composer.composerId}
                href={`/composer-talk-room/${composer.composerId}`}
              >
                <div className="flex items-center gap-2 hover:bg-white p-1.5 rounded transition">
                  <div className="w-8 h-8 bg-[#d9d9d9] rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1a1a1a] truncate">
                      {composer.koreanName}
                    </p>
                    <p className="text-[10px] text-[#a6a6a6] truncate">
                      {composer.englishName}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
