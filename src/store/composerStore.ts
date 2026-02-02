import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  hasHydrated: boolean;
  setComposers: (composers: Composer[]) => void;
  selectComposer: (composerIdOrData: number | Composer) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useComposerStore = create<ComposerStore>()(
  persist(
    (set, get) => ({
      composers: [],
      selectedComposer: null,
      hasHydrated: false,

      setComposers: (composers) => set({ composers }),

      selectComposer: (composerIdOrData) => {
        if (typeof composerIdOrData === 'number') {
          const composer = get().composers.find((c) => c.composerId === composerIdOrData);
          set({ selectedComposer: composer || null });
        } else {
          set({ selectedComposer: composerIdOrData });
        }
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'composer-store',
      partialize: (state) => ({
        composers: state.composers,
        selectedComposer: state.selectedComposer,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
