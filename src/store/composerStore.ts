import { create } from 'zustand';

export type Composer = {
  composerId: number;
  koreanName: string;
  englishName: string;
  nativeName: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE';
  birthYear: number;
  deathYear: number | null;
  bio: string;
  isLiked: boolean;
};

interface ComposerStore {
  composers: Composer[];
  selectedComposer: Composer | null;
  setComposers: (composers: Composer[]) => void;
  selectComposer: (composerIdOrData: number | Composer) => void;
}

export const useComposerStore = create<ComposerStore>((set, get) => ({
  composers: [],
  selectedComposer: null,
  
  setComposers: (composers) => set({ composers }),
  
  selectComposer: (composerIdOrData) => {
    if (typeof composerIdOrData === 'number') {
      const composer = get().composers.find((c) => c.composerId === composerIdOrData);
      set({ selectedComposer: composer || null });
    } else {
      set({ selectedComposer: composerIdOrData });
    }
  },
}));
