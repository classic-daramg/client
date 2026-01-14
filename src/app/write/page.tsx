'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ComposerSearch from './composer-search';

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full px-5 py-3.5 bg-[#f4f5f7]">
        <p className="text-[#4c4c4c] text-xs font-medium font-['Pretendard']">{title}</p>
    </div>
);

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [link, setLink] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('라흐마니노프 이야기');
    const postTypes = ['큐레이션 글', '라흐마니노프 이야기'];
    const [selectedComposer, setSelectedComposer] = useState<string | null>(null);
    const [showComposerSearch, setShowComposerSearch] = useState(false);

    // draft-edit 데이터가 있으면 제목/내용에 자동 입력
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const draftStr = localStorage.getItem('draft-edit');
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr);
                    if (draft.title) setTitle(draft.title);
                    if (draft.content) setContent(draft.content);
                } catch {}
            }
        }
    }, []);

    const handleSelectComposer = (composerName: string) => {
        setSelectedComposer(composerName);
    };

    const handleOpenComposerSearch = () => {
        setShowComposerSearch(true);
    };

    const handleCloseComposerSearch = () => {
        setShowComposerSearch(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setImageFiles([...imageFiles, ...newFiles]);
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const isButtonEnabled = title.trim() !== '' && content.trim() !== '';

    const handleRegister = async () => {
        if (!isButtonEnabled) return;

        try {
            // 해시태그를 배열로 변환 (쉼표 또는 공백으로 구분)
            const hashtagArray = hashtags
                .trim()
                .split(/[,\s]+/)
                .filter(tag => tag.length > 0)
                .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

            // OpenAPI spec에 맞춰 데이터 구성
            interface PostData {
                title: string;
                content: string;
                postStatus: string;
                images?: string[];
                hashtags?: string[];
                videoUrl?: string;
            }
            const postData: PostData = {
                title: title,
                content: content,
                postStatus: 'PUBLISHED',
            };

            // 이미지가 있으면 먼저 S3에 업로드
            if (imageFiles.length > 0) {
                try {
                    // FormData 생성
                    const formData = new FormData();
                    imageFiles.forEach(file => {
                        formData.append('images', file);
                    });

                    // 이미지 업로드 API 호출
                    const uploadRes = await fetch('https://classic-daramg.duckdns.org/images/upload', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    });

                    if (!uploadRes.ok) {
                        throw new Error('이미지 업로드 실패');
                    }

                    const uploadData = await uploadRes.json();

                    // S3 URL 배열을 postData에 추가
                    postData.images = uploadData.imageUrls;

                    console.log('Uploaded image URLs:', uploadData.imageUrls);
                } catch (error) {
                    console.error('Image upload error:', error);
                    alert('이미지 업로드에 실패했습니다.');
                    return; // 이미지 업로드 실패 시 게시글 생성 중단
                }
            }

            // 해시태그가 있으면 추가
            if (hashtagArray.length > 0) {
                postData.hashtags = hashtagArray;
            }

            // 비디오/링크가 있으면 추가
            if (link && link.trim()) {
                postData.videoUrl = link;
            }

            console.log('--- JSON Data to be Sent ---');
            console.log(JSON.stringify(postData, null, 2));
            console.log('--------------------------');

            const response = await fetch('https://classic-daramg.duckdns.org/posts/free', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(postData),
            });

            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Response body:', text);

            if (response.ok || response.status === 201) {
                try {
                    const result = text ? JSON.parse(text) : null;
                    console.log('Post created successfully:', result);
                } catch (e) {
                    console.log('Response is not JSON, but request succeeded');
                }
                alert('등록되었습니다.');
                router.push('/free-talk');
            } else {
                try {
                    const errorData = text ? JSON.parse(text) : null;
                    console.error('Error response:', errorData);
                } catch (e) {
                    console.error('Error response (not JSON):', text);
                }
                alert('게시글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('An error occurred while creating the post:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleSaveDraft = () => {
        const draft = {
            postType: selectedType,
            composer: selectedComposer,
            title,
            content,
            hashtags,
            link,
        };
        localStorage.setItem('draft-edit', JSON.stringify(draft));
        alert('임시저장 되었습니다.');
    };

    return (
        <div className="relative bg-[#f4f5f7] min-h-screen">
            {/* Header */}
            <header className="bg-white px-5 py-3 flex items-center sticky top-0 z-10 w-full">
                <div className="flex items-center gap-1 w-full">
                    <button onClick={() => router.back()} className="flex-shrink-0">
                        <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
                    </button>
                    <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold font-['Pretendard'] ml-1">글쓰기</h1>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button 
                            onClick={handleSaveDraft} 
                            className="px-3 py-1.5 bg-white rounded-full border border-[#d9d9d9] flex items-center gap-0.5"
                        >
                            <span className="text-[#a6a6a6] text-[13px] font-semibold font-['Pretendard']">임시저장</span>
                        </button>
                        <button 
                            onClick={handleRegister} 
                            disabled={!isButtonEnabled} 
                            className={`px-3 py-1.5 rounded-full flex items-center gap-0.5 ${
                                isButtonEnabled ? 'bg-[#293a92]' : 'bg-[#bfbfbf]'
                            }`}
                        >
                            <span className="text-white text-[13px] font-semibold font-['Pretendard']">등록</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main>
                {/* 게시글 유형 */}
                <SectionHeader title="게시글 유형" />
                <div className="relative bg-white">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-6 py-[18px] bg-white flex items-center gap-2"
                    >
                        <div className="w-3 h-3 flex-shrink-0">
                            <Image 
                                src="/icons/write-blue.svg" 
                                alt="post type" 
                                width={12} 
                                height={12} 
                            />
                        </div>
                        <p className="flex-1 text-[#1a1a1a] text-sm font-semibold font-['Pretendard'] text-left">{selectedType}</p>
                        <div className={`w-4 h-4 flex-shrink-0 transform transition-transform ${isDropdownOpen ? '' : 'rotate-90'}`}>
                            <Image 
                                src="/icons/back.svg" 
                                alt="dropdown" 
                                width={16} 
                                height={16} 
                                className="rotate-[-90deg]"
                            />
                        </div>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border-t border-[#f4f5f7] shadow-lg z-20">
                            {postTypes.map((type) => (
                                <div
                                    key={type}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="px-6 py-[18px] hover:bg-[#f4f5f7] cursor-pointer text-sm font-semibold font-['Pretendard'] text-[#1a1a1a]"
                                >
                                    {type}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 작곡가 선택 (큐레이션 글일 때만 표시) */}
                {selectedType === '큐레이션 글' && (
                    <>
                        <SectionHeader title="작곡가 선택" />
                        <div className="w-full px-6 py-[18px] bg-white">
                            <div className="flex items-center gap-2.5 w-full">
                                <button
                                    onClick={handleOpenComposerSearch}
                                    className="flex-1 bg-[#f4f5f7] rounded-full px-5 py-2.5 text-left"
                                >
                                    <span className={`text-sm font-medium font-['Pretendard'] ${
                                        selectedComposer ? 'text-[#1a1a1a]' : 'text-[#d9d9d9]'
                                    }`}>
                                        {selectedComposer || '작곡가명 검색'}
                                    </span>
                                </button>
                                <button className="w-[30px] h-[30px] flex items-center justify-center flex-shrink-0">
                                    <Image src="/icons/search.svg" alt="search" width={30} height={30} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* 게시글 제목 */}
                <SectionHeader title="게시글 제목" />
                <div className="w-full px-5 py-[18px] bg-white">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 게시글 내용 */}
                <SectionHeader title="게시글 내용" />
                <div className="w-full px-5 py-[18px] bg-white">
                    <textarea
                        placeholder={selectedType === '큐레이션 글' 
                            ? "나만의 이야기를 담아 클래식 음악을 추천해주세요!" 
                            : "작곡가에 대해 같은 음악 취향을 가진 사람들과 나누고픈 이야기를 자유롭게 적어보세요!"}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-48 resize-none text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 해시태그 등록 */}
                <SectionHeader title="해시태그 등록" />
                <div className="w-full px-5 py-[18px] bg-white">
                    <input
                        type="text"
                        placeholder="해시태그 작성 최대 N개"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        className="w-full text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#4c4c4c]"
                    />
                </div>

                {/* 콘텐츠 첨부 */}
                <SectionHeader title="콘텐츠 첨부" />
                <div className="w-full px-5 py-[18px] bg-white flex flex-col gap-[13px]">
                    <div className="w-full">
                        <input
                            type="text"
                            placeholder="영상 링크 붙여넣기"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#a6a6a6]"
                        />
                    </div>
                    <div className="w-full">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                            multiple
                        />
                        <button 
                            onClick={handleImageUploadClick} 
                            className="w-full px-3.5 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium font-['Pretendard'] text-[#a6a6a6] text-left"
                        >
                            이미지 업로드
                        </button>
                    </div>
                    {imageFiles.length > 0 && (
                        <div className="w-full grid grid-cols-2 gap-2.5">
                            {imageFiles.map((file, index) => (
                                <div 
                                    key={index} 
                                    className="relative aspect-square bg-[#f4f5f7] rounded-[10px] overflow-hidden"
                                >
                                    <Image 
                                        src={URL.createObjectURL(file)} 
                                        alt={`업로드된 이미지 ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* 작곡가 검색 모달 */}
            {showComposerSearch && (
                <ComposerSearch 
                    onSelectComposer={handleSelectComposer}
                    onClose={handleCloseComposerSearch}
                    initialSelected={selectedComposer ? [selectedComposer] : []}
                />
            )}
        </div>
    );
}