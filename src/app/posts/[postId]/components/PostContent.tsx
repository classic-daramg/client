'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PostContentProps {
  title: string;
  content: string;
  images: string[];
  videoUrl: string | null;
  hashtags: string[];
}

/**
 * PostContent Component
 * 
 * 포스트의 본문 내용을 표시하는 컴포넌트
 * 제목, 본문, 이미지 슬라이더, 비디오, 해시태그를 포함
 * 
 * @param title - 포스트 제목
 * @param content - 포스트 본문
 * @param images - 이미지 URL 배열
 * @param videoUrl - 비디오 URL (optional)
 * @param hashtags - 해시태그 배열
 */
export default function PostContent({
  title,
  content,
  images,
  videoUrl,
  hashtags,
}: PostContentProps) {
  // URL 검증 함수
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  // 유효한 이미지만 필터링
  const validImages = images.filter(isValidUrl);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 이미지 슬라이더 핸들러
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  // YouTube URL을 embed URL로 변환
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  return (
    <div className="px-5 pb-5 flex flex-col gap-4 bg-white">
      {/* 제목 */}
      <div>
        <h2 className="text-base font-semibold text-[#1a1a1a]">{title}</h2>
      </div>

      {/* 본문 */}
      <div
        className="font-medium text-sm text-[#a6a6a6] leading-relaxed whitespace-pre-wrap"
      >
        {content}
      </div>

      {/* 해시태그 */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 font-medium text-xs text-[#d9d9d9]">
          {hashtags.map((tag, index) => (
            <span key={index}>#{tag}</span>
          ))}
        </div>
      )}

      {/* 이미지 슬라이더 */}
      {validImages.length > 0 && (
        <div className="relative">
          <div className="relative w-full h-[300px] bg-[#d9d9d9] rounded-lg overflow-hidden">
            <Image
              src={validImages[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* 이미지가 2개 이상일 때 네비게이션 버튼 표시 */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition"
              >
                ‹
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition"
              >
                ›
              </button>
              
              {/* 이미지 인디케이터 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {validImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 비디오 (YouTube Embed) */}
      {videoUrl && getYouTubeEmbedUrl(videoUrl) && (
        <div className="relative w-full aspect-video bg-[#d9d9d9] rounded-lg overflow-hidden">
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)!}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
