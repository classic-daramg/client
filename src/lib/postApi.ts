import { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// ================== Type Definitions ==================

/**
 * 포스트 수정 요청 시 공통 필드
 */
export interface PostUpdateCommonFields {
  title: string;
  content: string;
  hashtags: string[];
  images: string[];
  videoUrl: string;
  postStatus: 'PUBLISHED' | 'DRAFT';
}

/**
 * FREE 타입 포스트 수정 요청
 */
export type FreePostUpdateRequest = PostUpdateCommonFields;

/**
 * STORY 타입 포스트 수정 요청
 */
export interface StoryPostUpdateRequest extends PostUpdateCommonFields {
  primaryComposerId: number;
}

/**
 * CURATION 타입 포스트 수정 요청
 */
export interface CurationPostUpdateRequest extends PostUpdateCommonFields {
  primaryComposerId: number;
  additionalComposersId: number[];
}

/**
 * 포스트 타입별 수정 요청 타입 union
 */
export type PostUpdateRequest =
  | FreePostUpdateRequest
  | StoryPostUpdateRequest
  | CurationPostUpdateRequest;

// ================== API Functions ==================

/**
 * 포스트 수정 (PATCH)
 * 
 * @param postId - 수정할 포스트 ID
 * @param postType - 포스트 타입 (FREE, CURATION, STORY)
 * @param data - 수정 데이터
 * @returns 수정된 포스트 정보
 */
export async function patchPost(
  postId: string,
  postType: 'FREE' | 'CURATION' | 'STORY',
  data: PostUpdateRequest
) {
  try {
    let endpoint = '';

    switch (postType) {
      case 'FREE':
        endpoint = `/posts/free/${postId}`;
        break;
      case 'STORY':
        endpoint = `/posts/story/${postId}`;
        break;
      case 'CURATION':
        endpoint = `/posts/curation/${postId}`;
        break;
      default:
        throw new Error(`Unknown post type: ${postType}`);
    }

    const response = await apiClient.patch(endpoint, data);
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || '포스트 수정에 실패했습니다.'
    );
  }
}

/**
 * 포스트 삭제 (DELETE)
 * 
 * @param postId - 삭제할 포스트 ID
 */
export async function deletePost(postId: string) {
  try {
    await apiClient.delete(`/posts/${postId}`);
  } catch (err) {
    const axiosError = err as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message || '포스트 삭제에 실패했습니다.'
    );
  }
}

/**
 * 포스트 수정 요청 데이터 정규화
 * 
 * OpenAPI 명세서에 따라:
 * - images, hashtags: 삭제 시 빈 리스트([])
 * - videoUrl: 삭제 시 빈 문자열("")
 * - 이 함수는 데이터를 올바른 형식으로 변환
 * 
 * @param data - 원본 데이터
 * @returns 정규화된 데이터
 */
export function normalizePostUpdateData(data: Partial<PostUpdateRequest>) {
  return {
    ...data,
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    images: Array.isArray(data.images) ? data.images : [],
    videoUrl: typeof data.videoUrl === 'string' ? data.videoUrl : '',
  };
}
