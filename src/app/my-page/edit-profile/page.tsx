
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useUserProfileStore } from "@/store/userProfileStore";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { getApiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ToastNotification from '@/components/ToastNotification';

export default function EditProfilePage() {
	const { profile, updateProfile, setProfileImage, resetToDefaultImage, getProfileImage } = useUserProfileStore();
	const { accessToken } = useAuthStore();
	const router = useRouter();
	const [nickname, setNickname] = useState(profile?.nickname || "");
	const [bio, setBio] = useState(profile?.bio || "");
	const [isMounted, setIsMounted] = useState(false);

	const [saving, setSaving] = useState(false);
	const [showPhotoPopup, setShowPhotoPopup] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [saveMessage, setSaveMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

	// ========== Error Handling States ==========
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [isShaking, setIsShaking] = useState(false);
	const [errorField, setErrorField] = useState<'nickname' | 'bio' | null>(null);

	// Refs for focus management
	const nicknameRef = useRef<HTMLInputElement>(null);
	const bioRef = useRef<HTMLInputElement>(null);

	// 프로필 데이터 로드
	useEffect(() => {
		setIsMounted(true);

		const loadProfile = async () => {
			try {
				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
				};

				if (accessToken) {
					headers['Authorization'] = `Bearer ${accessToken}`;
				}

				const res = await fetch(getApiUrl('/users'), {
					method: 'GET',
					headers,
					credentials: 'include',
				});

				if (res.ok) {
					const data = await res.json();
					setNickname(data.nickname || "");
					setBio(data.bio || "");
					if (data.profileImage) {
						setProfileImage(data.profileImage);
					}
				} else {
					console.error('Failed to load profile:', res.status);
				}
			} catch (error) {
				console.error('Failed to load profile:', error);
			}
		};

		loadProfile();
	}, [accessToken, setProfileImage]);

	const profileImageSrc = isMounted ? (getProfileImage() || "/icons/DefaultImage.svg") : "/icons/DefaultImage.svg";

	// 색상 팔레트: DefaultImage.svg의 연한 회색(#F4F5F7), 진한 파랑(#293A92), 흰색, 연회색(#E5E7EB)
	const mainBg = "#F4F5F7";
	const cardBg = "#fff";
	const blue = "#293A92";
	const borderGray = "#E5E7EB";


	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			// 미리보기용으로 상태에 저장
			const reader = new FileReader();
			reader.onload = (ev) => {
				if (ev.target?.result) setProfileImage(ev.target.result as string);
			};
			reader.readAsDataURL(file);

			// 백엔드로 업로드
			try {
				const formData = new FormData();
				formData.append("images", file);
				const headers: Record<string, string> = {};
				if (accessToken) {
					headers['Authorization'] = `Bearer ${accessToken}`;
				}
				const res = await fetch(getApiUrl('/images/upload'), {
					method: "POST",
					headers,
					credentials: 'include',
					body: formData,
				});
				if (!res.ok) {
					// 오류 처리
					console.error("이미지 업로드 실패");
				} else {
					const data = await res.json();
					const uploadedImageUrl = data?.imageUrls?.[0];
					if (uploadedImageUrl) {
						setProfileImage(uploadedImageUrl);
					}
				}
			} catch (err) {
				console.error("이미지 업로드 중 오류", err);
			}
		}
		setShowPhotoPopup(false);
	};

	const handlePhotoEditClick = () => {
		setShowPhotoPopup(true);
	};

	const handleSelectFromAlbum = () => {
		setShowPhotoPopup(false);
		setTimeout(() => fileInputRef.current?.click(), 100); // allow popup to close before file dialog
	};

	const handleSetDefaultImage = () => {
		resetToDefaultImage();
		setShowPhotoPopup(false);
	};

	const handleSave = async () => {
		// 닉네임 유효성 검사
		if (!/^[a-zA-Z0-9가-힣]+$/.test(nickname) || nickname.length < 2 || nickname.length > 8) {
			setSaveMessage({
				message: '닉네임 규칙을 확인해주세요.',
				type: 'error'
			});
			return;
		}

		setSaving(true);
		setSaveMessage(null);
		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			if (accessToken) {
				headers['Authorization'] = `Bearer ${accessToken}`;
			}

			const res = await fetch(getApiUrl('/users/profile'), {
				method: 'PUT',
				headers,
				credentials: 'include',
				body: JSON.stringify({
					nickname: nickname,
					bio: bio,
					profileImageUrl: getProfileImage() !== '/icons/DefaultImage.svg' ? getProfileImage() : null,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json(); // text() 대신 json()으로 파싱 시도
				console.error('Profile save error data:', errorData);

				// COMMON_400 에러 처리 (비속어 포함 등)
				if (errorData?.code === 'COMMON_400' && errorData?.fieldErrors) {
					const firstError = errorData.fieldErrors[0];
					const message = firstError?.reason || errorData.message || '비적절한 내용이 포함되어 있습니다.';
					const field = firstError?.field; // 'nickname' or 'bio'

					setSaveMessage(null); // 기존 메시지 초기화
					setToastMessage(message);
					setShowToast(true);
					setIsShaking(true);
					alert(message);

					// 에러 필드 설정 및 포커스
					if (field === 'nickname') {
						setErrorField('nickname');
						nicknameRef.current?.focus();
					} else if (field === 'bio') {
						setErrorField('bio');
						bioRef.current?.focus();
					}

					// 쉐이크 애니메이션 0.5초 후 해제
					setTimeout(() => setIsShaking(false), 500);

					setSaving(false);
					return;
				}

				setSaveMessage({
					message: errorData.message || '프로필 저장에 실패했습니다. 다시 시도해주세요.',
					type: 'error'
				});
				return;
			}

			// 로컬 상태 업데이트
			updateProfile({ nickname, bio });
			setSaveMessage({
				message: '프로필이 성공적으로 저장되었습니다.',
				type: 'success'
			});
			router.push('/my-page');

			// 3초 후 메시지 숨기기
			setTimeout(() => setSaveMessage(null), 3000);
		} catch (error: unknown) {
			console.error('Profile save error:', error);

			// API 에러 응답 처리 (COMMON_400 등)
			// fetch API는 기본적으로 error를 throw하지 않고 ok: false로 오지만, 
			// 만약 클라이언트 라이브러리(axios 등)를 쓰거나 위에서 throw한 경우를 대비
			// 여기서는 위 fetch 로직에서 res.ok 체크 후 별도 처리가 없으므로, 
			// 아래 catch 블록은 네트워크 에러 등을 잡습니다. 
			// 하지만 res.ok가 아닐 때의 로직을 try 블록 안에서 처리해야 정확한 에러 핸들링이 가능합니다.
			// 따라서 위 try 블록 내의 res.ok 체크 부분을 수정하는 것이 좋습니다.
			// 하지만 현재 구조상 위에서 return 해버리므로, 아래 catch는 실행되지 않을 수 있습니다.
			// 정확한 구현을 위해 res.ok가 아닐 때 json()을 파싱하여 에러를 throw 하거나 처리해야 합니다.

			setSaveMessage({
				message: '프로필 저장에 실패했습니다. 다시 시도해주세요.',
				type: 'error'
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center" style={{ background: mainBg }}>
			{/* Card */}
			<div className="w-full max-w-[375px] min-h-screen flex flex-col items-center pt-[54px] pb-8 px-0 relative" style={{ background: mainBg }}>
				{/* Status Bar */}
				<div className="absolute bg-white h-[54px] w-full left-0 top-0 z-10" />
				{/* Header */}
				<div className="absolute bg-white flex items-center left-0 top-[54px] w-full h-[42px] px-5 z-20 border-b" style={{ borderColor: borderGray }}>
					<button
						type="button"
						onClick={() => router.back()}
						className="absolute left-5"
						aria-label="뒤로가기"
					>
						<Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
					</button>
					<span className="text-[#1a1a1a] text-[16px] font-semibold mx-auto">프로필 편집</span>
				</div>
				{/* Main Card */}
				<div className="flex flex-col items-center w-full px-0 pt-[120px]">
					<div className="w-full flex flex-col items-center">
						{/* Profile Image */}
						<div className="relative w-[130px] h-[130px] mb-6 flex items-center justify-center">
							<div className="rounded-full border-4" style={{ borderColor: blue, background: cardBg, width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<Image
									src={profileImageSrc}
									alt="프로필 이미지"
									width={120}
									height={120}
									className="rounded-full object-cover bg-[#f4f5f7]"
									priority
								/>
							</div>
							<input
								id="profile-upload"
								type="file"
								accept="image/*"
								className="hidden"
								ref={fileInputRef}
								onChange={handleImageChange}
							/>
							<button
								type="button"
								className="absolute left-1/2 -translate-x-1/2 bottom-[-28px] text-xs text-[#293A92] underline font-medium"
								onClick={handlePhotoEditClick}
							>
								프로필 사진 편집
							</button>
							{/* 프로필 사진 편집 팝업 */}
							{showPhotoPopup && (
								<div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'transparent' }} onClick={() => setShowPhotoPopup(false)}>
									<div className="w-full max-w-[375px] bg-white rounded-t-2xl shadow-lg p-0 pb-4 animate-slideup" style={{ minHeight: 160 }} onClick={e => e.stopPropagation()}>
										<div className="flex flex-col divide-y divide-[#F4F5F7]">
											<button
												className="w-full py-4 text-base text-[#293A92] font-semibold hover:bg-[#F4F5F7] transition-colors"
												onClick={handleSelectFromAlbum}
											>
												앨범에서 선택
											</button>
											<button
												className="w-full py-4 text-base text-[#4C4C4C] font-semibold hover:bg-[#F4F5F7] transition-colors"
												onClick={handleSetDefaultImage}
											>
												기본 이미지로 변경
											</button>
										</div>
										<button
											className="w-full py-3 text-[#A6A6A6] text-base font-medium hover:bg-[#F4F5F7] rounded-b-2xl mt-2"
											onClick={() => setShowPhotoPopup(false)}
										>
											취소
										</button>
									</div>
								</div>
							)}
						</div>
						{/* Nickname */}
						<div className="w-full max-w-[320px] mb-4">
							<label className="block text-[#1a1a1a] text-sm font-semibold mb-1">닉네임</label>
							<input
								ref={nicknameRef}
								type="text"
								value={nickname}
								onChange={e => {
									setNickname(e.target.value);
									if (errorField === 'nickname') setErrorField(null);
								}}
								maxLength={8}
								className={`w-full px-4 py-2 border rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#293A92]/20 transition-all duration-200 ${errorField === 'nickname' ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB]'
									} ${isShaking && errorField === 'nickname' ? 'animate-shake' : ''}`}
								placeholder="닉네임을 입력하세요"
							/>
						</div>

						{/* Nickname Convention Rules */}
						<div className="w-full max-w-[320px] mb-6 p-3 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB]">
							<h3 className="text-xs font-semibold text-[#4C4C4C] mb-2">닉네임 생성 규칙</h3>
							<ul className="space-y-1.5">
								<li className={`text-xs flex items-center gap-1.5 ${nickname.length >= 2 && nickname.length <= 8 ? 'text-[#293A92] font-medium' : 'text-[#A6A6A6]'}`}>
									<div className={`w-1.5 h-1.5 rounded-full ${nickname.length >= 2 && nickname.length <= 8 ? 'bg-[#293A92]' : 'bg-[#D9D9D9]'}`} />
									2자 이상 8자 이하
								</li>
								<li className={`text-xs flex items-center gap-1.5 ${/^[a-zA-Z0-9가-힣]*$/.test(nickname) && nickname.length > 0 ? 'text-[#293A92] font-medium' : 'text-[#A6A6A6]'}`}>
									<div className={`w-1.5 h-1.5 rounded-full ${/^[a-zA-Z0-9가-힣]*$/.test(nickname) && nickname.length > 0 ? 'bg-[#293A92]' : 'bg-[#D9D9D9]'}`} />
									한글, 영문, 숫자만 사용 가능
								</li>
								<li className={`text-xs flex items-center gap-1.5 ${!/\s/.test(nickname) && nickname.length > 0 ? 'text-[#293A92] font-medium' : 'text-[#A6A6A6]'}`}>
									<div className={`w-1.5 h-1.5 rounded-full ${!/\s/.test(nickname) && nickname.length > 0 ? 'bg-[#293A92]' : 'bg-[#D9D9D9]'}`} />
									공백 및 특수문자 불가
								</li>
							</ul>
						</div>

						{/* Bio */}
						<div className="w-full max-w-[320px] mb-8">
							<label className="block text-[#1a1a1a] text-sm font-semibold mb-1">한 줄 소개 (최대 12자)</label>
							<input
								ref={bioRef}
								type="text"
								value={bio}
								onChange={e => {
									setBio(e.target.value);
									if (errorField === 'bio') setErrorField(null);
								}}
								maxLength={12}
								className={`w-full px-4 py-2 border rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#293A92]/20 transition-all duration-200 ${errorField === 'bio' ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB]'
									} ${isShaking && errorField === 'bio' ? 'animate-shake' : ''}`}
								placeholder="한 줄 소개를 입력하세요"
							/>
						</div>
						{/* Save Button */}
						<button
							onClick={handleSave}
							disabled={saving}
							className="w-full max-w-[320px] py-3 bg-[#293A92] text-white rounded-lg font-semibold text-base shadow-md hover:bg-[#1f2d6f] transition-colors disabled:opacity-60"
						>
							{saving ? "저장 중..." : "저장"}
						</button>
					</div>
				</div>
			</div>
			{saveMessage && (
				<div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg text-white font-semibold text-sm max-w-[300px] z-50 ${saveMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					}`}>
					{saveMessage.message}
				</div>
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
