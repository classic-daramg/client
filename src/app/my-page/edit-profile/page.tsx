
"use client";
import React, { useState, useRef } from "react";
import { useUserProfileStore } from "@/store/userProfileStore";
import Image from "next/image";

export default function EditProfilePage() {
	const { profile, updateProfile, setProfileImage, resetToDefaultImage, getProfileImage } = useUserProfileStore();
	const [nickname, setNickname] = useState(profile?.nickname || "");
	const [bio, setBio] = useState(profile?.bio || "");

		const [saving, setSaving] = useState(false);
		const [showPhotoPopup, setShowPhotoPopup] = useState(false);
		const fileInputRef = useRef<HTMLInputElement>(null);

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
						formData.append("profileImage", file);
						// 실제 서버 주소로 변경 필요
						const res = await fetch("/api/upload-profile-image", {
							method: "POST",
							body: formData,
						});
						if (!res.ok) {
							// 오류 처리
							console.error("이미지 업로드 실패");
						} else {
							// 필요시 서버에서 받은 URL 등 처리
							// const data = await res.json();
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

	const handleSave = () => {
		setSaving(true);
		updateProfile({ nickname, bio });
		setTimeout(() => setSaving(false), 800);
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center" style={{ background: mainBg }}>
			{/* Card */}
			<div className="w-full max-w-[375px] min-h-screen flex flex-col items-center pt-[54px] pb-8 px-0 relative" style={{ background: mainBg }}>
				{/* Status Bar */}
				<div className="absolute bg-white h-[54px] w-full left-0 top-0 z-10" />
				{/* Header */}
				<div className="absolute bg-white flex items-center left-0 top-[54px] w-full h-[42px] px-5 z-20 border-b" style={{ borderColor: borderGray }}>
					<span className="text-[#1a1a1a] text-[16px] font-semibold mx-auto">프로필 편집</span>
				</div>
				{/* Main Card */}
				<div className="flex flex-col items-center w-full px-0 pt-[120px]">
					<div className="w-full flex flex-col items-center">
						{/* Profile Image */}
						<div className="relative w-[130px] h-[130px] mb-6 flex items-center justify-center">
							<div className="rounded-full border-4" style={{ borderColor: blue, background: cardBg, width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<Image
									src={getProfileImage() || "/icons/DefaultImage.svg"}
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
								type="text"
								value={nickname}
								onChange={e => setNickname(e.target.value)}
								maxLength={12}
								className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#293A92]/20"
								placeholder="닉네임을 입력하세요"
							/>
						</div>
						{/* Bio */}
						<div className="w-full max-w-[320px] mb-8">
							<label className="block text-[#1a1a1a] text-sm font-semibold mb-1">한 줄 소개 (최대 20자)</label>
							<input
								type="text"
								value={bio}
								onChange={e => setBio(e.target.value)}
								maxLength={20}
								className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#293A92]/20"
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
		</div>
	);
}
