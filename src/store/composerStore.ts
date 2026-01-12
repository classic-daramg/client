import { create } from 'zustand';

export type Composer = {
  composerId: number;
  koreanName: string;
  bio: string;
  isLiked: boolean;
};

interface ComposerStore {
  composers: Composer[];
  selectedComposer: Composer | null;
  setComposers: (composers: Composer[]) => void;
  selectComposer: (composerId: number) => void;
}

export const useComposerStore = create<ComposerStore>((set, get) => ({
  composers: [],
  selectedComposer: null,
  
  setComposers: (composers) => set({ composers }),
  
  selectComposer: (composerId) => {
    const composer = get().composers.find((c) => c.composerId === composerId);
    set({ selectedComposer: composer || null });
  },
}));
