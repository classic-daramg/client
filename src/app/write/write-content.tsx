'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import ComposerSearch from './composer-search';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full px-5 py-3.5 bg-[#f4f5f7]">
        <p className="text-[#4c4c4c] text-xs font-medium font-['Pretendard']">{title}</p>
    </div>
);

export default function WriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [link, setLink] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedComposers, setSelectedComposers] = useState<Array<{ id: number; name: string }>>([]);
    const [showComposerSearch, setShowComposerSearch] = useState(false);

    // URL query parameter에서 postType 결정
    const composerName = searchParams.get('composer');
    const postTypeParam = searchParams.get('type'); // 'curation', 'free'

    // PostType 자동 설정
    const getSelectedType = (): string => {
        if (composerName) {
            return `${composerName} 이야기`;
        }
        if (postTypeParam === 'curation') {
            return '큐레이션 글';
        }
        if (postTypeParam === 'free') {
            return '자유 글';
        }
        return '자유 글'; // 기본값
    };

    const [selectedType] = useState<string>(getSelectedType());

    // 큐레이션 옵션 모드 ('{composer} 이야기'일 때만 사용)
    const [curationMode, setCurationMode] = useState<'none' | 'curation' | null>(null);

    // draft-edit 데이터가 있으면 제목/내용에 자동 입력
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const draftStr = localStorage.getItem('draft-edit');
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr);
                    setTitle(draft.title || '');
                    setContent(draft.content || '');
                    setHashtags(draft.hashtags || '');
                    setLink(draft.link || '');
                } catch (error) {
                    console.error('Failed to parse draft:', error);
                }
            }
        }
    }, []);

    const isCuration = selectedType.includes('이야기') || selectedType === '큐레이션 글';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImageFiles(files);

        const urls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(urls);
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        if (hashtags) {
            const hashtagArray = hashtags
                .split('#')
                .filter(tag => tag.trim() !== '')
                .map(tag => `#${tag.trim()}`);
            formData.append('hashtags', JSON.stringify(hashtagArray));
        } else {
            formData.append('hashtags', JSON.stringify([]));
        }

        if (link) {
            formData.append('link', link);
        }

        if (isCuration && selectedComposers.length > 0) {
            formData.append('composerIds', JSON.stringify(selectedComposers.map(c => c.id)));
        }

        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        try {
            let endpoint = '/posts/free';
            if (isCuration) {
                endpoint = '/posts/curation';
            }

            const response = await apiClient.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            if (response.status === 200 || response.status === 201) {
                console.log('Post created successfully:', response.data);
                alert('등록되었습니다.');
                router.push(isCuration ? '/curation' : '/free-talk');
            }
        } catch (error) {
            console.error('An error occurred while creating the post:', error);

            const axiosError = error as AxiosError<{ message: string }>;
            // Axios 에러 처리
            if (axiosError.response) {
                let errorMessage = '게시글 등록에 실패했습니다.';

                const errorData = axiosError.response.data;
                if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                // 상태 코드별 에러 메시지
                switch (axiosError.response.status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다. 입력 내용을 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '권한이 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다.';
                        break;
                }

                alert(errorMessage);
            } else {
                alert('네트워크 오류가 발생했습니다.');
            }
        }
    };

    const handleSaveDraft = async () => {
        try {
            if (!title.trim()) {
                alert('제목을 입력해주세요.');
                return;
            }

            // localStorage에 임시저장
            const localDraft = {
                title,
                content,
                hashtags,
                link,
            };
            localStorage.setItem('draft-edit', JSON.stringify(localDraft));

            alert('임시저장 되었습니다.');
        } catch (error) {
            console.error('Draft save error:', error);

            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 400) {
                alert('잘못된 요청입니다. 입력 내용을 확인해주세요.');
            } else if (axiosError.response?.status === 401) {
                alert('로그인이 필요합니다.');
            } else {
                alert('임시저장에 실패했습니다.');
            }
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-40 flex flex-col items-start w-full bg-white border-b border-[#e5e7eb]">
                <div className="flex items-center justify-between w-full px-5 py-4">
                    <h1 className="text-base font-semibold text-[#1a1a1a]">글쓰기</h1>
                    <button
                        onClick={() => router.back()}
                        className="text-[#a6a6a6] hover:text-[#4c4c4c]"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* 포스트 타입 선택 */}
                <div className="px-5 py-4 bg-[#f4f5f7]">
                    <p className="text-sm font-semibold text-[#4c4c4c]">포스트 타입</p>
                    <p className="text-xs text-[#a6a6a6] mt-1">{selectedType}</p>
                </div>

                {/* 제목 입력 */}
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <input
                        type="text"
                        placeholder="제목을 입력해주세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-base font-semibold text-[#1a1a1a] bg-transparent outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 내용 입력 */}
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <textarea
                        placeholder="내용을 입력해주세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[200px] text-sm text-[#4c4c4c] bg-transparent outline-none placeholder-[#d9d9d9] resize-none"
                    />
                </div>

                {/* 해시태그 입력 */}
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <label className="text-xs font-semibold text-[#4c4c4c] block mb-2">해시태그</label>
                    <input
                        type="text"
                        placeholder="#태그1 #태그2"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        className="w-full text-sm text-[#4c4c4c] bg-transparent outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 링크 입력 */}
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <label className="text-xs font-semibold text-[#4c4c4c] block mb-2">링크</label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full text-sm text-[#4c4c4c] bg-transparent outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 작곡가 선택 (큐레이션일 때만) */}
                {isCuration && (
                    <div className="px-5 py-4 border-b border-[#e5e7eb]">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-semibold text-[#4c4c4c]">작곡가 선택</label>
                            <button
                                onClick={() => setShowComposerSearch(true)}
                                className="text-xs text-[#293a92] font-semibold hover:underline"
                            >
                                + 추가
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedComposers.map((composer) => (
                                <div
                                    key={composer.id}
                                    className="flex items-center gap-1 px-3 py-1 bg-[#f4f5f7] rounded-full text-xs text-[#4c4c4c]"
                                >
                                    {composer.name}
                                    <button
                                        onClick={() => setSelectedComposers(prev => prev.filter(c => c.id !== composer.id))}
                                        className="text-[#a6a6a6] hover:text-[#4c4c4c]"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 이미지 업로드 */}
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <label className="text-xs font-semibold text-[#4c4c4c] block mb-3">이미지</label>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-[#d9d9d9] rounded-lg text-center text-sm text-[#a6a6a6] hover:border-[#4c4c4c] hover:text-[#4c4c4c] transition"
                    >
                        이미지 선택
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {imagePreviewUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 flex gap-3 px-5 py-4 bg-white border-t border-[#e5e7eb]">
                <button
                    onClick={handleSaveDraft}
                    className="flex-1 py-3 px-4 border border-[#d9d9d9] rounded-lg text-sm font-semibold text-[#4c4c4c] hover:bg-[#f4f5f7] transition"
                >
                    임시저장
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 px-4 bg-[#293a92] rounded-lg text-sm font-semibold text-white hover:bg-[#1f2d6f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isAuthenticated}
                >
                    등록
                </button>
            </div>

            {/* Composer Search Modal */}
            {showComposerSearch && (
                <ComposerSearch
                    onSelectComposer={(composers) => {
                        setSelectedComposers(composers);
                        setShowComposerSearch(false);
                    }}
                    onClose={() => setShowComposerSearch(false)}
                    initialSelected={selectedComposers.map(c => c.name)}
                />
            )}
        </div>
    );
}
