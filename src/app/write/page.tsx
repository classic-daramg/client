'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import ComposerSearch from './composer-search';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full px-5 py-3.5 bg-[#f4f5f7]">
        <p className="text-[#4c4c4c] text-xs font-medium font-['Pretendard']">{title}</p>
    </div>
);

export default function WritePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { accessToken, isAuthenticated } = useAuthStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [link, setLink] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedComposers, setSelectedComposers] = useState<Array<{ id: number; name: string }>>([]);
    const [showComposerSearch, setShowComposerSearch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // URL query parameter에서 postType 결정
    const composerName = searchParams.get('composer');
    const composerId = searchParams.get('composerId') ? parseInt(searchParams.get('composerId')!) : null;
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

    const [selectedType, setSelectedType] = useState<string>(getSelectedType());
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    
    // 작곡가 룸에서 진입한 경우 primaryComposerId 고정
    const [primaryComposerId, setPrimaryComposerId] = useState<number | null>(composerId);
    
    // 큐레이션 옵션 모드 ('{composer} 이야기'일 때만 사용)
    const [curationMode, setCurationMode] = useState<'none' | 'curation' | null>(null);

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

    // postType 변경 시 curationMode 초기화 로직
    useEffect(() => {
        const isComposerTalkPostType = selectedType.includes('이야기');
        
        if (isComposerTalkPostType) {
            // {composer} 이야기로 변경되면 기본값 'none'으로 설정
            setCurationMode('none');
        } else {
            // 다른 postType으로 변경되면 null로 초기화 (드롭다운 미표시)
            setCurationMode(null);
        }
    }, [selectedType]);

    const handleSelectComposer = (composers: Array<{ id: number; name: string }>) => {
        setSelectedComposers(composers);
        setShowComposerSearch(false);
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
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            
            setImageFiles([...imageFiles, ...newFiles]);
            setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (index: number) => {
        // 메모리 누수 방지: Blob URL 해제
        if (imagePreviewUrls[index]) {
            URL.revokeObjectURL(imagePreviewUrls[index]);
        }
        
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
    };

    // 컴포넌트 언마운트 시 모든 Blob URL 정리
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    // PostType 판단
    const isComposerTalkRoom = selectedType.includes('이야기');
    const isCurationPost = selectedType === '큐레이션 글';
    const isStoryPost = isComposerTalkRoom && curationMode === 'none';
    const isCurationWithComposer = isComposerTalkRoom && curationMode === 'curation';
    
    // 고도화된 validation 로직
    // Story: 제목 + 내용만 필수 (primaryComposerId는 URL에서 받음)
    // Curation (큐레이션 글): 작곡가 선택 필수
    // Curation (작곡가 이야기 + 큐레이션): 제목 + 내용 필수 (추가 작곡가는 선택사항)
    // Free: 제목 + 내용만 필수
    
    const validatePostData = (): { isValid: boolean; errorMessage?: string } => {
        // 기본 필드 검증
        if (!title.trim()) {
            return { isValid: false, errorMessage: '제목을 입력해주세요.' };
        }
        if (!content.trim()) {
            return { isValid: false, errorMessage: '내용을 입력해주세요.' };
        }
        
        // 포스트 타입별 검증
        if (isCurationPost) {
            // 큐레이션 글: 작곡가 선택 필수
            if (selectedComposers.length === 0) {
                return { isValid: false, errorMessage: '작곡가를 최소 1명 선택해주세요.' };
            }
        } else if (isStoryPost) {
            // 작곡가 이야기: primaryComposerId 필수 (URL에서 받음)
            if (!primaryComposerId) {
                return { isValid: false, errorMessage: '작곡가 정보를 찾을 수 없습니다. 작곡가 프로필에서 접근해주세요.' };
            }
        }
        // Story+Curation은 제목/내용만 있으면 OK
        
        return { isValid: true };
    };
    
    const isButtonEnabled = validatePostData().isValid && !isSubmitting;

    const handleRegister = async () => {
        const validation = validatePostData();
        if (!validation.isValid) {
            alert(validation.errorMessage);
            return;
        }

        // 이중 제출 방지
        if (isSubmitting) return;

        // 로그인 확인
        if (!isAuthenticated()) {
            alert('로그인이 필요합니다.');
            router.push('/loginpage');
            return;
        }

        setIsSubmitting(true);

        try {
            // 해시태그를 배열로 변환
            const hashtagArray = hashtags
                .trim()
                .split(/[,\s]+/)
                .filter(tag => tag.length > 0)
                .map(tag => tag.startsWith('#') ? tag.slice(1) : tag);

            // 공통 인터페이스
            interface PostDataBase {
                title: string;
                content: string;
                postStatus: 'PUBLISHED' | 'DRAFT';
                images?: string[];
                hashtags?: string[];
                videoUrl?: string;
            }

            interface CurationPostData extends PostDataBase {
                primaryComposerId: number;
                additionalComposerIds?: number[];
            }

            interface StoryPostData extends PostDataBase {
                primaryComposerId: number;
            }

            interface FreePostData extends PostDataBase {
            }

            // 이미지 업로드 (공통)
            let uploadedImages: string[] | undefined;
            if (imageFiles.length > 0) {
                try {
                    const formData = new FormData();
                    imageFiles.forEach(file => {
                        formData.append('images', file);
                    });

                    const uploadRes = await apiClient.post('/images/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    uploadedImages = uploadRes.data.imageUrls;
                    console.log('✅ Images uploaded successfully:', uploadedImages);
                } catch (error) {
                    console.error('❌ Image upload error:', error);
                    alert('이미지 업로드에 실패했습니다.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // 포스트 타입별 처리 로직
            if (isStoryPost) {
                // ============ Case 1: Story (작곡가 이야기) ============
                const storyData: StoryPostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    primaryComposerId: primaryComposerId!,
                };

                if (uploadedImages) storyData.images = uploadedImages;
                if (hashtagArray.length > 0) storyData.hashtags = hashtagArray;
                if (link?.trim()) storyData.videoUrl = link;

                console.log('📝 [STORY] Posting to /posts/story:', JSON.stringify(storyData, null, 2));

                const response = await apiClient.post('/posts/story', storyData);
                console.log('✅ [STORY] Post created:', response.data);
                
                alert('작곡가 이야기가 등록되었습니다.');
                router.push(`/composer-talk-room/${primaryComposerId}`);

            } else if (isCurationWithComposer) {
                // ============ Case 2: Curation (작곡가 이야기 + 큐레이션) ============
                // 두 개의 API를 순차적으로 호출해야 함
                
                const storyData: StoryPostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    primaryComposerId: primaryComposerId!,
                };

                const curationData: CurationPostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    primaryComposerId: primaryComposerId!,
                    additionalComposerIds: selectedComposers.map(c => c.id),
                };

                if (uploadedImages) {
                    storyData.images = uploadedImages;
                    curationData.images = uploadedImages;
                }
                if (hashtagArray.length > 0) {
                    storyData.hashtags = hashtagArray;
                    curationData.hashtags = hashtagArray;
                }
                if (link?.trim()) {
                    storyData.videoUrl = link;
                    curationData.videoUrl = link;
                }

                console.log('📝 [STORY] Posting to /posts/story:', JSON.stringify(storyData, null, 2));
                console.log('📝 [CURATION] Posting to /posts/curation:', JSON.stringify(curationData, null, 2));

                try {
                    // 1. Story 포스트 등록
                    const storyResponse = await apiClient.post('/posts/story', storyData);
                    console.log('✅ [STORY] Post created:', storyResponse.data);

                    // 2. Curation 포스트 등록
                    const curationResponse = await apiClient.post('/posts/curation', curationData);
                    console.log('✅ [CURATION] Post created:', curationResponse.data);

                    alert('작곡가 이야기와 큐레이션이 등록되었습니다.');
                    // 큐레이션 페이지로 이동
                    router.push('/curation');
                } catch (error: any) {
                    // 에러 발생 시 어느 단계에서 실패했는지 명확히 표시
                    if (error.response?.status === 400 || error.response?.status === 500) {
                        console.error('❌ API Error:', error.response?.data);
                        alert('포스트 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    } else {
                        throw error;
                    }
                    setIsSubmitting(false);
                    return;
                }

            } else if (isCurationPost) {
                // ============ Case 3: Curation (큐레이션 글) ============
                const curationData: CurationPostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    primaryComposerId: selectedComposers[0].id,
                };

                if (selectedComposers.length > 1) {
                    curationData.additionalComposerIds = selectedComposers.slice(1).map(c => c.id);
                }

                if (uploadedImages) curationData.images = uploadedImages;
                if (hashtagArray.length > 0) curationData.hashtags = hashtagArray;
                if (link?.trim()) curationData.videoUrl = link;

                console.log('📝 [CURATION] Posting to /posts/curation:', JSON.stringify(curationData, null, 2));

                const response = await apiClient.post('/posts/curation', curationData);
                console.log('✅ [CURATION] Post created:', response.data);

                alert('큐레이션이 등록되었습니다.');
                router.push('/curation');

            } else {
                // ============ Case 4: Free Talk (자유 글) ============
                const freeData: FreePostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                };

                if (uploadedImages) freeData.images = uploadedImages;
                if (hashtagArray.length > 0) freeData.hashtags = hashtagArray;
                if (link?.trim()) freeData.videoUrl = link;

                console.log('📝 [FREE] Posting to /posts/free:', JSON.stringify(freeData, null, 2));

                const response = await apiClient.post('/posts/free', freeData);
                console.log('✅ [FREE] Post created:', response.data);

                alert('자유 글이 등록되었습니다.');
                router.push('/free-talk');
            }

        } catch (error: any) {
            console.error('❌ Error occurred during post creation:', error);

            if (error.response) {
                let errorMessage = '게시글 등록에 실패했습니다.';
                const errorData = error.response.data;

                if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                switch (error.response.status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다. 입력 내용을 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                }

                alert(errorMessage);
            } else {
                alert('오류가 발생했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = () => {
        const draft = {
            postType: selectedType,
            composers: selectedComposers,
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
                            disabled={!isButtonEnabled || isSubmitting} 
                            className={`px-3 py-1.5 rounded-full flex items-center gap-0.5 transition-colors ${
                                isButtonEnabled && !isSubmitting ? 'bg-[#293a92] hover:bg-[#1f2a6a]' : 'bg-[#bfbfbf]'
                            }`}
                        >
                            <span className="text-white text-[13px] font-semibold font-['Pretendard']">
                                {isSubmitting ? '등록 중...' : '등록'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main>
                {/* 게시글 유형 */}
                <SectionHeader title="게시글 유형" />
                <div className="bg-white px-6 py-[18px] flex items-center gap-2">
                    <div className="w-3 h-3 flex-shrink-0">
                        <Image 
                            src="/icons/write-blue.svg" 
                            alt="post type" 
                            width={12} 
                            height={12} 
                        />
                    </div>
                    <p className="flex-1 text-[#1a1a1a] text-sm font-semibold font-['Pretendard'] text-left">{selectedType}</p>
                </div>

                {/* 큐레이션 옵션 드롭다운 ({composer} 이야기일 때만 렌더링) */}
                {isComposerTalkRoom && curationMode !== null && (
                    <>
                        <SectionHeader title="큐레이션 옵션을 추가할까요?" />
                        <div className="bg-white px-6 py-[18px] w-full">
                            <select
                                value={curationMode}
                                onChange={(e) => setCurationMode(e.target.value as 'none' | 'curation')}
                                className="w-full px-4 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none border border-transparent"
                            >
                                <option value="none">{selectedType.replace(' 이야기', '')}</option>
                                <option value="curation">{selectedType.replace(' 이야기', '')}의 큐레이션</option>
                            </select>
                        </div>
                    </>
                )}

                {/* 작곡가 선택 (큐레이션 글 또는 {composer} 이야기이면서 curationMode가 'curation'일 때 표시) */}
                {(isCurationPost || isCurationWithComposer) && (
                    <>
                        <SectionHeader title="작곡가 선택" />
                        <div className="w-full px-6 py-[18px] bg-white">
                            <div className="flex items-center gap-2.5 w-full">
                                <button
                                    onClick={handleOpenComposerSearch}
                                    className="flex-1 bg-[#f4f5f7] rounded-full px-5 py-2.5 text-left"
                                >
                                    <span className={`text-sm font-medium font-['Pretendard'] ${
                                        selectedComposers.length > 0 ? 'text-[#1a1a1a]' : 'text-[#d9d9d9]'
                                    }`}>
                                        {selectedComposers.length > 0 
                                            ? selectedComposers.length === 1
                                                ? selectedComposers[0].name
                                                : `${selectedComposers[0].name} 외 ${selectedComposers.length - 1}명`
                                            : '작곡가명 검색'}
                                    </span>
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
                                        src={imagePreviewUrls[index]} 
                                        alt={`업로드된 이미지 ${index + 1}`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
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
                    initialSelected={selectedComposers.map(c => c.name)}
                />
            )}
        </div>
    );
}