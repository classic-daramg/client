'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSafeBack } from '@/hooks/useSafeBack';
import { SectionHeader } from './components/SectionHeader';
import ComposerSearch from './composer-search';
import HashtagInput from './components/HashtagInput';
import ToastNotification from '@/components/ToastNotification';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { useDraftStore } from '@/store/draftStore';

// 한국 시간(KST, UTC+9) ISO 문자열 생성 함수
const getKSTISOString = (): string => {
    const now = new Date();

    // 방법 1: 로컬 시간을 한국 시간대로 포맷한 후 ISO 문자열로 변환
    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
    });

    const parts = formatter.formatToParts(now);
    const partsObj = parts.reduce<Record<string, string>>((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});

    // ISO 포맷으로 변환: YYYY-MM-DDTHH:mm:ss.sssZ
    const isoString = `${partsObj.year}-${partsObj.month}-${partsObj.day}T${partsObj.hour}:${partsObj.minute}:${partsObj.second}.${partsObj.fractionalSecond}Z`;

    return isoString;
};

type PostType = 'FREE' | 'CURATION' | 'STORY';

interface Composer {
    id?: number;
    composerId?: number;
    koreanName?: string;
    englishName?: string;
}

interface EditPostData {
    type: PostType;
    title: string;
    content: string;
    hashtags?: string[];
    videoUrl?: string;
    images?: string[];
    postStatus?: 'PUBLISHED' | 'DRAFT';
    primaryComposer?: Composer;
    additionalComposers?: Composer[];
}

type UpdatePayload = {
    title: string;
    content: string;
    hashtags: string[];
    images: string[];
    videoUrl: string;
    postStatus: 'PUBLISHED' | 'DRAFT';
    primaryComposerId?: number;
    additionalComposersId?: number[];
};

