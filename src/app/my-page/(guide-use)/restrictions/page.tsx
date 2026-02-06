'use client';

import React from 'react';

const backIcon = 'http://localhost:3845/assets/f6fb8db06e8bb7eb7b96d5a76189474699ecdd7e.svg';

export default function Restrictions() {
	return (
		<div className="w-full min-h-screen bg-white">
			<div className="w-full bg-white">
				<div className="h-[54px] pt-[21px]" />
				<div className="bg-white px-[20px] pb-[12px]">
					<div className="flex items-center gap-[4px] h-[30px]">
						<button type="button" className="flex size-[20px] items-center justify-center">
							<img src={backIcon} alt="뒤로가기" className="block h-[15px] w-[7px]" />
						</button>
						<h1 className="text-[16px] font-semibold text-[#1a1a1a]">이용 제한 안내</h1>
					</div>
				</div>
			</div>
			<div className="h-[10px] w-full bg-[#f4f5f7]" />
			<div className="px-[20px] pt-[20px] pb-[28px] text-[12px] leading-[18px] text-[#a6a6a6]">
				<p className="text-[#4c4c4c]">클래식 듣는 다람쥐는 편안한 커뮤니티 환경을 조성하기 위해</p>
				<p className="text-[#4c4c4c]">상시 모니터링 및 신고 제도 운영을 통해 부정행위를 발견하고</p>
				<p className="text-[#4c4c4c]">이용을 제한하는 정책을 운영하고 있습니다.</p>
				<div className="h-[12px]" />
				<p className="font-bold text-[#4c4c4c]">부정행위 적발 시 서비스 이용약관에 근거하여 이용 제한이 적용되며,</p>
				<p className="font-bold text-[#4c4c4c]">이용 제한 내역은 회원의 이메일을 통해 발송됩니다.</p>
				<div className="h-[12px]" />
				<ul className="list-disc pl-[18px]">
					<li className="font-bold text-[#4c4c4c]">1회 적발 시 게시물 및 댓글 작성 7일 간 중단</li>
					<li className="font-bold text-[#4c4c4c]">2회 적발 시 14일 중단</li>
					<li className="font-bold text-[#4c4c4c]">3회 이상 적발 시 게시글 및 댓글 작성 중단 30일 부여</li>
					<ul className="list-disc pl-[18px]">
						<li className="font-bold text-[#4c4c4c]">
							가입 이메일로 제재 사실 및 이의 신청 고지를 통해<br />소명 기회 부여
						</li>
						<li className="font-bold text-[#4c4c4c]">미소명 혹은 부적절한 소명 시 회원탈퇴 처리</li>
					</ul>
				</ul>
				<div className="h-[12px]" />
				<p>관련 이용약관</p>
				<div className="h-[12px]" />
				<p>제6조 (회원 탈퇴 및 자격 상실 등)</p>
				<ol className="list-decimal pl-[18px]">
					<li>회원은 “서비스”에 언제든지 탈퇴를 요청할 수 있으며 “서비스”는 즉시 회원탈퇴를 처리합니다. 이때, 회원탈퇴 처리된 경우 31일 간 재가입이 제한됩니다.</li>
					<li>회원이 다음 각 호의 사유에 해당하는 경우, “서비스”는 회원자격을 제한 및 정지시킬 수 있습니다.</li>
					<ol className="list-decimal pl-[18px]">
						<li>가입 신청 시에 허위 내용을 등록한 경우</li>
						<li>다른 사람의 “서비스” 이용을 방해하거나 그 정보를 도용하는 등 서비스 질서를 위협하는 경우</li>
						<li>서비스에 타인의 권리를 침해하거나 부적절한 콘텐츠를 게시한 경우</li>
						<li>“서비스”를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
					</ol>
					<li>“서비스”가 회원 자격을 제한 및 정지 시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 “서비스”는 회원자격을 상실시킬 수 있습니다.</li>
					<li>“서비스”가 회원자격을 상실시키는 경우에는 회원등록을 말소합니다. 이 경우 회원에게 이를 통지하고, 회원등록 말소 전에 최소한 30일 이상의 기간을 정하여 소명할 기회를 부여합니다.</li>
				</ol>
				<div className="h-[12px]" />
				<p>제11조 (이용자의 의무)</p>
				<p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
				<ol className="list-decimal pl-[18px]">
					<li>신청 또는 변경 시 허위 내용의 등록</li>
					<li>외부 공개가 금지된 공연의 영상 촬영본 및 녹음본 업로드</li>
					<li>타인의 정보 도용</li>
					<li>“서비스”에 게시된 정보의 변경</li>
					<li>“서비스”가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
					<li>“서비스” 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
					<li>“서비스” 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
					<li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 “서비스”에 공개 또는 게시하는 행위</li>
				</ol>
			</div>
		</div>
	);
}
