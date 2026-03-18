'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { useUserProfileStore } from '@/store/userProfileStore';

// ================== Types ==================

type Banner = {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  orderIndex: number;
};

type ComposerForm = {
  koreanName: string;
  englishName: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthYear: string;
  deathYear: string;
  bio: string;
  era: 'MEDIEVAL_RENAISSANCE' | 'BAROQUE' | 'CLASSICAL' | 'ROMANTIC' | 'MODERN_CONTEMPORARY' | '';
  continent: 'ASIA' | 'NORTH_AMERICA' | 'EUROPE' | 'SOUTH_AMERICA' | 'AFRICA_OCEANIA' | '';
};

// ================== Component ==================

export default function AdminPage() {
  const router = useRouter();
  const { profile, authInitialized } = useUserProfileStore();

  const [banners, setBanners] = useState<Banner[]>([]);

  // 배너 추가
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string>('');
  const [newBannerLinkUrl, setNewBannerLinkUrl] = useState('');
  const [newBannerLoading, setNewBannerLoading] = useState(false);
  const newBannerFileInputRef = useRef<HTMLInputElement>(null);

  // 배너 수정
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [editBannerImageFile, setEditBannerImageFile] = useState<File | null>(null);
  const [editBannerImagePreview, setEditBannerImagePreview] = useState('');
  const editBannerFileInputRef = useRef<HTMLInputElement>(null);
  const [bannerLoading, setBannerLoading] = useState(false);

  const [composerForm, setComposerForm] = useState<ComposerForm>({
    koreanName: '',
    englishName: '',
    nationality: '',
    gender: 'MALE',
    birthYear: '',
    deathYear: '',
    bio: '',
    era: '',
    continent: '',
  });

  const [bannerFetchError, setBannerFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [composerLoading, setComposerLoading] = useState(false);

  // 관리자 권한 체크
  useEffect(() => {
    if (!authInitialized) return;
    if (!profile || profile.role !== 'ADMIN') {
      setTimeout(() => router.replace('/'), 2000);
    }
  }, [authInitialized, profile, router]);

  // 배너 목록 조회
  const fetchBanners = () => {
    setBannerFetchError(null);
    apiClient.get<Banner[]>('/banners')
      .then((res) => setBanners(res.data.filter((b) => b.isActive)))
      .catch((err) => {
        const status = err?.response?.status;
        const msg = status ? `배너 조회 실패 (${status})` : '배너 조회 실패 (네트워크 오류)';
        setBannerFetchError(msg);
        console.error('배너 조회 실패:', err);
      });
  };

  useEffect(() => {
    if (!authInitialized || !profile || profile.role !== 'ADMIN') return;
    fetchBanners();
  }, [authInitialized, profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ================== 배너 추가 ==================

  const handleNewBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewBannerFile(file);
    setNewBannerPreview(URL.createObjectURL(file));
  };

  const handleCreateBanner = async () => {
    if (!newBannerFile) {
      showToast('이미지를 선택해주세요.', 'error');
      return;
    }
    setNewBannerLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', newBannerFile);
      if (newBannerLinkUrl) formData.append('linkUrl', newBannerLinkUrl);
      await apiClient.post('/banners/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('배너가 추가되었습니다.');
      setNewBannerFile(null);
      setNewBannerPreview('');
      setNewBannerLinkUrl('');
      fetchBanners();
    } catch (err) {
      console.error('배너 추가 실패:', err);
      showToast('배너 추가에 실패했습니다.', 'error');
    } finally {
      setNewBannerLoading(false);
    }
  };

  // ================== 배너 수정 ==================

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerLinkUrl(banner.linkUrl ?? '');
    setEditBannerImageFile(null);
    setEditBannerImagePreview('');
  };

  const handleEditBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditBannerImageFile(file);
    setEditBannerImagePreview(URL.createObjectURL(file));
  };

  const handleSaveBanner = async () => {
    if (!editingBanner) return;
    setBannerLoading(true);
    try {
      let imageUrl: string | null = null;
      let tempBannerId: number | null = null;

      if (editBannerImageFile) {
        const formData = new FormData();
        formData.append('image', editBannerImageFile);
        const res = await apiClient.post<Banner>('/banners/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = res.data.imageUrl;
        tempBannerId = res.data.id;
      }

      await apiClient.patch(`/banners/${editingBanner.id}`, {
        linkUrl: bannerLinkUrl || null,
        imageUrl: imageUrl,
      });

      if (tempBannerId) {
        await apiClient.patch(`/banners/${tempBannerId}`, { isActive: false });
      }

      showToast('배너가 수정되었습니다.');
      setEditingBanner(null);
      setEditBannerImageFile(null);
      setEditBannerImagePreview('');
      fetchBanners();
    } catch (err) {
      console.error('배너 수정 실패:', err);
      showToast('배너 수정에 실패했습니다.', 'error');
    } finally {
      setBannerLoading(false);
    }
  };

  // ================== 작곡가 추가 ==================

  const handleComposerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerForm.era || !composerForm.continent) {
      showToast('시대와 대륙을 선택해주세요.', 'error');
      return;
    }
    setComposerLoading(true);
    try {
      await apiClient.post('/composers', {
        koreanName: composerForm.koreanName,
        englishName: composerForm.englishName,
        nationality: composerForm.nationality,
        gender: composerForm.gender,
        birthYear: Number(composerForm.birthYear),
        deathYear: composerForm.deathYear ? Number(composerForm.deathYear) : null,
        bio: composerForm.bio,
        era: composerForm.era,
        continent: composerForm.continent,
      });
      showToast(`${composerForm.koreanName} 작곡가가 추가되었습니다.`);
      setComposerForm({
        koreanName: '', englishName: '', nationality: '',
        gender: 'MALE', birthYear: '', deathYear: '', bio: '', era: '', continent: '',
      });
    } catch (err) {
      console.error('작곡가 추가 실패:', err);
      showToast('작곡가 추가에 실패했습니다.', 'error');
    } finally {
      setComposerLoading(false);
    }
  };

  if (!authInitialized) return null;

  if (!profile || profile.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[#1A1A1A] text-lg font-semibold">접근 권한이 없습니다</p>
        <p className="text-[#a6a6a6] text-sm text-center">관리자 계정으로만 접근할 수 있습니다.<br />잠시 후 홈으로 이동합니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen">
      {/* Header */}
      <header className="w-full flex items-center px-5 pt-[54px] pb-4 gap-3">
        <button onClick={() => router.back()}>
          <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
        </button>
        <h1 className="text-[#1A1A1A] text-xl font-semibold">관리자 페이지</h1>
      </header>

      <div className="px-5 flex flex-col gap-4 pb-20">

        {/* ===== 배너 관리 ===== */}
        <section className="bg-white rounded-[20px] p-5 shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)]">
          <h2 className="text-[#1A1A1A] text-base font-semibold mb-4">배너 관리</h2>

          {/* 배너 추가 */}
          <div className="mb-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#1A1A1A]">새 배너 추가</p>

            <input
              ref={newBannerFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleNewBannerFileChange}
            />

            {newBannerPreview ? (
              <div
                className="relative w-full aspect-[335/148] rounded-xl overflow-hidden bg-[#f4f5f7] cursor-pointer"
                onClick={() => newBannerFileInputRef.current?.click()}
              >
                <Image src={newBannerPreview} alt="미리보기" fill className="object-cover" />
              </div>
            ) : (
              <button
                onClick={() => newBannerFileInputRef.current?.click()}
                className="w-full aspect-[335/148] border-2 border-dashed border-[#d0d0d0] rounded-xl flex flex-col items-center justify-center gap-1 text-[#a6a6a6]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#a6a6a6" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs">이미지 선택</span>
              </button>
            )}

            <div>
              <label className="text-xs text-[#a6a6a6] mb-1 block">링크 경로</label>
              <input
                type="text"
                value={newBannerLinkUrl}
                onChange={(e) => setNewBannerLinkUrl(e.target.value)}
                placeholder="/posts/123 또는 /fortune-receipt"
                className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
              />
            </div>

            <button
              onClick={handleCreateBanner}
              disabled={newBannerLoading || !newBannerFile}
              className="w-full py-2.5 bg-[#293a92] rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            >
              {newBannerLoading ? '추가 중...' : '배너 추가'}
            </button>
          </div>

          {/* 기존 배너 목록 */}
          {banners.length > 0 && (
            <>
              <div className="border-t border-[#f4f5f7] pt-4 mb-3">
                <p className="text-sm font-semibold text-[#1A1A1A]">배너 목록</p>
              </div>
              <div className="flex flex-col gap-3">
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-[#eee] rounded-xl overflow-hidden">
                    <div className="relative w-full aspect-[335/148]">
                      <Image src={banner.imageUrl} alt={`Banner ${banner.id}`} fill className="object-cover" />
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-[#4c4c4c] truncate max-w-[200px]">{banner.linkUrl}</span>
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="text-xs font-semibold text-[#293a92]"
                      >
                        링크 수정
                      </button>
                    </div>

                    {/* 인라인 수정 폼 */}
                    {editingBanner?.id === banner.id && (
                      <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#f4f5f7] pt-2">
                        {/* 이미지 변경 */}
                        <input
                          ref={editBannerFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditBannerImageChange}
                        />
                        <button
                          onClick={() => editBannerFileInputRef.current?.click()}
                          className="w-full py-2 border border-dashed border-[#d0d0d0] rounded-xl text-xs text-[#a6a6a6] flex items-center justify-center gap-1"
                        >
                          {editBannerImagePreview ? (
                            <span className="text-[#293a92] font-semibold">이미지 변경됨 (다시 선택)</span>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="#a6a6a6" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              이미지 변경 (선택 안 하면 유지)
                            </>
                          )}
                        </button>
                        {editBannerImagePreview && (
                          <div className="relative w-full aspect-[335/148] rounded-xl overflow-hidden">
                            <Image src={editBannerImagePreview} alt="새 이미지 미리보기" fill className="object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={bannerLinkUrl}
                          onChange={(e) => setBannerLinkUrl(e.target.value)}
                          placeholder="/posts/123 또는 /fortune-receipt"
                          className="w-full px-3 py-2 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingBanner(null);
                              setEditBannerImageFile(null);
                              setEditBannerImagePreview('');
                            }}
                            className="flex-1 py-2 bg-[#f4f5f7] rounded-xl text-xs font-semibold text-[#4c4c4c]"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveBanner}
                            disabled={bannerLoading}
                            className="flex-1 py-2 bg-[#293a92] rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {bannerLoading ? '저장 중...' : '저장'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {bannerFetchError && (
            <p className="text-sm text-red-500 text-center py-2">{bannerFetchError}</p>
          )}
          {!bannerFetchError && banners.length === 0 && (
            <p className="text-sm text-[#a6a6a6] text-center py-2">등록된 배너가 없습니다.</p>
          )}
        </section>

        {/* ===== 작곡가 추가 ===== */}
        <section className="bg-white rounded-[20px] p-5 shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)]">
          <h2 className="text-[#1A1A1A] text-base font-semibold mb-4">작곡가 추가</h2>

          <form onSubmit={handleComposerSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-[#a6a6a6] mb-1 block">한국어 이름 *</label>
                <input
                  required
                  value={composerForm.koreanName}
                  onChange={(e) => setComposerForm({ ...composerForm, koreanName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#a6a6a6] mb-1 block">영어 이름 *</label>
                <input
                  required
                  value={composerForm.englishName}
                  onChange={(e) => setComposerForm({ ...composerForm, englishName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#a6a6a6] mb-1 block">국적 *</label>
              <input
                required
                value={composerForm.nationality}
                onChange={(e) => setComposerForm({ ...composerForm, nationality: e.target.value })}
                placeholder="예: 독일, 오스트리아"
                className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-[#a6a6a6] mb-1 block">성별 *</label>
                <select
                  value={composerForm.gender}
                  onChange={(e) => setComposerForm({ ...composerForm, gender: e.target.value as ComposerForm['gender'] })}
                  className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                >
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                  <option value="UNKNOWN">미상</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#a6a6a6] mb-1 block">출생연도 *</label>
                <input
                  required
                  type="number"
                  value={composerForm.birthYear}
                  onChange={(e) => setComposerForm({ ...composerForm, birthYear: e.target.value })}
                  placeholder="1770"
                  className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#a6a6a6] mb-1 block">사망연도</label>
                <input
                  type="number"
                  value={composerForm.deathYear}
                  onChange={(e) => setComposerForm({ ...composerForm, deathYear: e.target.value })}
                  placeholder="1827"
                  className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#a6a6a6] mb-1 block">시대 *</label>
              <select
                required
                value={composerForm.era}
                onChange={(e) => setComposerForm({ ...composerForm, era: e.target.value as ComposerForm['era'] })}
                className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
              >
                <option value="">선택하세요</option>
                <option value="MEDIEVAL_RENAISSANCE">중세/르네상스</option>
                <option value="BAROQUE">바로크</option>
                <option value="CLASSICAL">고전</option>
                <option value="ROMANTIC">낭만</option>
                <option value="MODERN_CONTEMPORARY">근현대</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#a6a6a6] mb-1 block">대륙 *</label>
              <select
                required
                value={composerForm.continent}
                onChange={(e) => setComposerForm({ ...composerForm, continent: e.target.value as ComposerForm['continent'] })}
                className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92]"
              >
                <option value="">선택하세요</option>
                <option value="EUROPE">유럽</option>
                <option value="ASIA">아시아</option>
                <option value="NORTH_AMERICA">북아메리카</option>
                <option value="SOUTH_AMERICA">남아메리카</option>
                <option value="AFRICA_OCEANIA">아프리카/오세아니아</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#a6a6a6] mb-1 block">소개 *</label>
              <textarea
                required
                rows={3}
                value={composerForm.bio}
                onChange={(e) => setComposerForm({ ...composerForm, bio: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#f4f5f7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#293a92] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={composerLoading}
              className="w-full py-3 bg-[#293a92] rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            >
              {composerLoading ? '추가 중...' : '작곡가 추가'}
            </button>
          </form>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-[#293a92]'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