export function WritePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { draft } = useDraftStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [link, setLink] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedComposers, setSelectedComposers] = useState<Array<{ id: number; name: string }>>([]);
    const [showComposerSearch, setShowComposerSearch] = useState(false);

    // ========== Error Handling States ==========
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [hasError, setHasError] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // ========== Edit Mode States ==========
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const [editPostData, setEditPostData] = useState<EditPostData | null>(null);

    // 클라이언트 사이드 마운트 확인
    useEffect(() => {
        setIsClient(true);
    }, []);

    // URL query parameter에서 postType 결정
    const composerName = searchParams.get('composer');
    const composerId = searchParams.get('composerId')
        ? parseInt(searchParams.get('composerId')!)
        : null;
    const postTypeParam = searchParams.get('type'); // 'curation', 'free'
    const editIdParam = searchParams.get('edit');
    const draftId = searchParams.get('draftId');

    const getFallbackHref = () => {
        if (editIdParam) {
            return `/posts/${editIdParam}`;
        }
        if (postTypeParam === 'curation') return '/curation';
        if (postTypeParam === 'free') return '/free-talk';
        if (composerId) return `/composer-talk-room/${composerId}`;
        return '/';
    };

    const handleSafeBack = useSafeBack(getFallbackHref());

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
    const [primaryComposerId, setPrimaryComposerId] = useState<number | null>(composerId);

    // 큐레이션 옵션 모드 ('{composer} 이야기'일 때만 사용)
    const [curationMode, setCurationMode] = useState<'none' | 'curation' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ========== Edit Mode Initialization ==========
    const fetchPostDataForEdit = useCallback(async (postId: string) => {
        try {
            const response = await apiClient.get(`/posts/${postId}`);
            const post = response.data as EditPostData;
            setEditPostData(post);

            // 폼 데이터 채우기
            setTitle(post.title);
            setContent(post.content);
            setHashtags(post.hashtags || []);
            setLink(post.videoUrl || '');
            setImageFiles([]);

            // 포스트 타입에 따라 처리
            if (post.type === 'CURATION') {
                setSelectedType('큐레이션 글');
                const composerList = [] as Array<{ id: number; name: string }>;
                if (post.primaryComposer) {
                    const primaryId = post.primaryComposer.id ?? post.primaryComposer.composerId;
                    if (primaryId !== null && primaryId !== undefined) {
                        composerList.push({
                            id: primaryId,
                            name: post.primaryComposer.koreanName || post.primaryComposer.englishName || '',
                        });
                        setPrimaryComposerId(primaryId);
                    }
                }
                if (post.additionalComposers && post.additionalComposers.length > 0) {
                    composerList.push(
                        ...post.additionalComposers
                            .map((c: Composer) => ({
                                id: c.id ?? c.composerId,
                                name: c.koreanName || c.englishName || '',
                            }))
                            .filter(
                                (c): c is { id: number; name: string } =>
                                    typeof c.id === 'number' && c.name !== ''
                            )
                    );
                }
                setSelectedComposers(composerList);
                setCurationMode(null);
            } else if (post.type === 'FREE') {
                setSelectedType('자유 글');
                setSelectedComposers([]);
                setCurationMode(null);
            } else if (post.type === 'STORY' && post.primaryComposer) {
                setSelectedType(`${post.primaryComposer.koreanName} 이야기`);
                const primaryId = post.primaryComposer.id ?? post.primaryComposer.composerId;
                if (primaryId) {
                    setPrimaryComposerId(primaryId);
                }
                setSelectedComposers([]);
                setCurationMode('none');
            }

            // 기존 이미지 미리보기
            if (post.images && post.images.length > 0) {
                setImagePreviewUrls(post.images);
            } else {
                setImagePreviewUrls([]);
            }
        } catch (error) {
            console.error('Failed to fetch post:', error);
            alert('포스트를 불러올 수 없습니다.');
            handleSafeBack();
        }
    }, [handleSafeBack]);

    useEffect(() => {
        if (!isClient) return;

        const editId = searchParams.get('edit');
        if (editId) {
            setEditPostId(editId);
            setIsEditMode(true);
            fetchPostDataForEdit(editId);
        }
    }, [isClient, searchParams, fetchPostDataForEdit]);

    // draft-edit 데이터가 있으면 제목/내용에 자동 입력
    useEffect(() => {
        if (!isClient) return;
        if (isEditMode) return;
        if (draftId) return;

        if (typeof window !== 'undefined') {
            const draftStr = localStorage.getItem('draft-edit');
            if (draftStr) {
                try {
                    const draft = JSON.parse(draftStr);
                    if (draft.title) setTitle(draft.title);
                    if (draft.content) setContent(draft.content);
                    if (draft.hashtags) {
                        if (Array.isArray(draft.hashtags)) {
                            setHashtags(draft.hashtags.filter((tag: unknown) => typeof tag === 'string'));
                        } else if (typeof draft.hashtags === 'string') {
                            const nextTags = draft.hashtags
                                .trim()
                                .split(/[,\s]+/)
                                .filter((tag: string) => tag.length > 0)
                                .map((tag: string) => tag.startsWith('#') ? tag.slice(1) : tag);
                            setHashtags(nextTags);
                        }
                    }
                } catch { }
            }
        }
    }, [draftId, isClient, isEditMode]);

    // draftId가 있으면 store의 임시저장 데이터를 초기값으로 사용
    useEffect(() => {
        if (!isClient) return;
        if (isEditMode) return;
        if (!draftId) return;
        if (!draft || String(draft.id) !== draftId) return;

        const draftComposerId = draft.primaryComposer?.id ?? draft.primaryComposer?.composerId ?? null;
        const draftComposerName =
            draft.primaryComposer?.koreanName ?? draft.primaryComposer?.englishName ?? '';

        const nextType = draft.type === 'CURATION'
            ? '큐레이션 글'
            : draft.type === 'FREE'
                ? '자유 글'
                : draftComposerName
                    ? `${draftComposerName} 이야기`
                    : '작곡가 이야기';

        setSelectedType(nextType);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setHashtags(draft.hashtags || []);
        setLink('');
        setImageFiles([]);
        setImagePreviewUrls(draft.thumbnailImageUrl ? [draft.thumbnailImageUrl] : []);

        if (draftComposerId && draftComposerName) {
            setSelectedComposers([{ id: draftComposerId, name: draftComposerName }]);
            setPrimaryComposerId(draftComposerId);
        } else {
            setSelectedComposers([]);
            setPrimaryComposerId(null);
        }

        if (draft.type === 'STORY') {
            setCurationMode('none');
        } else {
            setCurationMode(null);
        }
    }, [draft, draftId, isClient, isEditMode]);

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

        setImageFiles(imageFiles.filter((_: File, i: number) => i !== index));
        setImagePreviewUrls(imagePreviewUrls.filter((_: string, i: number) => i !== index));
    };

    // 컴포넌트 언마운트 시 모든 Blob URL 정리
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((url: string) => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    // PostType 판단
    const isComposerTalkRoom = selectedType.includes('이야기');
    const isCurationPost = selectedType === '큐레이션 글';
    const isCurationWithComposer = isComposerTalkRoom && curationMode === 'curation';

    // 작곡가 선택 필수 여부 (큐레이션 글만 필수, {composer} 이야기의 큐레이션은 선택사항)
    const composerSelectionRequired = isCurationPost;

    const isButtonEnabled = title.trim() !== '' && content.trim() !== '' &&
        (composerSelectionRequired ? selectedComposers.length > 0 : true);

    const handleRegister = async () => {
        if (!isButtonEnabled) return;
        if (isSubmitting) return; // 이중 제출 방지

        // 로그인 확인
        if (!isAuthenticated()) {
            alert('로그인이 필요합니다.');
            router.push('/loginpage');
            return;
        }

        setIsSubmitting(true);
        try {
            // ========== EDIT MODE ==========
            if (isEditMode && editPostId && editPostData) {
                // 새로운 이미지만 업로드
                let newUploadedImages: string[] = [];
                if (imageFiles.length > 0) {
                    const formData = new FormData();
                    imageFiles.forEach((file: File) => {
                        formData.append('images', file);
                    });

                    const uploadRes = await apiClient.post('/images/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    newUploadedImages = uploadRes.data.imageUrls;
                }

                // 기존 이미지 (URL 기반) + 새 이미지 합치기
                const existingImages = imagePreviewUrls.filter(
                    (url) => typeof url === 'string' && url.startsWith('http')
                );
                const finalImages = [...existingImages, ...newUploadedImages];

                const updateData: UpdatePayload = {
                    title,
                    content,
                    hashtags: hashtags.length > 0 ? hashtags : [],
                    images: finalImages.length > 0 ? finalImages : [],
                    videoUrl: link?.trim() ? link.trim() : '',
                    postStatus: editPostData.postStatus || 'PUBLISHED',
                };

                // 포스트 타입별 엔드포인트
                let endpoint = '';
                const requestData: UpdatePayload = { ...updateData };

                if (editPostData.type === 'FREE') {
                    endpoint = `/posts/free/${editPostId}`;
                } else if (editPostData.type === 'STORY') {
                    endpoint = `/posts/story/${editPostId}`;
                    if (primaryComposerId !== null) {
                        requestData.primaryComposerId = primaryComposerId;
                    }
                } else if (editPostData.type === 'CURATION') {
                    endpoint = `/posts/curation/${editPostId}`;
                    const primaryId =
                        selectedComposers[0]?.id ??
                        primaryComposerId ??
                        editPostData.primaryComposer?.id ??
                        editPostData.primaryComposer?.composerId;
                    if (primaryId) {
                        requestData.primaryComposerId = primaryId;
                    }
                    const additionalIds = selectedComposers
                        .slice(1)
                        .map((c) => c.id)
                        .filter((id) => typeof id === 'number');
                    requestData.additionalComposersId = additionalIds;
                }

                await apiClient.patch(endpoint, requestData);
                alert('포스트가 수정되었습니다.');
                router.push(`/posts/${editPostId}`);
                return;
            }

            // 포스트 타입 판단
            const isComposerTalkRoom = selectedType.includes('이야기');
            const isCurationPost = selectedType === '큐레이션 글';
            const isStoryPost = isComposerTalkRoom && curationMode === 'none';
            const isCurationWithComposer = isComposerTalkRoom && curationMode === 'curation';

            // 공통 이미지 업로드
            let uploadedImages: string[] | undefined;
            if (imageFiles.length > 0) {
                try {
                    const formData = new FormData();
                    imageFiles.forEach((file: File) => {
                        formData.append('images', file);
                    });

                    const uploadRes = await apiClient.post('/images/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    uploadedImages = uploadRes.data.imageUrls;
                    console.log('✅ Images uploaded:', uploadedImages);
                } catch (error) {
                    console.error('❌ Image upload error:', error);
                    alert('이미지 업로드에 실패했습니다.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // 기본 포스트 데이터
            interface PostData {
                title: string;
                content: string;
                postStatus: string;
                createdAt?: string;
                primaryComposerId?: number;
                additionalComposerIds?: number[];
                images?: string[];
                hashtags?: string[];
                videoUrl?: string;
            }

            // Case 1: Story Post (작곡가 이야기 - 큐레이션 없음)
            if (isStoryPost) {
                if (!primaryComposerId) {
                    alert('작곡가 ID를 찾을 수 없습니다.');
                    setIsSubmitting(false);
                    return;
                }

                const currentTime = getKSTISOString();
                const storyData: PostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    createdAt: currentTime,
                    primaryComposerId,
                };

                if (uploadedImages) storyData.images = uploadedImages;
                if (hashtags.length > 0) storyData.hashtags = hashtags;
                if (link && link.trim()) storyData.videoUrl = link;

                const response = await apiClient.post('/posts/story', storyData);
                console.log('✅ [STORY] Post created:', response.data);

                alert('작곡가 이야기가 등록되었습니다.');
                router.push(`/composer-talk-room/${primaryComposerId}`);
                return;
            }

            // Case 2: Story + Curation (작곡가 이야기의 큐레이션)
            if (isCurationWithComposer) {
                if (!primaryComposerId) {
                    alert('작곡가 ID를 찾을 수 없습니다.');
                    setIsSubmitting(false);
                    return;
                }

                try {
                    const currentTime = getKSTISOString();

                    // 1단계: Story 포스트 생성
                    const storyData: PostData = {
                        title,
                        content,
                        postStatus: 'PUBLISHED',
                        createdAt: currentTime,
                        primaryComposerId,
                    };

                    if (uploadedImages) storyData.images = uploadedImages;
                    if (hashtags.length > 0) storyData.hashtags = hashtags;
                    if (link && link.trim()) storyData.videoUrl = link;

                    const storyRes = await apiClient.post('/posts/story', storyData);
                    console.log('✅ [STORY] Post created:', storyRes.data);

                    // 2단계: Curation 포스트 생성
                    const curationData: PostData = {
                        title,
                        content,
                        postStatus: 'PUBLISHED',
                        primaryComposerId,
                    };

                    if (selectedComposers.length > 0) {
                        if (selectedComposers.length > 1) {
                            curationData.additionalComposerIds = selectedComposers.slice(1).map(c => c.id);
                        }
                    }

                    if (uploadedImages) curationData.images = uploadedImages;
                    if (hashtags.length > 0) curationData.hashtags = hashtags;
                    if (link && link.trim()) curationData.videoUrl = link;

                    const curationRes = await apiClient.post('/posts/curation', curationData);
                    console.log('✅ [CURATION] Post created:', curationRes.data);

                    alert('작곡가 이야기와 큐레이션이 등록되었습니다.');
                    router.push('/curation');
                    return;
                } catch (error: unknown) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    console.error('❌ API Error:', axiosError.response?.data);
                    alert('포스트 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Case 3: Curation Post (큐레이션 글 - 단독)
            if (isCurationPost) {
                if (selectedComposers.length === 0) {
                    alert('작곡가를 최소 1명 선택해주세요.');
                    setIsSubmitting(false);
                    return;
                }

                const curationData: PostData = {
                    title,
                    content,
                    postStatus: 'PUBLISHED',
                    primaryComposerId: selectedComposers[0].id,
                };

                if (selectedComposers.length > 1) {
                    curationData.additionalComposerIds = selectedComposers.slice(1).map(c => c.id);
                }

                if (uploadedImages) curationData.images = uploadedImages;
                if (hashtags.length > 0) curationData.hashtags = hashtags;
                if (link && link.trim()) curationData.videoUrl = link;

                const response = await apiClient.post('/posts/curation', curationData);
                console.log('✅ [CURATION] Post created:', response.data);

                alert('큐레이션이 등록되었습니다.');
                router.push('/curation');
                return;
            }

            // Case 4: Free Post (자유 글)
            const currentTime = getKSTISOString();
            const freeData: PostData = {
                title,
                content,
                postStatus: 'PUBLISHED',
                createdAt: currentTime,
            };

            if (uploadedImages) freeData.images = uploadedImages;
            if (hashtags.length > 0) freeData.hashtags = hashtags;
            if (link && link.trim()) freeData.videoUrl = link;

            const response = await apiClient.post('/posts/free', freeData);
            console.log('✅ [FREE] Post created:', response.data);

            alert('자유글이 등록되었습니다.');
            router.push('/free-talk');
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{
                message?: string;
                code?: string;
                fieldErrors?: Array<{ field: string; value: string; reason: string }>;
            }>;
            console.error('❌ An error occurred while creating the post:', axiosError);

            if (axiosError.response) {
                let errorMessage = '게시글 등록에 실패했습니다.';
                const errorData = axiosError.response.data;

                // COMMON_400 에러 처리 (비속어 포함 등)
                if (errorData?.code === 'COMMON_400' && errorData?.fieldErrors) {
                    const firstError = errorData.fieldErrors[0];
                    const message = firstError?.reason || errorData.message || '비속어가 포함되어 있습니다.';

                    setHasError(true);
                    setToastMessage(message);
                    setShowToast(true);
                    setIsShaking(true);
                    alert(message);

                    // 쉐이크 애니메이션 0.5초 후 해제
                    setTimeout(() => setIsShaking(false), 500);

                    // 에디터 포커스
                    contentRef.current?.focus();

                    setIsSubmitting(false); // 제출 상태 해제
                    return; // 함수 종료 (페이지 이동 안함)
                }

                if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                switch (axiosError.response.status) {
                    case 400:
                        if (!errorData?.code) errorMessage = '잘못된 요청입니다. 입력 내용을 확인해주세요.';
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

    const handleSaveDraft = async () => {
        const { userId } = useAuthStore.getState();

        if (!userId) {
            alert('사용자 정보를 확인할 수 없습니다.');
            return;
        }

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            // 게시글 타입 결정
            let postType: 'FREE' | 'CURATION' | 'STORY' = 'FREE';
            if (selectedType === '큐레이션 글') {
                postType = 'CURATION';
            } else if (selectedType.includes('이야기')) {
                postType = 'STORY';
            }

            // 유효한 이미지 URL만 필터링 (blob URL 제외, http(s) URL만 포함)
            const validImages = imagePreviewUrls.filter(url =>
                typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
            );

            // ========== 기본 payload ==========
            const basePayload = {
                title,
                content,
                hashtags: hashtags.filter(tag => tag.trim()),
                images: validImages,
                videoUrl: link,
                postStatus: 'DRAFT' as const,
            };

            // ========== 엔드포인트 및 payload 구성 ==========
            let endpoint = '';
            const payload: UpdatePayload = { ...basePayload };

            if (isEditMode && editPostId) {
                // ===== EDIT MODE =====
                if (postType === 'FREE') {
                    endpoint = `/posts/free/${editPostId}`;
                } else if (postType === 'STORY') {
                    endpoint = `/posts/story/${editPostId}`;
                    if (primaryComposerId) {
                        payload.primaryComposerId = primaryComposerId;
                    }
                } else if (postType === 'CURATION') {
                    endpoint = `/posts/curation/${editPostId}`;
                    if (selectedComposers.length > 0) {
                        payload.primaryComposerId = selectedComposers[0].id;
                        if (selectedComposers.length > 1) {
                            payload.additionalComposersId = selectedComposers.slice(1).map(c => c.id);
                        }
                    }
                }
                await apiClient.patch(endpoint, payload);
            } else {
                // ===== CREATE MODE =====
                if (postType === 'FREE') {
                    endpoint = '/posts/free';
                } else if (postType === 'STORY') {
                    endpoint = '/posts/story';
                    if (primaryComposerId) {
                        payload.primaryComposerId = primaryComposerId;
                    }
                } else if (postType === 'CURATION') {
                    endpoint = '/posts/curation';
                    if (selectedComposers.length > 0) {
                        payload.primaryComposerId = selectedComposers[0].id;
                        if (selectedComposers.length > 1) {
                            payload.additionalComposersId = selectedComposers.slice(1).map(c => c.id);
                        }
                    }
                }
                await apiClient.post(endpoint, payload);
            }

            alert('임시저장 되었습니다.');
            router.push('/my-page/drafts');
        } catch (error) {
            console.error('Failed to save draft:', error);
            alert('임시저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 클라이언트 사이드에서만 렌더링
    if (!isClient) {
        return null;
    }

    return (
        <div className="relative bg-[#f4f5f7] min-h-screen">
            {/* Header */}
            <header className="bg-white px-5 py-3 flex items-center sticky top-0 z-10 w-full">
                <div className="flex items-center gap-1 w-full">
                    <button onClick={handleSafeBack} className="flex-shrink-0">
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
                            className={`px-3 py-1.5 rounded-full flex items-center gap-0.5 ${isButtonEnabled && !isSubmitting ? 'bg-[#293a92]' : 'bg-[#bfbfbf]'
                                }`}
                        >
                            <span className="text-white text-[13px] font-semibold font-['Pretendard']">
                                {isEditMode ? '수정' : '등록'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main>
                {/* 토크룸 */}
                <SectionHeader title="토크룸" />
                <div className="bg-white px-6 py-[18px] flex items-center gap-2">
                    <div className="w-3 h-3 flex-shrink-0">
                        <Image
                            src="/icons/write-blue.svg"
                            alt="post type"
                            width={12}
                            height={12}
                        />
                    </div>
                    <p className="flex-1 text-[#1a1a1a] text-sm font-semibold font-['Pretendard'] text-left">{selectedType.replace(' 이야기', '')}</p>
                </div>

                {/* 큐레이션 옵션 드롭다운 ({composer} 이야기일 때만 렌더링) */}
                {isComposerTalkRoom && curationMode !== null && (
                    <>
                        <SectionHeader title="게시글 유형" />
                        <div className="bg-white px-6 py-[18px] w-full">
                            <select
                                value={curationMode}
                                onChange={(e) => setCurationMode(e.target.value as 'none' | 'curation')}
                                className="w-full px-4 py-2.5 bg-[#f4f5f7] rounded-[10px] text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none border border-transparent"
                            >
                                <option value="none">{selectedType}</option>
                                <option value="curation">큐레이션 글</option>
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
                                    <span className={`text-sm font-medium font-['Pretendard'] ${selectedComposers.length > 0 ? 'text-[#1a1a1a]' : 'text-[#d9d9d9]'
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
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (hasError) setHasError(false);
                        }}
                        className="w-full text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#d9d9d9]"
                    />
                </div>

                {/* 게시글 내용 */}
                <SectionHeader title="게시글 내용" />
                <div className="w-full px-5 py-[18px] bg-white">
                    <textarea
                        ref={contentRef}
                        placeholder={selectedType === '큐레이션 글'
                            ? "나만의 이야기를 담아 클래식 음악을 추천해주세요!"
                            : "작곡가에 대해 같은 음악 취향을 가진 사람들과 나누고픈 이야기를 자유롭게 적어보세요!"}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (hasError) setHasError(false);
                        }}
                        className={`w-full h-48 resize-none text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#d9d9d9] p-2 rounded-md transition-all duration-200 ${hasError ? 'border border-red-500 bg-red-50' : 'border-none'} ${isShaking ? 'animate-shake' : ''}`}
                    />
                </div>

                {/* 해시태그 등록 */}
                <SectionHeader title="해시태그 등록" />
                <HashtagInput
                    value={hashtags}
                    onChange={setHashtags}
                    placeholder="해시태그 작성 최대 N개"
                />

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
                            {imageFiles.map((file: File, index: number) => (
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

            {/* Toast Notification */}
            <ToastNotification
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
