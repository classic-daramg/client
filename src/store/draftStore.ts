import { create } from 'zustand';

type DraftData = {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  createdAt: string;
  writerNickname: string;
  likeCount: number;
  commentCount: number;
  thumbnailImageUrl: string | null;
  type: string;
  primaryComposer?: {
    id?: number;
    composerId?: number;
    koreanName?: string;
    englishName?: string;
  } | null;
  isLiked: boolean | null;
  isScrapped: boolean | null;
};

type DraftState = {
  draft: DraftData | null;
  setDraft: (draft: DraftData) => void;
  clearDraft: () => void;
};

export const useDraftStore = create<DraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
