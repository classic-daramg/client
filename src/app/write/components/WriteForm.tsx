// src/app/write/components/WriteForm.tsx
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import ComposerSearch from '../composer-search';
import { SectionHeader } from './SectionHeader';

interface WriteFormProps {
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    hashtags: string;
    setHashtags: (hashtags: string) => void;
    link: string;
    setLink: (link: string) => void;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    selectedComposer: string | null;
    setSelectedComposer: (composer: string | null) => void;
}

export default function WriteForm({
    title, setTitle, content, setContent, hashtags, setHashtags, link, setLink,
    imageFile, setImageFile, selectedType, setSelectedType, selectedComposer, setSelectedComposer
}: WriteFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const postTypes = ['큐레이션 글', '라흐마니노프 이야기'];
    const [showComposerSearch, setShowComposerSearch] = useState(true);

    const handleSelectComposer = (composerName: string) => {
        setSelectedComposer(composerName);
        setShowComposerSearch(false);
    };

    const handleCloseComposerSearch = () => {
        setShowComposerSearch(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImageFile(event.target.files[0]);
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <main>
            <SectionHeader title="게시글 유형" />
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full self-stretch px-6 py-4 bg-white flex justify-between items-center gap-2 text-left"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                            <Image src="/icons/write-blue.svg" alt="post type" width={16} height={16} />
                        </div>
                        <p className="text-zinc-900 text-sm font-semibold">{selectedType}</p>
                    </div>
                    <Image src="/icons/back.svg" alt="dropdown" width={16} height={16} className={`transform transition-transform ${isDropdownOpen ? 'rotate-90' : '-rotate-90'}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border-x border-b rounded-b-lg shadow-lg z-20">
                        {postTypes.map((type) => (
                            <div
                                key={type}
                                onClick={() => {
                                    setSelectedType(type);
                                    setIsDropdownOpen(false);
                                }}
                                className="px-6 py-3 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedType === '큐레이션 글' && (
                <>
                    <SectionHeader title="작곡가 선택" />
                    {showComposerSearch ? (
                        <ComposerSearch onSelectComposer={handleSelectComposer} onClose={handleCloseComposerSearch} />
                    ) : (
                        <div className="p-5 bg-white flex justify-between items-center">
                            <p className="font-semibold">{selectedComposer}</p>
                            <button
                                onClick={() => {
                                    setShowComposerSearch(true);
                                    setSelectedComposer(null);
                                }}
                                className="text-sm text-gray-500"
                            >
                                변경
                            </button>
                        </div>
                    )}
                </>
            )}

            <SectionHeader title="게시글 제목" />
            <div className="self-stretch px-5 py-2 bg-white">
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-2 text-sm font-medium focus:outline-none placeholder-zinc-300"
                />
            </div>

            <SectionHeader title="게시글 내용" />
            <div className="self-stretch px-5 py-4 bg-white">
                <textarea
                    placeholder="작곡가에 대해 같은 음악 취향을 가진 사람들과 나누고픈 이야기를 자유롭게 적어보세요!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-48 resize-none text-sm font-medium focus:outline-none placeholder-zinc-300"
                />
            </div>

            <SectionHeader title="해시태그 등록" />
            <div className="self-stretch px-5 py-2 bg-white">
                <input
                    type="text"
                    placeholder="해시태그 작성 최대 N개"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="w-full py-2 text-sm font-medium focus:outline-none placeholder-neutral-600"
                />
            </div>

            <SectionHeader title="콘텐츠 첨부" />
            <div className="w-full px-5 py-4 bg-white flex justify-between items-center gap-3">
                <input
                    type="text"
                    placeholder="링크 붙여넣기"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-gray-100 rounded-[10px] text-sm font-medium focus:outline-none placeholder-neutral-400"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                />
                <button onClick={handleImageUploadClick} className="w-11 h-11 bg-gray-100 rounded-[10px] flex justify-center items-center">
                    <Image src="/icons/img.svg" alt="이미지 첨부" width={24} height={24} />
                </button>
            </div>
            {imageFile && (
                <div className="px-5 pb-4 bg-white">
                    <p className="text-sm text-gray-600">첨부된 이미지: {imageFile.name}</p>
                </div>
            )}
        </main>
    );
}
