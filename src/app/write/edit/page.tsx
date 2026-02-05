'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';
import { patchPost, PostUpdateRequest, normalizePostUpdateData } from '@/lib/postApi';
import ToastNotification from '@/components/ToastNotification';

// ================== TypeScript Interfaces ==================

interface Composer {
  composerId?: number;
  id?: number;
  koreanName: string;
  englishName: string;
  nativeName: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthYear: number;
  deathYear: number;
  bio: string;
}

interface PostDetail {
  id: number;
  type: 'FREE' | 'CURATION' | 'STORY';
  title: string;
  content: string;
  writerNickname: string;
  writerProfileImage: string;
  createdAt: string;
  updatedAt: string;
  postStatus: 'PUBLISHED' | 'DRAFT';
  isLiked: boolean;
  isScrapped: boolean;
  isBlocked: boolean;
  likeCount: number;
  commentCount: number;
  images: string[];
  hashtags: string[];
  videoUrl: string | null;
  primaryComposer?: Composer;
  additionalComposers?: Composer[];
  comments: any[];
}

interface EditPageProps {
  params: Promise<{
    postId: string;
  }>;
}

// ================== Main Component ==================

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 파라미터
  const postId = searchParams.get('edit');
  const postType = (searchParams.get('type')?.toUpperCase() as 'FREE' | 'CURATION' | 'STORY') || 'FREE';

  // 상태 관리
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    hashtags: [] as string[],
    images: [] as string[],
    videoUrl: '',
    postStatus: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    primaryComposerId: 0,
    additionalComposersId: [] as number[],
  });

  // ========== Data Fetching ==========
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('포스트 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/posts/${postId}`);
        const fetchedPost: PostDetail = response.data;
        setPost(fetchedPost);

        // 폼 데이터 초기화
        const primaryId = fetchedPost.primaryComposer?.id ?? fetchedPost.primaryComposer?.composerId ?? 0;
        const additionalIds = (fetchedPost.additionalComposers || [])
          .map((c) => c.id ?? c.composerId)
          .filter((id): id is number => typeof id === 'number');

        setFormData({
          title: fetchedPost.title,
          content: fetchedPost.content,
          hashtags: fetchedPost.hashtags || [],
          images: fetchedPost.images || [],
          videoUrl: fetchedPost.videoUrl || '',
          postStatus: fetchedPost.postStatus,
          primaryComposerId: primaryId,
          additionalComposersId: additionalIds,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        const axiosError = err as AxiosError<{ message: string }>;
        if (axiosError.response?.status === 404) {
          setError('요청하신 포스트를 찾을 수 없습니다.');
        } else if (axiosError.response?.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError(axiosError.response?.data?.message || '포스트를 불러올 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // ========== Event Handlers ==========

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 폼 필드 변경 감지
  const handleFieldChange = (
    field: keyof typeof formData,
    value: any
  ) => {
    const oldValue = formData[field];
    const newValue = value;

    // 깊은 비교 (배열, 객체)
    const isChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (isChanged) {
      setHasChanges(true);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('title', e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange('content', e.target.value);
  };

  const handleHashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const hashtags = value
      .split(/[,\s]+/)
      .map((tag) => tag.replace(/^#/, '').trim())
      .filter((tag) => tag.length > 0);
    handleFieldChange('hashtags', hashtags);
  };

  const handlePostStatusChange = (status: 'PUBLISHED' | 'DRAFT') => {
    handleFieldChange('postStatus', status);
  };

  // 수정 완료 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post || !postId) {
      showToast('포스트 정보를 불러올 수 없습니다.', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 요청 데이터 구성
      let requestData: PostUpdateRequest = {
        title: formData.title,
        content: formData.content,
        hashtags: formData.hashtags,
        images: formData.images,
        videoUrl: formData.videoUrl,
        postStatus: formData.postStatus,
      };

      // 타입별 추가 필드
      if (post.type === 'STORY' || post.type === 'CURATION') {
        if (!formData.primaryComposerId) {
          showToast('작곡가 정보가 없습니다. 다시 시도해주세요.', 'error');
          setSubmitting(false);
          return;
        }
        (requestData as any).primaryComposerId = formData.primaryComposerId;
      }

      if (post.type === 'CURATION') {
        (requestData as any).additionalComposersId =
          (formData.additionalComposersId || []).filter((id) => typeof id === 'number');
      }

      // 데이터 정규화
      const normalizedData = normalizePostUpdateData(requestData);

      // API 호출
      await patchPost(postId, post.type, normalizedData as PostUpdateRequest);

      showToast('포스트가 수정되었습니다.');

      // 1초 후 상세 페이지로 리다이렉트
      setTimeout(() => {
        router.push(`/posts/${postId}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to update post:', err);
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 404) {
        showToast('요청하신 포스트를 찾을 수 없습니다.', 'error');
      } else if (axiosError.response?.status === 401) {
        showToast('로그인이 필요합니다.', 'error');
      } else if (axiosError.response?.status === 403) {
        showToast('수정 권한이 없습니다.', 'error');
      } else {
        const message =
          axiosError.response?.data?.message ||
          (err instanceof Error ? err.message : '포스트 수정에 실패했습니다.');
        showToast(message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ========== Render States ==========

  if (loading) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#e5e7eb] border-t-[#293a92] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666666]">포스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-[#f4f5f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '포스트를 불러올 수 없습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#293a92] text-white rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="bg-white w-full max-w-md mx-auto">
        {/* ========== Header ========== */}
        <div className="px-5 py-3 flex items-center gap-1 border-b border-[#f4f5f7] sticky top-0 bg-white z-10">
          <Link href={`/posts/${postId}`} className="flex-shrink-0">
            <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
          </Link>
          <h1 className="flex-1 text-center text-[#1a1a1a] text-base font-semibold">
            포스트 수정
          </h1>
          <div className="w-6" />
        </div>

        {/* ========== Form ========== */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 pb-20">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              maxLength={15}
              placeholder="포스트 제목 (15자 이내)"
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#293a92] focus:ring-2 focus:ring-[#293a92] focus:ring-opacity-10"
            />
            <p className="text-xs text-[#999999] mt-1">
              {formData.title.length}/15
            </p>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={handleContentChange}
              maxLength={3000}
              placeholder="포스트 내용 (5자 이상 3000자 이하)"
              rows={8}
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#293a92] focus:ring-2 focus:ring-[#293a92] focus:ring-opacity-10 resize-none"
            />
            <p className="text-xs text-[#999999] mt-1">
              {formData.content.length}/3000
            </p>
          </div>

          {/* 해시태그 */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              해시태그
            </label>
            <input
              type="text"
              value={formData.hashtags.join(', ')}
              onChange={handleHashtagChange}
              placeholder="쉼표(,) 또는 공백으로 구분하여 입력"
              className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#293a92] focus:ring-2 focus:ring-[#293a92] focus:ring-opacity-10"
            />
            {formData.hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#f4f5f7] text-[#293a92] text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 포스트 상태 */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              공개 상태
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePostStatusChange('PUBLISHED')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  formData.postStatus === 'PUBLISHED'
                    ? 'bg-[#293a92] text-white'
                    : 'bg-[#f4f5f7] text-[#666666] hover:bg-[#efefef]'
                }`}
              >
                공개
              </button>
              <button
                type="button"
                onClick={() => handlePostStatusChange('DRAFT')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  formData.postStatus === 'DRAFT'
                    ? 'bg-[#293a92] text-white'
                    : 'bg-[#f4f5f7] text-[#666666] hover:bg-[#efefef]'
                }`}
              >
                임시저장
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] p-4 max-w-md mx-auto">
            <button
              type="submit"
              disabled={!hasChanges || submitting}
              className="w-full px-4 py-3 bg-[#293a92] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>수정 중...</span>
                </>
              ) : (
                '수정 완료'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========== Toast Notification ========== */}
      {toast && (
        <ToastNotification
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
