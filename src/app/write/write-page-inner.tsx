'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { useDraftStore } from '@/store/draftStore';
import WriteHeader from './components/WriteHeader';
import WriteForm from './components/WriteForm';

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
    primaryComposerName?: string;
    additionalComposersId?: number[];
    additionalComposerIds?: number[];
};

export function WritePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { draft } = useDraftStore();

    // ========== Input States ==========
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [link, setLink] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [selectedComposers, setSelectedComposers] = useState<Array<{ id: number; name: string }>>([]);
    const [showComposerSearch, setShowComposerSearch] = useState(false);
    const [curationMode, setCurationMode] = useState<'none' | 'curation' | null>(null);

    // ========== UI & Control States ==========
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const [editPostData, setEditPostData] = useState<EditPostData | null>(null);
    const [primaryComposerId, setPrimaryComposerId] = useState<number | null>(null);

    const contentRef = useRef<HTMLTextAreaElement>(null);

    // ========== URL Parameters ==========
    const composerNameParam = searchParams.get('composer');
    const composerIdParam = searchParams.get('composerId') ? parseInt(searchParams.get('composerId')!) : null;
    const postTypeParam = searchParams.get('type');
    const editIdParam = searchParams.get('edit');
    const draftId = searchParams.get('draftId');

    useEffect(() => {
        setIsClient(true);
    }, []);

    // PostType Logic
    const getSelectedType = (): string => {
        if (composerNameParam) return `${composerNameParam} 이야기`;
        if (composerIdParam && draftId) return '작곡가 이야기';
        if (postTypeParam === 'curation') return '큐레이션 글';
        return '자유 글';
    };
    const [selectedType, setSelectedType] = useState<string>(getSelectedType());

    // ========== Initialization Effect (Mount ONLY) ==========
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!isClient) return;
        if (!isInitialMount.current) return;

        const initialize = async () => {
            // 1. Edit Mode
            if (editIdParam) {
                setIsEditMode(true);
                setEditPostId(editIdParam);
                try {
                    const res = await apiClient.get(`/posts/${editIdParam}`);
                    const post = res.data as EditPostData;
                    setEditPostData(post);
                    setTitle(post.title);
                    setContent(post.content);
                    setHashtags(post.hashtags || []);
                    setLink(post.videoUrl || '');
                    setImagePreviewUrls(post.images || []);

                    if (post.type === 'CURATION') {
                        setSelectedType('큐레이션 글');
                        const list: Array<{ id: number; name: string }> = [];
                        if (post.primaryComposer) {
                            const id = post.primaryComposer.id ?? post.primaryComposer.composerId;
                            if (id) list.push({ id, name: post.primaryComposer.koreanName || post.primaryComposer.englishName || '' });
                        }
                        if (post.additionalComposers) {
                            post.additionalComposers.forEach(c => {
                                const id = c.id ?? c.composerId;
                                if (id) list.push({ id, name: c.koreanName || c.englishName || '' });
                            });
                        }
                        setSelectedComposers(list);
                    } else if (post.type === 'STORY' && post.primaryComposer) {
                        setSelectedType(`${post.primaryComposer.koreanName} 이야기`);
                        setPrimaryComposerId(post.primaryComposer.id ?? post.primaryComposer.composerId ?? null);
                    } else if (post.type === 'FREE') {
                        setSelectedType('자유 글');
                    }
                } catch (e) {
                    console.error("Failed to load edit post", e);
                }
            }
            // 2. Draft Mode
            else if (draftId && draft && String(draft.id) === draftId) {
                setTitle(draft.title || '');
                setContent(draft.content || '');
                setHashtags(draft.hashtags || []);
                setImagePreviewUrls(draft.thumbnailImageUrl ? [draft.thumbnailImageUrl] : []);

                const dCid = draft.primaryComposer?.id ?? draft.primaryComposer?.composerId ?? composerIdParam;
                const dCname = draft.primaryComposer?.koreanName ?? draft.primaryComposer?.englishName ?? composerNameParam ?? '';

                if (dCid && dCname) {
                    const list = [{ id: dCid, name: dCname }];
                    draft.additionalComposers?.forEach(c => {
                        const cid = c.id ?? c.composerId;
                        if (cid) list.push({ id: cid, name: c.koreanName || c.englishName || '' });
                    });
                    setSelectedComposers(list);
                    setPrimaryComposerId(dCid);
                    if (draft.type === 'STORY') setSelectedType(`${dCname} 이야기`);
                }
            }
            // 3. New Post with URL params
            else if (composerIdParam && composerNameParam) {
                setSelectedComposers([{ id: composerIdParam, name: composerNameParam }]);
                setPrimaryComposerId(composerIdParam);
                setSelectedType(`${composerNameParam} 이야기`);
            }

            isInitialMount.current = false;
        };

        initialize();
    }, [isClient, editIdParam, draftId, draft, composerIdParam, composerNameParam]);

    // curationMode sync
    useEffect(() => {
        if (selectedType.includes('이야기')) setCurationMode('none');
        else setCurationMode(null);
    }, [selectedType]);

    // ========== Handlers ==========
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
            setImagePreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        }
    };

    const handleRemoveImage = (index: number) => {
        if (imagePreviewUrls[index].startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrls[index]);
        }
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const isButtonEnabled = title.trim() !== '' && content.trim() !== '' &&
        (selectedType === '큐레이션 글' ? selectedComposers.length > 0 : true);

    const handleRegister = async () => {
        if (!isButtonEnabled || isSubmitting) return;
        if (!isAuthenticated()) {
            alert('로그인이 필요합니다.');
            router.push('/loginpage');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload images first
            let uploadedUrls: string[] = [];
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(f => formData.append('images', f));
                const res = await apiClient.post('/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls = res.data.imageUrls;
            }

            const finalImages = [
                ...imagePreviewUrls.filter(url => url.startsWith('http')),
                ...uploadedUrls
            ];

            const pId = selectedComposers[0]?.id || primaryComposerId;
            const payload: any = {
                title, content, hashtags, images: finalImages,
                videoUrl: link.trim(), postStatus: 'PUBLISHED',
                createdAt: new Date().toISOString()
            };

            if (isEditMode && editPostId) {
                let endpoint = `/posts/free/${editPostId}`;
                if (editPostData?.type === 'STORY') endpoint = `/posts/story/${editPostId}`;
                else if (editPostData?.type === 'CURATION') {
                    endpoint = `/posts/curation/${editPostId}`;
                    payload.additionalComposersId = selectedComposers.slice(1).map(c => c.id);
                }
                await apiClient.patch(endpoint, payload);
                alert('수정되었습니다.');
                router.push(`/posts/${editPostId}`);
            } else {
                let endpoint = '/posts/free';
                if (selectedType === '큐레이션 글' || curationMode === 'curation') {
                    endpoint = '/posts/curation';
                    payload.primaryComposerId = pId;
                    payload.additionalComposerIds = selectedComposers.slice(1).map(c => c.id);
                } else if (selectedType.includes('이야기')) {
                    endpoint = '/posts/story';
                    payload.primaryComposerId = pId;
                }
                await apiClient.post(endpoint, payload);
                alert('등록되었습니다.');
                router.refresh();
                router.push(pId ? `/composer-talk-room/${pId}` : '/free-talk');
            }
        } catch (e: any) {
            console.error("Submission failed", e);
            if (e.response?.data?.code === 'COMMON_400') {
                setHasError(true);
                setToastMessage(e.response.data.message || '비속어가 포함되어 있습니다.');
                setShowToast(true);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            } else {
                alert('등록 중 오류가 발생했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!title.trim()) {
            alert('제목을 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const validImages = imagePreviewUrls.filter(url => url.startsWith('http'));

            // 게시글 타입 결정
            let postType: PostType = 'FREE';
            if (selectedType === '큐레이션 글') {
                postType = 'CURATION';
            } else if (selectedType.includes('이야기')) {
                postType = (curationMode === 'curation') ? 'CURATION' : 'STORY';
            }

            const pId = selectedComposers[0]?.id || primaryComposerId;
            const payload: any = {
                title,
                content,
                hashtags: hashtags.filter(tag => tag.trim()),
                images: validImages,
                videoUrl: link.trim(),
                postStatus: 'DRAFT',
            };

            let endpoint = '';
            if (isEditMode && editPostId) {
                // 수정 모드에서의 임시저장
                if (postType === 'FREE') endpoint = `/posts/free/${editPostId}`;
                else if (postType === 'STORY') endpoint = `/posts/story/${editPostId}`;
                else if (postType === 'CURATION') {
                    endpoint = `/posts/curation/${editPostId}`;
                    payload.additionalComposersId = selectedComposers.slice(1).map(c => c.id);
                }
                await apiClient.patch(endpoint, payload);
            } else {
                // 신규 작성 모드에서의 임시저장
                if (postType === 'FREE') endpoint = '/posts/free';
                else if (postType === 'STORY') {
                    endpoint = '/posts/story';
                    payload.primaryComposerId = pId;
                } else if (postType === 'CURATION') {
                    endpoint = '/posts/curation';
                    payload.primaryComposerId = pId;
                    payload.additionalComposerIds = selectedComposers.slice(1).map(c => c.id);
                }
                await apiClient.post(endpoint, payload);
            }

            setToastMessage('임시 저장되었습니다.');
            setShowToast(true);
        } catch (e) {
            console.error("Draft save failed", e);
            alert('임시 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) return null;

    return (
        <div className="relative bg-[#f4f5f7] min-h-screen">
            <WriteHeader
                onSaveDraft={handleSaveDraft}
                onRegister={handleRegister}
                isRegisterEnabled={isButtonEnabled && !isSubmitting}
            />
            <WriteForm
                title={title} setTitle={setTitle}
                content={content} setContent={setContent}
                hashtags={hashtags} setHashtags={setHashtags}
                link={link} setLink={setLink}
                imageFiles={imageFiles}
                imagePreviewUrls={imagePreviewUrls}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                selectedType={selectedType}
                isComposerTalkRoom={selectedType.includes('이야기')}
                curationMode={curationMode} setCurationMode={setCurationMode}
                selectedComposers={selectedComposers}
                onSelectComposer={setSelectedComposers}
                showComposerSearch={showComposerSearch}
                setShowComposerSearch={setShowComposerSearch}
                hasError={hasError}
                isShaking={isShaking}
                toastMessage={toastMessage}
                showToast={showToast}
                setShowToast={setShowToast}
                contentRef={contentRef}
            />
        </div>
    );
}
