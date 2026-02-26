// src/app/write/components/WriteForm.tsx
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import ComposerSearch from '../composer-search';
import { SectionHeader } from './SectionHeader';
import HashtagInput from './HashtagInput';
import ToastNotification from '@/components/ToastNotification';

interface WriteFormProps {
    // Basic Fields
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    hashtags: string[];
    setHashtags: (hashtags: string[]) => void;
    link: string;
    setLink: (link: string) => void;

    // Media
    imageFiles: File[];
    imagePreviewUrls: string[];
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;

    // Type & Composer
    selectedType: string;
    isComposerTalkRoom: boolean;
    curationMode: 'none' | 'curation' | null;
    setCurationMode: (mode: 'none' | 'curation') => void;
    selectedComposers: Array<{ id: number; name: string }>;
    onSelectComposer: (composers: Array<{ id: number; name: string }>) => void;

    // Search Modal
    showComposerSearch: boolean;
    setShowComposerSearch: (show: boolean) => void;

    // Error States
    hasError: boolean;
    isShaking: boolean;
    toastMessage: string;
    showToast: boolean;
    setShowToast: (show: boolean) => void;

    // Refs
    contentRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function WriteForm({
    title, setTitle, content, setContent, hashtags, setHashtags, link, setLink,
    imageFiles, imagePreviewUrls, onImageChange, onRemoveImage,
    selectedType, isComposerTalkRoom, curationMode, setCurationMode,
    selectedComposers, onSelectComposer,
    showComposerSearch, setShowComposerSearch,
    hasError, isShaking, toastMessage, showToast, setShowToast,
    contentRef
}: WriteFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Prevent unintended submissions on Enter or Period key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent Enter key in inputs from submitting
        if (e.key === 'Enter' && (e.target instanceof HTMLInputElement)) {
            e.preventDefault();
        }

        // Specific request: "." key bug. Some environments might map it to focus or submit.
        // We ensure it doesn't propagate to any form submit listener if it bubble.
        if (e.key === '.') {
            e.stopPropagation();
        }
    };

    const isCurationPost = selectedType === '큐레이션 글';
    const isCurationWithComposer = isComposerTalkRoom && curationMode === 'curation';

    return (
        <main className="pb-10">
            {/* 토크룸 / 게시글 유형 */}
            <SectionHeader title="토크룸" />
            <div className="bg-white px-6 py-[18px] flex items-center gap-2">
                <div className="w-3 h-3 flex-shrink-0">
                    <Image src="/icons/write-blue.svg" alt="status" width={12} height={12} />
                </div>
                <p className="flex-1 text-[#1a1a1a] text-sm font-semibold font-['Pretendard']">
                    {selectedType}
                </p>
            </div>

            {/* 큐레이션 옵션 드롭다운 */}
            {isComposerTalkRoom && curationMode !== null && (
                <>
                    <SectionHeader title="게시글 유형" />
                    <div className="bg-white px-6 py-[18px] w-full">
                        <select
                            value={curationMode}
                            onChange={(e) => setCurationMode(e.target.value as 'none' | 'curation')}
                            className="w-full px-4 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium focus:outline-none border border-transparent"
                        >
                            <option value="none">{selectedType}</option>
                            <option value="curation">큐레이션 글</option>
                        </select>
                    </div>
                </>
            )}

            {/* 작곡가 선택 */}
            {(isCurationPost || isCurationWithComposer) && (
                <>
                    <SectionHeader title="작곡가 선택" />
                    <div className="w-full px-6 py-[18px] bg-white">
                        <button
                            type="button"
                            onClick={() => setShowComposerSearch(true)}
                            className="w-full bg-[#f4f5f7] rounded-full px-5 py-2.5 text-left"
                        >
                            <span className={`text-sm font-medium ${selectedComposers.length > 0 ? 'text-[#1a1a1a]' : 'text-[#d9d9d9]'}`}>
                                {selectedComposers.length > 0
                                    ? selectedComposers.length === 1
                                        ? selectedComposers[0].name
                                        : `${selectedComposers[0].name} 외 ${selectedComposers.length - 1}명`
                                    : '작곡가명 검색'}
                            </span>
                        </button>
                    </div>
                </>
            )}

            {/* 제목 */}
            <SectionHeader title="게시글 제목" />
            <div className="w-full px-5 py-[18px] bg-white">
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm font-medium focus:outline-none placeholder-[#d9d9d9]"
                />
            </div>

            {/* 내용 */}
            <SectionHeader title="게시글 내용" />
            <div className="w-full px-5 py-[18px] bg-white">
                <textarea
                    ref={contentRef}
                    placeholder={isCurationPost || isCurationWithComposer
                        ? "나만의 이야기를 담아 클래식 음악을 추천해주세요!"
                        : "작곡가에 대해 같은 음악 취향을 가진 사람들과 나누고픈 이야기를 자유롭게 적어보세요!"}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full h-48 resize-none text-sm font-medium focus:outline-none placeholder-[#d9d9d9] p-2 rounded-md transition-all duration-200 
                        ${hasError ? 'border border-red-500 bg-red-50' : 'border-none'} 
                        ${isShaking ? 'animate-shake' : ''}`}
                />
            </div>

            {/* 해시태그 */}
            <SectionHeader title="해시태그 등록" />
            <HashtagInput
                value={hashtags}
                onChange={setHashtags}
                placeholder="해시태그 작성 최대 5개"
                maxTags={5}
            />

            {/* 콘텐츠 첨부 */}
            <SectionHeader title="콘텐츠 첨부" />
            <div className="w-full px-5 py-[18px] bg-white flex flex-col gap-[13px]">
                <input
                    type="text"
                    placeholder="영상 링크 붙여넣기"
                    value={link}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium focus:outline-none placeholder-[#a6a6a6]"
                />
                <div className="w-full">
                    <button
                        type="button"
                        onClick={handleImageUploadClick}
                        className="w-full px-3.5 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium text-[#a6a6a6] text-left"
                    >
                        이미지 업로드
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={onImageChange}
                        multiple
                        accept="image/*"
                    />
                </div>

                {imagePreviewUrls.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
                        {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square bg-[#f4f5f7] rounded-[10px] overflow-hidden">
                                <Image src={url} alt={`preview ${index}`} fill className="object-cover" unoptimized />
                                <button
                                    type="button"
                                    onClick={() => onRemoveImage(index)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 작곡가 검색 모달 */}
            {showComposerSearch && (
                <ComposerSearch
                    onSelectComposer={onSelectComposer}
                    onClose={() => setShowComposerSearch(false)}
                    initialSelected={selectedComposers.map(c => c.name)}
                />
            )}

            {/* Toast Notification */}
            <ToastNotification
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </main>
    );
}
