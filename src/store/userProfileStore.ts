'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  bio: string;
  profileImage: string;
  birthDate: string;
}

interface UserProfileStore {
  profile: UserProfile | null;
  defaultProfileImage: string;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setProfileImage: (image: string) => void;
  resetToDefaultImage: () => void;
  getProfileImage: () => string;
  clearProfile: () => void;

  // Registration에서 프로필 데이터 로드
  loadFromRegistration: (registrationData: { name?: string; email?: string; birthDate?: string; profile?: { nickname?: string; bio?: string; profileImage?: string } }) => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      defaultProfileImage: '/icons/DefaultImage.svg',

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setProfileImage: (image) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, profileImage: image } : null,
        })),

      resetToDefaultImage: () =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, profileImage: state.defaultProfileImage }
            : null,
        })),

      getProfileImage: () => {
        const state = get();
        return state.profile?.profileImage || state.defaultProfileImage;
      },

      clearProfile: () => set({ profile: null }),

      loadFromRegistration: (registrationData) => {
        if (registrationData && registrationData.name && registrationData.profile) {
          const profile: UserProfile = {
            name: registrationData.name,
            nickname: registrationData.profile.nickname,
            email: registrationData.email,
            bio: registrationData.profile.bio || '',
            profileImage: registrationData.profile.profileImage || get().defaultProfileImage,
            birthDate: registrationData.birthDate,
          };
          set({ profile });
        }
      },
    }),
    {
      name: 'user-profile-storage', // localStorage key
    }
  )
);